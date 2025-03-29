// daily-data-collector.ts

import {
  getSchedule,
  getTeamStats,
  getBallparkFactors,
} from "../mlb/schedule/schedule";
import { getProbableLineups } from "../mlb/game/lineups";
import { getGameEnvironmentData } from "../mlb/weather/weather";
import { analyzeStartingPitchers } from "./dfs-analysis/starting-pitcher-analysis";
import { analyzeBatters } from "./dfs-analysis/batter-analysis";
import type { ProbableLineup } from "./core/types";
import { format } from "date-fns";
import type {
  MLBScheduleResponse,
  MLBGame,
  DailyMLBData,
  TeamStats,
} from "./core/types";
import { getDKSalaries } from "./draftkings/salaries";
import { saveToJsonFile } from "./core/file-utils";

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
 * Comprehensive DFS data collection for daily analysis
 * Fetches schedule, lineups, weather, and venue data for all games
 */
async function collectDailyDFSData(date?: string) {
  // Format date as YYYY-MM-DD or use today's date
  const targetDate = date || new Date().toISOString().split("T")[0];
  console.log(`Collecting DFS data for ${targetDate}...`);

  try {
    // 1. Get schedule data for today's games
    const scheduleData = await getSchedule(targetDate);

    if (!scheduleData.dates || scheduleData.dates.length === 0) {
      console.log(`No games scheduled for ${targetDate}`);
      return { games: [], date: targetDate };
    }

    const games = scheduleData.dates[0].games;
    console.log(`Found ${games.length} games scheduled for ${targetDate}`);

    // 2. Process each game to gather comprehensive data
    const gameData = await Promise.all(
      games.map(async (game) => {
        const gameId = game.gamePk.toString();

        // Extract basic game data
        const basicData = {
          gameId: game.gamePk,
          gameTime: new Date(game.gameDate),
          status: game.status.detailedState,
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
        };

        // Collect additional data in parallel for efficiency
        const [
          lineups,
          environment,
          homeTeamStats,
          awayTeamStats,
          ballparkFactors,
        ] = await Promise.all([
          // Get probable lineups including batting order
          getProbableLineups({ gamePk: gameId }).catch((error: Error) => {
            console.warn(
              `Failed to get lineups for game ${gameId}: ${error.message}`
            );
            return {
              away: [],
              home: [],
              awayBatters: [],
              homeBatters: [],
              confirmed: PLACEHOLDER.BOOLEAN,
            } as ProbableLineup;
          }),

          // Get weather and venue environment data
          getGameEnvironmentData({ gamePk: gameId }).catch((error: Error) => {
            console.warn(
              `Failed to get environment data for game ${gameId}: ${error.message}`
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
          getTeamStats(game.teams.home.team.id, 2025).catch((error: Error) => {
            console.warn(
              `Failed to get team stats for ${game.teams.home.team.name}: ${error.message}`
            );
            return null;
          }),

          getTeamStats(game.teams.away.team.id, 2025).catch((error: Error) => {
            console.warn(
              `Failed to get team stats for ${game.teams.away.team.name}: ${error.message}`
            );
            return null;
          }),

          // Get ballpark factors for this venue
          getBallparkFactors(game.venue.id).catch((error: Error) => {
            console.warn(
              `Failed to get ballpark factors for ${game.venue.name}: ${error.message}`
            );
            return {
              overall: PLACEHOLDER.NUMERIC,
              types: {
                homeRuns: PLACEHOLDER.NUMERIC,
                runs: PLACEHOLDER.NUMERIC,
              },
            };
          }),
        ]);

        // Collect multi-season team stats
        const [
          homeTeamStats2024,
          homeTeamStats2025,
          awayTeamStats2024,
          awayTeamStats2025,
        ] = await Promise.all([
          getTeamStats(game.teams.home.team.id, 2024).catch((error) => {
            console.warn(
              `Failed to get 2024 team stats for ${game.teams.home.team.name}: ${error.message}`
            );
            return null;
          }),
          getTeamStats(game.teams.home.team.id, 2025).catch((error) => {
            console.warn(
              `Failed to get 2025 team stats for ${game.teams.home.team.name}: ${error.message}`
            );
            return null;
          }),
          getTeamStats(game.teams.away.team.id, 2024).catch((error) => {
            console.warn(
              `Failed to get 2024 team stats for ${game.teams.away.team.name}: ${error.message}`
            );
            return null;
          }),
          getTeamStats(game.teams.away.team.id, 2025).catch((error) => {
            console.warn(
              `Failed to get 2025 team stats for ${game.teams.away.team.name}: ${error.message}`
            );
            return null;
          }),
        ]);

        // Identify starting pitchers from schedule or lineups
        let homePitcher = game.teams.home.probablePitcher || null;
        let awayPitcher = game.teams.away.probablePitcher || null;

        // Combine all data into a comprehensive game object
        return {
          ...basicData,
          lineups: {
            home: lineups.home || [],
            away: lineups.away || [],
            homeBatters: lineups.homeBatters || [],
            awayBatters: lineups.awayBatters || [],
            confirmed: lineups.confirmed || PLACEHOLDER.BOOLEAN,
          },
          pitchers: {
            home: homePitcher,
            away: awayPitcher,
          },
          environment: environment || {
            temperature: PLACEHOLDER.NUMERIC,
            windSpeed: PLACEHOLDER.NUMERIC,
            windDirection: PLACEHOLDER.TEXT,
            precipitation: PLACEHOLDER.NUMERIC,
            isOutdoor: PLACEHOLDER.BOOLEAN,
          },
          teamStats: {
            home: {
              "2024": homeTeamStats2024 || null,
              "2025": homeTeamStats2025 || null,
            },
            away: {
              "2024": awayTeamStats2024 || null,
              "2025": awayTeamStats2025 || null,
            },
          },
          ballpark: ballparkFactors || {
            overall: PLACEHOLDER.NUMERIC,
            types: {
              homeRuns: PLACEHOLDER.NUMERIC,
              runs: PLACEHOLDER.NUMERIC,
            },
          },
        };
      })
    );

    // 3. Organize and return the collected data
    return {
      date: targetDate,
      games: gameData,
      count: gameData.length,
      collectTimestamp: new Date(),
      seasons: SUPPORTED_SEASONS,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error collecting daily DFS data: ${error.message}`);
    } else {
      console.error("Unknown error collecting daily DFS data");
    }
    throw error;
  }
}

/**
 * Run daily data collection and analysis
 */
export async function runDailyDataCollection(): Promise<DailyMLBData> {
  const date = format(new Date(), "yyyy-MM-dd");
  console.log(`Starting daily data collection for ${date}...`);

  // Load DraftKings salaries
  const dkSalaries = await getDKSalaries();

  // Collect game data
  const data = await collectDailyDFSData(date);

  // Save raw data
  await saveToJsonFile(`mlb-data-${date}.json`, data);

  // Analyze pitchers with DraftKings data
  const pitcherAnalysis = await analyzeStartingPitchers(data.games);
  // Add DraftKings data to pitcher analysis
  pitcherAnalysis.forEach((pitcher) => {
    const dkData = dkSalaries.get(pitcher.pitcherId.toString());
    if (dkData) {
      pitcher.draftKings = {
        draftKingsId: parseInt(dkData.draftKingsId),
        salary: dkData.salary,
        positions: [dkData.position],
        avgPointsPerGame: dkData.avgPointsPerGame,
      };
    }
  });
  await saveToJsonFile(`mlb-pitchers-${date}.json`, pitcherAnalysis);

  // Analyze batters with DraftKings data
  const batterAnalysis = await analyzeBatters(data.games);
  // Add DraftKings data to batter analysis
  batterAnalysis.forEach((batter) => {
    const dkData = dkSalaries.get(batter.batterId.toString());
    if (dkData) {
      batter.draftKings = {
        draftKingsId: parseInt(dkData.draftKingsId),
        salary: dkData.salary,
        positions: [dkData.position],
        avgPointsPerGame: dkData.avgPointsPerGame,
      };
    }
  });
  await saveToJsonFile(`mlb-batters-${date}.json`, batterAnalysis);

  return data;
}

// Export the main functions
export { collectDailyDFSData };
