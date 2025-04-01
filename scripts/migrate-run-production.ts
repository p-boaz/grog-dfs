/**
 * Migration script for run-production.ts module
 * 
 * This script applies the same migration patterns we used for hits.ts
 * to the run-production.ts module to make it compatible with the three-layer
 * type architecture.
 */

import { 
  getPlayerRunProductionStats,
  getCareerRunProductionProfile,
  getPitcherRunAllowance
} from '../lib/mlb/dfs-analysis/run-production';

/**
 * Test the key functions in run-production.ts after migration
 */
async function testRunProductionMigration() {
  try {
    console.log("Testing run-production.ts migration...");
    console.log("\n====================================");
    
    // Test Mike Trout (545361) with seasonStats -> currentSeason migration
    console.log("\n1. Testing getPlayerRunProductionStats(545361)...");
    const runStats = await getPlayerRunProductionStats(545361);
    console.log(runStats ? "✅ SUCCESS" : "❌ FAILED");
    console.log(JSON.stringify(runStats, null, 2));
    
    console.log("\n2. Testing getCareerRunProductionProfile(545361)...");
    const careerProfile = await getCareerRunProductionProfile(545361);
    console.log(careerProfile ? "✅ SUCCESS" : "❌ FAILED");
    console.log(JSON.stringify(careerProfile, null, 2));
    
    console.log("\n3. Testing getPitcherRunAllowance(594798)...");
    const pitcherAllowance = await getPitcherRunAllowance(594798);
    console.log(pitcherAllowance ? "✅ SUCCESS" : "❌ FAILED");
    console.log(JSON.stringify(pitcherAllowance, null, 2));
    
    // Overall status
    console.log("\n====================================");
    if (runStats && careerProfile && pitcherAllowance) {
      console.log("✅ ALL TESTS PASSED - Migration successful!");
    } else {
      console.log("❌ MIGRATION FAILED - Some functions returned null");
    }
    
  } catch (error) {
    console.error("Error testing run-production migration:", error);
  }
}

// Run the test
console.log("Starting run-production.ts migration test");
testRunProductionMigration().catch(console.error);