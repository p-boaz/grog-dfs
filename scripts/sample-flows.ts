/**
 * Sample Flow Script
 *
 * This script simulates key app flows to capture real API responses
 * across multiple interconnected endpoints.
 *
 * Run after instrumenting the API client:
 * pnpm tsx scripts/sample-flows.ts
 */

import { getBallparkFactors } from "../lib/mlb/core/team-mapping";
import { analyzeBatters } from "../lib/mlb/dfs-analysis/batter-analysis";
import { calculateHitProjections } from "../lib/mlb/dfs-analysis/batters/hits";
import { estimateHomeRunProbability } from "../lib/mlb/dfs-analysis/batters/home-runs";
import { calculatePitcherDfsProjection } from "../lib/mlb/dfs-analysis/pitchers/starting-pitcher-analysis";
import { estimateStolenBaseProbability } from "../lib/mlb/dfs-analysis/stolen-bases";
import { getGameFeed } from "../lib/mlb/game/game-feed";
import { getBatterStats } from "../lib/mlb/player/batter-stats";
import { getMatchupData } from "../lib/mlb/player/matchups";
import { getPitcherStats } from "../lib/mlb/player/pitcher-stats";
import { getSchedule } from "../lib/mlb/schedule/schedule";
import { getGameEnvironmentData } from "../lib/mlb/weather/weather";

// Sample data
const SAMPLE_DATE = new Date();
const SAMPLE_BATTER_IDS = [665742, 641877, 608336]; // Trout, Judge, Betts
const SAMPLE_PITCHER_IDS = [592789, 477132, 605483]; // Cole, Scherzer, Bieber

/**
 * Flow 1: Daily Schedule Flow
 * - Get today's schedule
 * - Get environment data for each game
 * - Get ballpark factors
 */
async function dailyScheduleFlow() {
  console.log("=== Daily Schedule Flow ===");

  try {
    // Get today's schedule
    console.log("Getting schedule...");
    const schedule = await getSchedule({ date: SAMPLE_DATE });

    if (!schedule || !schedule.dates || schedule.dates.length === 0) {
      console.log("No games scheduled today");
      return [];
    }

    // Get first date with games
    const gamesData = schedule.dates[0];
    console.log(`Found ${gamesData.games.length} games on ${gamesData.date}`);

    // Get environment data for each game
    const gameIds = [];
    for (let i = 0; i < Math.min(3, gamesData.games.length); i++) {
      const game = gamesData.games[i];
      const gameId = game.gamePk.toString();
      gameIds.push(gameId);

      console.log(`Getting environment data for game ${gameId}...`);
      const environment = await getGameEnvironmentData({ gamePk: gameId });

      // Get ballpark factors
      console.log(`Getting ballpark factors for venue ${game.venue.id}...`);
      const ballparkFactors = await getBallparkFactors({
        venueId: game.venue.id,
        season: "2025",
      });
    }

    return gameIds;
  } catch (error) {
    console.error("Error in daily schedule flow:", error);
    return [];
  }
}

/**
 * Flow 2: Player Stats Flow
 * - Get batter stats for sample players
 * - Get pitcher stats for sample pitchers
 * - Get matchup data
 */
async function playerStatsFlow() {
  console.log("\n=== Player Stats Flow ===");

  try {
    // Get batter stats
    for (const batterId of SAMPLE_BATTER_IDS) {
      console.log(`Getting stats for batter ${batterId}...`);
      const batterStats = await getBatterStats({ batterId, season: 2025 });
    }

    // Get pitcher stats
    for (const pitcherId of SAMPLE_PITCHER_IDS) {
      console.log(`Getting stats for pitcher ${pitcherId}...`);
      const pitcherStats = await getPitcherStats({ pitcherId, season: 2025 });
    }

    // Get matchup data
    console.log("Getting matchup data...");
    const matchupData = await getMatchupData(
      SAMPLE_BATTER_IDS[0],
      SAMPLE_PITCHER_IDS[0]
    );
  } catch (error) {
    console.error("Error in player stats flow:", error);
  }
}

/**
 * Flow 3: DFS Analysis Flow
 * - Get game data
 * - Analyze batters
 * - Get hit projections
 * - Get HR probability
 * - Get SB probability
 * - Analyze pitchers
 */
async function dfsAnalysisFlow(gameIds: string[]) {
  console.log("\n=== DFS Analysis Flow ===");

  if (gameIds.length === 0) {
    console.log("No game IDs available for analysis");
    return;
  }

  try {
    // Get a game ID to analyze
    const gameId = gameIds[0];

    // Get game feed
    console.log(`Getting game feed for game ${gameId}...`);
    const gameFeed = await getGameFeed(gameId);

    // Create sample batter info for analysis
    const sampleBatters = SAMPLE_BATTER_IDS.map((id, index) => ({
      id,
      name: ["Mike Trout", "Aaron Judge", "Mookie Betts"][index],
      position: "OF",
      lineupPosition: index + 2,
      isHome: true,
      opposingPitcher: {
        id: SAMPLE_PITCHER_IDS[0],
        name: "Gerrit Cole",
        throwsHand: "R",
      },
    }));

    // Analyze batters
    console.log("Analyzing batters...");
    const batterAnalysis = await analyzeBatters(gameId, sampleBatters);

    // Get hit projections for first batter
    console.log("Getting hit projections...");
    const hitProjections = await calculateHitProjections(
      SAMPLE_BATTER_IDS[0],
      SAMPLE_PITCHER_IDS[0],
      gameId,
      { temperature: 72, windSpeed: 5, windDirection: "out", isOutdoor: true },
      {
        overall: 1.0,
        types: {
          homeRuns: 1.1,
          singles: 1.0,
          doubles: 1.0,
          triples: 0.9,
          runs: 1.0,
        },
      }
    );

    // Get HR probability
    console.log("Getting HR probability...");
    const hrProbability = await estimateHomeRunProbability(
      SAMPLE_BATTER_IDS[0],
      SAMPLE_PITCHER_IDS[0],
      {
        overall: 1.0,
        types: {
          homeRuns: 1.1,
          singles: 1.0,
          doubles: 1.0,
          triples: 0.9,
          runs: 1.0,
        },
      },
      { temperature: 72, windSpeed: 5, windDirection: "out", isOutdoor: true }
    );

    // Get SB probability
    console.log("Getting SB probability...");
    const sbProbability = await estimateStolenBaseProbability(
      SAMPLE_BATTER_IDS[0],
      SAMPLE_PITCHER_IDS[0],
      null // catcher ID
    );

    // Analyze pitchers
    console.log("Analyzing pitchers...");
    const pitcherProjection = await calculatePitcherDfsProjection(
      SAMPLE_PITCHER_IDS[0],
      gameId
    );
  } catch (error) {
    console.error("Error in DFS analysis flow:", error);
  }
}

/**
 * Main function to run all flows
 */
async function main() {
  try {
    console.log("Starting sample flows to capture API shapes...");

    // Run flows in sequence
    const gameIds = await dailyScheduleFlow();
    await playerStatsFlow();
    await dfsAnalysisFlow(gameIds);

    console.log("\nAll sample flows completed successfully!");
  } catch (error) {
    console.error("Error in main flow:", error);
  }
}

main();
