/**
 * Test script for database insertion
 * 
 * This script directly tests database insertions to diagnose and fix issues
 * with the MLB API integration to database workflow.
 */

import { insertGame, insertPlayer, saveBatterProjection, savePitcherProjection } from '../lib/db/queries';
import { MLBGameStatus } from '../lib/db/schema';
import { checkDatabaseConnection } from '../lib/db/drizzle';

async function runTests() {
  console.log("Starting database insertion tests...");
  
  // First, check database connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error("Database connection failed! Unable to run tests.");
    process.exit(1);
  }
  
  console.log("Database connection successful.");
  
  try {
    // Test 1: Insert a player
    const testPlayerId = 999999; // Use a high ID to avoid conflicts
    console.log("\nTest 1: Inserting test player...");
    await insertPlayer({
      id: testPlayerId,
      fullName: "Test Player",
      team: "Test Team",
      teamId: 999,
      position: "SP",
      throwsHand: "R",
      isPitcher: true
    });
    console.log("✅ Player insertion successful");
    
    // Test 2: Insert a game
    const testGamePk = 999999;
    console.log("\nTest 2: Inserting test game...");
    await insertGame({
      gamePk: testGamePk,
      gameDate: "2025-04-03",
      teams: {
        home: {
          team: {
            id: 999,
            name: "Home Test Team"
          }
        },
        away: {
          team: {
            id: 998,
            name: "Away Test Team"
          }
        }
      },
      venue: {
        id: 999,
        name: "Test Venue"
      },
      status: {
        abstractGameState: "Preview",
        detailedState: "Scheduled"
      }
    });
    console.log("✅ Game insertion successful");
    
    // Test 3: Insert pitcher projection
    console.log("\nTest 3: Inserting test pitcher projection...");
    await savePitcherProjection({
      playerId: testPlayerId,
      gamePk: testGamePk,
      projectedPoints: 25.5,
      confidence: 80,
      draftKingsSalary: 8500,
      projectedInnings: 6.2,
      projectedStrikeouts: 7.5,
      projectedWinProbability: 0.65,
      projectedQualityStart: 0.7,
      opposingLineupStrength: 0.5,
      analysisFactors: ["Test pitcher projection", "High strikeout potential"]
    });
    console.log("✅ Pitcher projection insertion successful");
    
    // Test 4: Insert batter projection
    console.log("\nTest 4: Inserting test batter projection...");
    await saveBatterProjection({
      playerId: testPlayerId,
      gamePk: testGamePk,
      projectedPoints: 12.5,
      confidence: 75,
      draftKingsSalary: 5500,
      projectedHits: 1.2,
      projectedHomeRuns: 0.3,
      projectedRbi: 1.1,
      projectedRuns: 0.9,
      projectedStolenBases: 0.2,
      battingOrderPosition: 3,
      opposingPitcherId: testPlayerId,
      analysisFactors: ["Test batter projection", "Power hitter"]
    });
    console.log("✅ Batter projection insertion successful");
    
    console.log("\nAll test insertions completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error("Unhandled error in test script:", error);
});