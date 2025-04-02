// daily-data-collector.ts

import { format } from "date-fns";
import { exit } from "process";
import { getProbableLineups } from "../mlb/game/lineups";
import {
  getBallparkFactors,
  getSchedule,
  getTeamStats,
} from "../mlb/schedule/schedule";
import { getGameEnvironmentData } from "../mlb/weather/weather";
import { saveToJsonFile } from "./core/file-utils";
import { analyzeBatters } from "./dfs-analysis/batters/batter-analysis";
import { analyzeStartingPitchers } from "./dfs-analysis/pitchers/starting-pitcher-analysis";
import { populateMlbIds } from "./draftkings/player-mapping";
import { getDKSalaries } from "./draftkings/salaries";
import type { DailyMLBData } from "./types/core";
import type { BatterInfo } from "./types/analysis";

// Constants for placeholder values
const PLACEHOLDER = {
  NUMERIC: null,
  TEXT: "TBD",
  BOOLEAN: false,
  UNKNOWN: undefined,
};

// Add multi-season support
const SUPPORTED_SEASONS = ["2024", "2025"];

/**
 * Collect and analyze daily DFS data for MLB games
 * @param date Optional date string in YYYY-MM-DD format. If not provided, uses today's date.
 * @param maxGames Optional number to limit the games processed (for testing)
 * @param outputDir Optional subdirectory within data/ to save the output files
 * @param shouldExit Whether to exit the process after completion
 * @returns Promise<DailyMLBData> Daily MLB data including games, stats, and analysis
 */
export async function collectDailyDFSData(
  date?: string,
  maxGames?: number,
  outputDir?: string,
  shouldExit: boolean = false
): Promise<DailyMLBData> {
  const targetDate = date || format(new Date(), "yyyy-MM-dd");
  console.log(`Starting data collection for ${targetDate}...`);
  if (maxGames) {
    console.log(`Limiting collection to ${maxGames} game(s) for testing`);
  }
  if (outputDir) {
    console.log(`Output will be saved to data/${outputDir}/`);
  }

  try {
    // Load DraftKings salaries first to create maps for both batters and pitchers
    const dkSalaries = await getDKSalaries();
    const dkBatters = new Map<number, any>();
    const dkPitchers = new Map<number, any>();

    // Process DraftKings data - separate batters and pitchers
    console.log("\nProcessing DraftKings data...");
    for (const [mlbId, entry] of dkSalaries.entries()) {
      const player = {
        mlbId: mlbId,
        id: entry.ID,
        name: entry.Name,
        position: entry.Position,
        salary: entry.Salary,
        avgPointsPerGame: entry.AvgPointsPerGame,
        team: entry.TeamAbbrev,
      };

      // Skip invalid MLB IDs (negative temporary IDs)
      if (mlbId < 0) {
        console.log(
          `Skipping player with temporary ID: ${entry.Name} (${mlbId})`
        );
        continue;
      }

      if (entry.Position === "SP" || entry.Position === "RP") {
        dkPitchers.set(mlbId, player);
      } else {
        dkBatters.set(mlbId, player);
      }
    }
    console.log(
      `Found ${dkPitchers.size} pitchers and ${dkBatters.size} batters in DraftKings data`
    );

    // Get schedule data
    const scheduleResponse = await getSchedule(targetDate);
    let gameData =
      scheduleResponse.dates?.[0]?.games.map((game) => ({
        gameId: game.gamePk,
        gameTime: game.gameDate,
        status: game.status,
        homeTeam: {
          id: game.teams.home.team.id,
          name: game.teams.home.team.name,
        },
        awayTeam: {
          id: game.teams.away.team.id,
          name: game.teams.away.team.name,
        },
        venue: {
          id: game.venue.id,
          name: game.venue.name,
        },
        lineups: {
          away: [],
          home: [],
        },
        pitchers: {
          away: game.teams.away.probablePitcher?.id
            ? {
                id: game.teams.away.probablePitcher.id,
                fullName: game.teams.away.probablePitcher.fullName,
              }
            : undefined,
          home: game.teams.home.probablePitcher?.id
            ? {
                id: game.teams.home.probablePitcher.id,
                fullName: game.teams.home.probablePitcher.fullName,
              }
            : undefined,
        },
        environment: {
          temperature: 0,
          windSpeed: 0,
          windDirection: "",
          isOutdoor: true,
        },
        teamStats: {
          home: {
            hitting: {},
            pitching: {},
          },
          away: {
            hitting: {},
            pitching: {},
          },
        },
        ballpark: {
          overall: 1,
          types: {
            singles: 1,
            doubles: 1,
            triples: 1,
            homeRuns: 1,
            runs: 1,
          },
          handedness: {
            rHB: 1,
            lHB: 1,
          },
        },
      })) || [];

    // Limit games if maxGames is specified
    if (maxGames && gameData.length > maxGames) {
      console.log(`Limiting from ${gameData.length} to ${maxGames} game(s)`);
      gameData = gameData.slice(0, maxGames);
    }

    // Initialize data object with required properties
    const data: DailyMLBData = {
      date: targetDate,
      games: gameData,
      count: 0,
      collectTimestamp: new Date(),
      seasons: SUPPORTED_SEASONS,
    };

    // Only fetch additional data if we have games
    if (gameData.length > 0) {
      // Collect additional data in parallel for efficiency
      const [environment, homeTeamStats, awayTeamStats, ballparkFactors] =
        await Promise.all([
          // Get weather and venue environment data
          getGameEnvironmentData({
            gamePk: gameData[0].gameId.toString(),
          }).catch((error: Error) => {
            console.warn(
              `Failed to get environment data for game ${gameData[0].gameId}: ${error.message}`
            );
            return {
              temperature: PLACEHOLDER.NUMERIC,
              windSpeed: PLACEHOLDER.NUMERIC,
              windDirection: PLACEHOLDER.TEXT,
              precipitation: PLACEHOLDER.NUMERIC,
              isOutdoor: PLACEHOLDER.BOOLEAN,
            };
          }),

          // Get team statistics for both teams
          getTeamStats(gameData[0].homeTeam.id, 2025).catch((error: Error) => {
            console.warn(
              `Failed to get team stats for ${gameData[0].homeTeam.name}: ${error.message}`
            );
            return null;
          }),

          getTeamStats(gameData[0].awayTeam.id, 2025).catch((error: Error) => {
            console.warn(
              `Failed to get team stats for ${gameData[0].awayTeam.name}: ${error.message}`
            );
            return null;
          }),

          // Get ballpark factors for this venue
          getBallparkFactors(gameData[0].venue.id).catch((error: Error) => {
            console.warn(
              `Failed to get ballpark factors for ${gameData[0].venue.name}: ${error.message}`
            );
            return {
              overall: PLACEHOLDER.NUMERIC,
              types: {
                singles: PLACEHOLDER.NUMERIC,
                doubles: PLACEHOLDER.NUMERIC,
                triples: PLACEHOLDER.NUMERIC,
                homeRuns: PLACEHOLDER.NUMERIC,
                runs: PLACEHOLDER.NUMERIC,
              },
              handedness: {
                rHB: PLACEHOLDER.NUMERIC,
                lHB: PLACEHOLDER.NUMERIC,
              },
            };
          }),
        ]);

      // Update game data with collected information
      data.games = data.games.map((game) => ({
        ...game,
        environment: environment || game.environment,
        teamStats: {
          home: homeTeamStats || game.teamStats.home,
          away: awayTeamStats || game.teamStats.away,
        },
        ballpark: ballparkFactors || game.ballpark,
      }));

      // Get probable lineups for each game
      for (const game of data.games) {
        try {
          const lineups = await getProbableLineups({
            gamePk: game.gameId.toString(),
          });
          game.lineups = lineups;
        } catch (error) {
          console.warn(
            `Failed to get lineups for game ${game.gameId}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    } else {
      console.log(`No games found for date: ${targetDate}`);
    }

    // Analyze starting pitchers
    console.log("\nStarting pitcher analysis...");
    const validGames = data.games.filter(
      (game) =>
        (game.pitchers.home?.id && game.pitchers.home.id > 0) ||
        (game.pitchers.away?.id && game.pitchers.away.id > 0)
    );
    const pitcherAnalysis = await analyzeStartingPitchers(validGames);

    // Add DraftKings data to pitcher analysis
    let matchedPitchers = 0;
    pitcherAnalysis.forEach((pitcher) => {
      const dkPlayer = dkPitchers.get(pitcher.pitcherId);
      if (dkPlayer) {
        matchedPitchers++;
        pitcher.draftKings = {
          draftKingsId: dkPlayer.id,
          salary: dkPlayer.salary,
          positions: dkPlayer.position ? [dkPlayer.position] : [],
          avgPointsPerGame: dkPlayer.avgPointsPerGame,
        };
        console.log(
          `Matched pitcher: ${pitcher.name} - Salary: ${dkPlayer.salary}`
        );
      } else {
        console.log(
          `No DraftKings data found for pitcher: ${pitcher.name} (ID: ${pitcher.pitcherId})`
        );
        // Set default DraftKings data for unmatched pitchers
        pitcher.draftKings = {
          draftKingsId: null,
          salary: 0,
          positions: ["SP"], // Default to starting pitcher
          avgPointsPerGame: 0,
        };
      }
    });
    console.log(
      `Matched ${matchedPitchers} out of ${pitcherAnalysis.length} pitchers with DraftKings data`
    );

    // Save pitcher analysis
    const pitcherOutputPath = `${targetDate}-pitchers.json`;
    await saveToJsonFile(pitcherOutputPath, pitcherAnalysis, outputDir);
    console.log(
      `\nSaved pitcher analysis to ${pitcherOutputPath} (${pitcherAnalysis.length} entries)`
    );

    // Log sample of pitcher analysis
    if (pitcherAnalysis.length > 0) {
      console.log("\nSample pitcher analysis:");
      const samplePitcher = pitcherAnalysis[0];
      console.log(`Name: ${samplePitcher.name}`);
      console.log(`Team: ${samplePitcher.team}`);
      console.log(`Opponent: ${samplePitcher.opponent}`);
      console.log(
        `Expected Points: ${samplePitcher.projections.dfsProjection.expectedPoints}`
      );
      console.log(
        `Win Probability: ${samplePitcher.projections.winProbability}`
      );
      console.log(
        `Expected Strikeouts: ${samplePitcher.projections.expectedStrikeouts}`
      );
      console.log(
        `Expected Innings: ${samplePitcher.projections.expectedInnings}`
      );
    }

    // Populate MLB IDs
    const mlbGames = gameData.map((game) => ({
      gamePk: game.gameId,
      gameDate: game.gameTime,
      status: game.status,
      teams: {
        away: {
          team: game.awayTeam,
          probablePitcher: game.pitchers?.away
            ? {
                id: game.pitchers.away.id,
                fullName: game.pitchers.away.fullName,
              }
            : undefined,
        },
        home: {
          team: game.homeTeam,
          probablePitcher: game.pitchers?.home
            ? {
                id: game.pitchers.home.id,
                fullName: game.pitchers.home.fullName,
              }
            : undefined,
        },
      },
      venue: game.venue,
      lineups: game.lineups,
      pitchers: game.pitchers,
      environment: game.environment,
    }));
    populateMlbIds(mlbGames);

    // Analyze batters
    console.log("\nStarting batter analysis...");
    
    // Process each batter separately by game
    const allBatterAnalysis = [];
    
    // Group batters by game
    const battersByGame = new Map<string, BatterInfo[]>();
    Array.from(dkBatters.values()).forEach(batter => {
      if (!batter.gameId) return;
      
      const gameIdStr = batter.gameId.toString();
      if (!battersByGame.has(gameIdStr)) {
        battersByGame.set(gameIdStr, []);
      }
      battersByGame.get(gameIdStr)?.push(batter);
    });
    
    // Analyze batters for each game
    for (const [gameId, batters] of battersByGame.entries()) {
      const gameAnalysis = await analyzeBatters(gameId, batters);
      allBatterAnalysis.push(...gameAnalysis);
    }
    
    const batterAnalysis = allBatterAnalysis;
    // Add DraftKings data to batter analysis
    let matchedBatters = 0;
    batterAnalysis.forEach((batter) => {
      const dkPlayer = dkBatters.get(batter.batterId);
      if (dkPlayer) {
        matchedBatters++;
        batter.draftKings = {
          draftKingsId: dkPlayer.id,
          salary: dkPlayer.salary,
          positions: dkPlayer.position ? [dkPlayer.position] : [],
          avgPointsPerGame: dkPlayer.avgPointsPerGame,
        };
        console.log(
          `Matched batter: ${batter.name} - Salary: ${dkPlayer.salary}`
        );
      } else {
        console.log(
          `No DraftKings data found for batter: ${batter.name} (ID: ${batter.batterId})`
        );
        // Set default DraftKings data for unmatched batters
        batter.draftKings = {
          draftKingsId: null,
          salary: 0,
          positions: [],
          avgPointsPerGame: 0,
        };
      }
    });
    console.log(
      `Matched ${matchedBatters} out of ${batterAnalysis.length} batters with DraftKings data`
    );

    await saveToJsonFile(
      `${targetDate}-batters.json`,
      batterAnalysis,
      outputDir
    );

    // Update count
    data.count = batterAnalysis.length;

    // Save all data to JSON files
    await Promise.all([
      saveToJsonFile(`${targetDate}-data.json`, data, outputDir),
      saveToJsonFile(`${targetDate}-pitchers.json`, pitcherAnalysis, outputDir),
      saveToJsonFile(`${targetDate}-batters.json`, batterAnalysis, outputDir),
    ]);

    // Clean exit if requested
    if (shouldExit) {
      // Give a small delay to ensure all file writes are complete
      setTimeout(() => {
        exit(0);
      }, 100);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error collecting daily DFS data: ${error.message}`);
    } else {
      console.error("Unknown error collecting daily DFS data");
    }
    if (shouldExit) {
      exit(1);
    }
    throw error;
  }
}

// This function has been removed since collectDailyDFSData can be called directly
// with a specific date or today's date.
// If needed, call collectDailyDFSData(format(new Date(), "yyyy-MM-dd"), maxGames, outputDir, shouldExit)
// to achieve the same result as the previous runDailyDataCollection function.
