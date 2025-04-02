/**
 * Test script to check batter stats API response for player ID 545361
 *
 * This is a diagnostic tool to verify the structure of batter stats data
 * as returned by the API and transformed by our domain models.
 */

import * as fs from "fs";
import * as path from "path";
import {
  getBatterPlatoonSplits,
  getMatchupHitStats,
} from "../../lib/mlb/dfs-analysis/batters/hits";
import { getBatterStats } from "../../lib/mlb/player/batter-stats";

// Logger setup
const LOG_FILE_PATH = path.join(__dirname, "../../logs/batter-stats-test.log");

// Create logs directory if it doesn't exist
if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
  fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

// Initialize log file with timestamp
const initLogMessage = `
====================================
Batter Stats Test Results
Run Date: ${new Date().toISOString()}
====================================

`;

fs.writeFileSync(LOG_FILE_PATH, initLogMessage);

// Logger function for both console and file
function log(message: string): void {
  console.log(message);
  fs.appendFileSync(LOG_FILE_PATH, message + "\n");
}

async function testBatterStats() {
  try {
    log("Fetching stats for Mike Trout (ID: 545361)...");
    const batterStats = await getBatterStats({ batterId: 545361 });

    log("=== Complete Batter Object ===");
    log(JSON.stringify(batterStats, null, 2));

    log("\n=== Current Season Stats ===");
    log(JSON.stringify(batterStats.currentSeason, null, 2));

    // Check if seasonStats field exists in the batter object (should not exist in domain model)
    log("\n=== Checking for 'seasonStats' field ===");
    const hasSeasonStats = "seasonStats" in batterStats;
    log(`Has 'seasonStats' property: ${hasSeasonStats}`);

    if (hasSeasonStats) {
      log(JSON.stringify((batterStats as any).seasonStats, null, 2));
    }

    // Test the related functions that were updated
    log("\n=== Testing getMatchupHitStats ===");
    const matchupStats = await getMatchupHitStats(545361, 594798);
    log(JSON.stringify(matchupStats, null, 2));

    log("\n=== Testing getBatterPlatoonSplits ===");
    const platoonSplits = await getBatterPlatoonSplits(545361);
    log(JSON.stringify(platoonSplits, null, 2));
  } catch (error) {
    log(
      `Error during testing: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    fs.appendFileSync(
      LOG_FILE_PATH,
      `\nStack trace: ${
        error instanceof Error ? error.stack : "No stack trace"
      }\n`
    );
  }
}

log("Running batter stats diagnostic tool...");
testBatterStats()
  .catch((error) => {
    log(
      `Fatal error: ${error instanceof Error ? error.message : String(error)}`
    );
    fs.appendFileSync(
      LOG_FILE_PATH,
      `\nFATAL ERROR: ${error}\n${
        error instanceof Error ? error.stack : "No stack trace"
      }\n`
    );
    process.exit(1);
  })
  .finally(() => log("Diagnostic complete"));
