// daily-data-collector.ts

import { getSchedule, getTeamStats } from "../mlb/schedule/schedule";
import { getProbableLineups } from "../mlb/game/lineups";
import {
  getGameEnvironmentData,
  getBallparkFactors,
} from "../mlb/weather/weather";
import {
  analyzeStartingPitchersForToday,
  analyzeStartingPitchers,
} from "./dfs-analysis/starting-pitcher-analysis";
import {
  analyzeBatters,
  analyzeBattersForToday,
} from "./dfs-analysis/batter-analysis";
import type { ProbableLineup } from "./core/types";

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
    const scheduleData = await getSchedule({ date: targetDate });

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
          getTeamStats(game.teams.home.team.id).catch((error: Error) => {
            console.warn(
              `Failed to get team stats for ${game.teams.home.team.name}: ${error.message}`
            );
            return null;
          }),

          getTeamStats(game.teams.away.team.id).catch((error: Error) => {
            console.warn(
              `Failed to get team stats for ${game.teams.away.team.name}: ${error.message}`
            );
            return null;
          }),

          // Get ballpark factors for this venue
          getBallparkFactors({
            venueId: game.venue.id,
            season: new Date().getFullYear().toString(),
          }).catch((error: Error) => {
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
              "2024": homeTeamStats2024?.stats || null,
              "2025": homeTeamStats2025?.stats || null,
            },
            away: {
              "2024": awayTeamStats2024?.stats || null,
              "2025": awayTeamStats2025?.stats || null,
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
 * Usage example - collect today's data and save to JSON file
 */
async function runDailyDataCollection() {
  try {
    const todayData = await collectDailyDFSData();

    // Create data directory if it doesn't exist
    const fs = require("fs");
    const path = require("path");
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Save to JSON file with date in filename
    const date = todayData.date;
    const filename = path.join(dataDir, `mlb-data-${date}.json`);
    fs.writeFileSync(filename, JSON.stringify(todayData, null, 2));

    console.log(
      `Successfully collected data for ${todayData.count} games on ${todayData.date}`
    );
    console.log(`Data saved to: ${filename}`);
    console.log("Data sample:", JSON.stringify(todayData.games[0], null, 2));

    // Analyze starting pitchers and save to separate JSON file
    console.log("\nAnalyzing starting pitchers...");
    const pitcherAnalysis = await analyzeStartingPitchers(todayData.games);

    // Save pitcher analysis to JSON file
    const pitcherFilename = path.join(dataDir, `mlb-pitchers-${date}.json`);
    fs.writeFileSync(
      pitcherFilename,
      JSON.stringify(
        {
          date: todayData.date,
          analysisTimestamp: new Date(),
          pitchers: pitcherAnalysis,
        },
        null,
        2
      )
    );

    console.log(`Pitcher analysis saved to: ${pitcherFilename}`);

    // Analyze batters and save to separate JSON file
    console.log("\nAnalyzing batters...");
    const batterAnalysis = await analyzeBatters(todayData.games);

    // Save batter analysis to JSON file
    const batterFilename = path.join(dataDir, `mlb-batters-${date}.json`);
    fs.writeFileSync(
      batterFilename,
      JSON.stringify(
        {
          date: todayData.date,
          analysisTimestamp: new Date(),
          batters: batterAnalysis,
        },
        null,
        2
      )
    );

    console.log(`Batter analysis saved to: ${batterFilename}`);

    // Still run the console output version for immediate feedback
    await analyzeStartingPitchersForToday(todayData.games);
    await analyzeBattersForToday(todayData.games);

    return todayData;
  } catch (error) {
    console.error("Failed to collect daily data:", error);
    return null;
  }
}

// Export the main functions
export { collectDailyDFSData, runDailyDataCollection };
