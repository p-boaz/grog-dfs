/**
 * Test script to check batter stats API response for player ID 545361
 *
 * This is a diagnostic tool to verify the structure of batter stats data
 * as returned by the API and transformed by our domain models.
 */

import {
  getBatterPlatoonSplits,
  getMatchupHitStats,
} from "../../lib/mlb/dfs-analysis/batters/hits";
import { getBatterStats } from "../../lib/mlb/player/batter-stats";

async function testBatterStats() {
  try {
    console.log("Fetching stats for Mike Trout (ID: 545361)...");
    const batterStats = await getBatterStats({ batterId: 545361 });

    console.log("=== Complete Batter Object ===");
    console.log(JSON.stringify(batterStats, null, 2));

    console.log("\n=== Current Season Stats ===");
    console.log(JSON.stringify(batterStats.currentSeason, null, 2));

    // Check if seasonStats field exists in the batter object (should not exist in domain model)
    console.log("\n=== Checking for 'seasonStats' field ===");
    const hasSeasonStats = "seasonStats" in batterStats;
    console.log(`Has 'seasonStats' property: ${hasSeasonStats}`);

    if (hasSeasonStats) {
      console.log(JSON.stringify((batterStats as any).seasonStats, null, 2));
    }

    // Test the related functions that were updated
    console.log("\n=== Testing getMatchupHitStats ===");
    const matchupStats = await getMatchupHitStats(545361, 594798);
    console.log(JSON.stringify(matchupStats, null, 2));

    console.log("\n=== Testing getBatterPlatoonSplits ===");
    const platoonSplits = await getBatterPlatoonSplits(545361);
    console.log(JSON.stringify(platoonSplits, null, 2));
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

console.log("Running batter stats diagnostic tool...");
testBatterStats()
  .catch(console.error)
  .finally(() => console.log("Diagnostic complete"));
