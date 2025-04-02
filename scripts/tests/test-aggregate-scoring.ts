/**
 * Test script for the migrated aggregate-scoring.ts module
 */
import * as fs from "fs";
import * as path from "path";
import { makeMLBApiRequest } from "../../lib/mlb/core/api-client";
import {
  calculatePitcherDfsProjection,
  rankPitcherProjections,
} from "../../lib/mlb/dfs-analysis/shared/aggregate-scoring";

import { Game } from "../../lib/mlb/types/domain/game";

// Setup logging
const LOG_FILE = path.join(__dirname, "../../logs/aggregate-scoring-test.log");
fs.writeFileSync(
  LOG_FILE,
  "--- Aggregate Scoring Module Test ---\n\n",
  "utf-8"
);

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + "\n", "utf-8");
}

interface Game {
  gamePk: number;
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
  };
}

async function getTodaysGames(): Promise<Game[]> {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  log(`Fetching MLB schedule for date: ${formattedDate}`);

  try {
    const scheduleResponse = await makeMLBApiRequest<{
      dates: Array<{ games: Game[] }>;
    }>(`/schedule?sportId=1&date=${formattedDate}&hydrate=probablePitcher`);

    if (!scheduleResponse.dates || scheduleResponse.dates.length === 0) {
      log("No games found for today");
      return [];
    }

    return scheduleResponse.dates[0].games;
  } catch (error) {
    log(`Error fetching today's games: ${error}`);
    return [];
  }
}

async function testAggregateScoringModule() {
  try {
    // Get today's games with probable pitchers
    const games = await getTodaysGames();

    if (games.length === 0) {
      log("No games available for testing");
      return false;
    }

    // Extract probable pitchers with team context
    const testPitchers = games.flatMap((game) => {
      const pitchers = [];
      if (game.teams.away.probablePitcher) {
        pitchers.push({
          id: game.teams.away.probablePitcher.id,
          name: game.teams.away.probablePitcher.fullName,
          gamePk: game.gamePk.toString(),
          opposingTeamId: game.teams.home.team.id,
        });
      }
      if (game.teams.home.probablePitcher) {
        pitchers.push({
          id: game.teams.home.probablePitcher.id,
          name: game.teams.home.probablePitcher.fullName,
          gamePk: game.gamePk.toString(),
          opposingTeamId: game.teams.away.team.id,
        });
      }
      return pitchers;
    });

    log(
      `Testing calculatePitcherDfsProjection with ${testPitchers.length} probable pitchers...`
    );

    // Test calculatePitcherDfsProjection
    const projections = await Promise.all(
      testPitchers.map(async (pitcher) => {
        try {
          const currentYear = new Date().getFullYear();
          const projection = await calculatePitcherDfsProjection(
            pitcher.id,
            pitcher.gamePk,
            currentYear,
            pitcher.opposingTeamId
          );

          return {
            name: pitcher.name,
            projection,
          };
        } catch (error) {
          log(
            `Error projecting ${pitcher.name}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          return null;
        }
      })
    );

    // Filter out any null projections
    const validProjections = projections.filter((p) => p !== null);

    // Log detailed projections
    validProjections.forEach((p) => {
      log(`\n${p.name} Projection:`);
      log(`- Total Points: ${p.projection.points.total.toFixed(1)}`);
      log(
        `- Range: ${p.projection.points.floor.toFixed(
          1
        )} - ${p.projection.points.upside.toFixed(1)}`
      );
      log(
        `- Projected Innings: ${p.projection.stats.projectedInnings.toFixed(1)}`
      );
      log(
        `- Projected Strikeouts: ${p.projection.stats.projectedStrikeouts.toFixed(
          1
        )}`
      );
      log(
        `- Win Probability: ${p.projection.stats.winProbability.toFixed(1)}%`
      );
      log(
        `- Projected Earned Runs: ${p.projection.stats.projectedEarnedRuns.toFixed(
          1
        )}`
      );
      log(`- Quality Rating: ${p.projection.stats.quality.toFixed(1)}/10`);
      log(`- Confidence: ${p.projection.confidence.overall}`);

      log("\nPoints Breakdown:");
      log(`- Innings: ${p.projection.points.breakdown.innings.toFixed(1)}`);
      log(
        `- Strikeouts: ${p.projection.points.breakdown.strikeouts.toFixed(1)}`
      );
      log(`- Win: ${p.projection.points.breakdown.win.toFixed(1)}`);
      log(
        `- Rare Events: ${p.projection.points.breakdown.rareEvents.toFixed(1)}`
      );
      log(`- Negative: ${p.projection.points.breakdown.negative.toFixed(1)}`);
    });

    // Test rankPitcherProjections
    log("\nTesting rankPitcherProjections...");

    // Create map of pitcher IDs to game PKs
    const gamePksMap = testPitchers.reduce((map, pitcher) => {
      map[pitcher.id] = pitcher.gamePk;
      return map;
    }, {} as Record<number, string>);

    const currentYear = new Date().getFullYear();
    const rankings = await rankPitcherProjections(
      testPitchers.map((p) => p.id),
      gamePksMap,
      currentYear
    );

    log("\nPitcher Rankings:");
    rankings.rankings.forEach((rank) => {
      log(
        `${rank.rank}. ${
          rank.pitcher.name || `Pitcher ${rank.pitcher.id}`
        }: ${rank.points.toFixed(1)} points (Value: ${rank.value.toFixed(
          2
        )} pts/$1K)`
      );
    });

    log(`\nAverage Projection: ${rankings.averageProjection.toFixed(1)}`);
    log(`Top Tier Threshold: ${rankings.topTierThreshold.toFixed(1)}`);
    log(`Mid Tier Threshold: ${rankings.midTierThreshold.toFixed(1)}`);

    log("\nAll tests completed successfully!");
    return true;
  } catch (error) {
    log(`Error testing aggregate-scoring module: ${error}`);
    if (error instanceof Error) {
      log(error.stack || "No stack trace available");
    }
    return false;
  }
}

// Run the tests
(async () => {
  try {
    await testAggregateScoringModule();
  } catch (error) {
    console.error("Test execution error:", error);
  }
})();
