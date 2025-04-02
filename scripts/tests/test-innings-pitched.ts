/**
 * Test script for innings-pitched.ts module
 */

import * as fs from "fs";
import * as path from "path";
import {
  calculateCompleteGamePotential,
  calculateExpectedInnings,
  getPitcherInningsStats,
  getTeamHookTendencies,
} from "../../lib/mlb/dfs-analysis/pitchers/innings-pitched";

// Logger setup
const LOG_FILE_PATH = path.join(
  __dirname,
  "../../logs/innings-pitched-test.log"
);

// Create logs directory if it doesn't exist
if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
  fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

// Initialize log file with timestamp
const initLogMessage = `
====================================
Innings Pitched Test Results
Run Date: ${new Date().toISOString()}
====================================

`;

fs.writeFileSync(LOG_FILE_PATH, initLogMessage);

// Logger function for both console and file
function log(message: string): void {
  console.log(message);
  fs.appendFileSync(LOG_FILE_PATH, message + "\n");
}

// Test pitchers and teams
const GERRIT_COLE_ID = 543037;
const MAX_SCHERZER_ID = 453286;
const CORBIN_BURNES_ID = 669203;
const ZACK_WHEELER_ID = 554430;
const SHANE_BIEBER_ID = 669456;

// Test teams
const YANKEES_ID = 147;
const METS_ID = 121;
const RED_SOX_ID = 111;
const ANGELS_ID = 108;
const ATHLETICS_ID = 133;

// Test game ID (Yankees vs. Red Sox, for example)
const TEST_GAME_ID = "717465";

async function runTests() {
  log("Starting tests for innings-pitched.ts module...\n");

  // Test 1: Get pitcher innings stats
  log("Test 1: getPitcherInningsStats for Gerrit Cole");
  try {
    const coleInningsStats = await getPitcherInningsStats(GERRIT_COLE_ID);
    log(`Result: ${coleInningsStats ? "Success" : "Failed"}`);
    if (coleInningsStats) {
      log(`Pitcher name: ${coleInningsStats.name}`);
      log(`Team: ${coleInningsStats.teamName}`);
      log(`Games started: ${coleInningsStats.gamesStarted}`);
      log(`Innings pitched: ${coleInningsStats.inningsPitched.toFixed(1)}`);
      log(
        `Avg innings per start: ${coleInningsStats.avgInningsPerStart.toFixed(
          2
        )}`
      );
      log(
        `Durability rating: ${coleInningsStats.durabilityRating.toFixed(1)}/10`
      );
      log(JSON.stringify(coleInningsStats, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 1: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 2: Get team hook tendencies
  log("Test 2: getTeamHookTendencies for Yankees");
  try {
    const yankeesHookTendencies = await getTeamHookTendencies(YANKEES_ID);
    log(`Result: ${yankeesHookTendencies ? "Success" : "Failed"}`);
    if (yankeesHookTendencies) {
      log(`Team: ${yankeesHookTendencies.teamName}`);
      log(
        `Quick hook rating: ${yankeesHookTendencies.quickHookRating.toFixed(
          1
        )}/10`
      );
      log(
        `Bullpen usage rating: ${yankeesHookTendencies.bullpenUsageRating.toFixed(
          1
        )}/10`
      );
      log(
        `Starter innings per game: ${yankeesHookTendencies.starterInningsPerGame.toFixed(
          1
        )}`
      );
      log(JSON.stringify(yankeesHookTendencies, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 2: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 3: Calculate expected innings
  log("Test 3: calculateExpectedInnings for Cole vs. Red Sox");
  try {
    const coleExpectedInnings = await calculateExpectedInnings(
      GERRIT_COLE_ID,
      TEST_GAME_ID
    );
    log(`Result: ${coleExpectedInnings ? "Success" : "Failed"}`);
    if (coleExpectedInnings) {
      log(
        `Expected innings: ${coleExpectedInnings.expectedInnings.toFixed(1)}`
      );
      log(
        `Range: ${coleExpectedInnings.ranges.low.toFixed(
          1
        )} - ${coleExpectedInnings.ranges.high.toFixed(1)}`
      );
      log(
        `Expected DFS points: ${coleExpectedInnings.expectedDfsPoints.toFixed(
          1
        )}`
      );
      log(`Confidence: ${coleExpectedInnings.confidence}/100`);
      log(JSON.stringify(coleExpectedInnings, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 3: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 4: Calculate complete game potential
  log("Test 4: calculateCompleteGamePotential for Scherzer");
  try {
    const scherzerCGPotential = await calculateCompleteGamePotential(
      MAX_SCHERZER_ID,
      TEST_GAME_ID
    );
    log(`Result: ${scherzerCGPotential ? "Success" : "Failed"}`);
    if (scherzerCGPotential) {
      log(
        `Expected rare event points: ${scherzerCGPotential.expectedRareEventPoints.toFixed(
          2
        )}`
      );
      log(
        `Complete game probability: ${scherzerCGPotential.eventProbabilities.completeGame.toFixed(
          1
        )}%`
      );
      log(
        `No-hitter probability: ${scherzerCGPotential.eventProbabilities.noHitter.toFixed(
          2
        )}%`
      );
      log(
        `Quality start probability: ${scherzerCGPotential.eventProbabilities.qualityStart.toFixed(
          1
        )}%`
      );
      log(
        `Risk/reward rating: ${scherzerCGPotential.riskRewardRating.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(scherzerCGPotential, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 4: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 5: Another pitcher innings stats
  log("Test 5: getPitcherInningsStats for Wheeler");
  try {
    const wheelerInningsStats = await getPitcherInningsStats(ZACK_WHEELER_ID);
    log(`Result: ${wheelerInningsStats ? "Success" : "Failed"}`);
    if (wheelerInningsStats) {
      log(`Pitcher name: ${wheelerInningsStats.name}`);
      log(
        `Avg innings per start: ${wheelerInningsStats.avgInningsPerStart.toFixed(
          2
        )}`
      );
      log(
        `Durability rating: ${wheelerInningsStats.durabilityRating.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(wheelerInningsStats, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 5: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 6: Multi-pitcher comparison
  log("Test 6: Comparing innings potential for multiple pitchers");
  try {
    const pitcherIds = [
      GERRIT_COLE_ID,
      MAX_SCHERZER_ID,
      CORBIN_BURNES_ID,
      SHANE_BIEBER_ID,
    ];
    const inningsStats = await Promise.all(
      pitcherIds.map((id) => getPitcherInningsStats(id))
    );

    const validStats = inningsStats.filter(Boolean);
    log(
      `Successfully retrieved stats for ${validStats.length} out of ${pitcherIds.length} pitchers`
    );

    if (validStats.length > 0) {
      // Create a comparison table
      const comparison = validStats.map((stats) => ({
        name: stats?.name || "Unknown",
        inningsPitched: stats?.inningsPitched || 0,
        avgInningsPerStart: stats?.avgInningsPerStart || 0,
        durabilityRating: stats?.durabilityRating || 0,
      }));

      // Sort by durability rating (highest first)
      comparison.sort((a, b) => b.durabilityRating - a.durabilityRating);

      // Log comparison
      log("Pitcher Innings Comparison (Sorted by Durability Rating):");
      log(JSON.stringify(comparison, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 6: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  log("Tests completed for innings-pitched.ts module.");
}

runTests().catch((error) => {
  log(
    `Fatal error during tests: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
  if (error instanceof Error && error.stack) {
    log(error.stack);
  }
});
