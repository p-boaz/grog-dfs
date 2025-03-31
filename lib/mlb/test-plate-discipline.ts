/**
 * Test the enhanced plate discipline metrics implementation
 * This file demonstrates how to use the getAdvancedPlateDisciplineMetrics function
 */

import {
  calculateAdvancedPlateDisciplineProjection,
  calculateExpectedWalks,
  getAdvancedPlateDisciplineMetrics,
} from "./dfs-analysis/plate-discipline";

// These IDs are examples - replace with real player IDs for testing
const EXAMPLE_PITCHER_IDS = {
  goodControl: 605483, // Aaron Nola
  poorControl: 608566, // Tyler Glasnow - high K but also high BB
  average: 669160, // Cristian Javier
};

const EXAMPLE_BATTER_IDS = {
  goodEye: 545361, // Juan Soto - elite walk rate
  poorEye: 665742, // Luis Robert - low walk rate
  average: 664023, // Michael Harris
};

/**
 * Test advanced plate discipline metrics for specific batter/pitcher matchups
 */
async function testAdvancedPlateDisciplineMetrics() {
  console.log("TESTING ADVANCED PLATE DISCIPLINE METRICS");
  console.log("=========================================");

  // Test a patient batter vs. wild pitcher (high walk expectation)
  try {
    console.log("\nTEST 1: Patient batter vs. wild pitcher");
    console.log("---------------------------------------");
    const metrics = await getAdvancedPlateDisciplineMetrics(
      EXAMPLE_BATTER_IDS.goodEye,
      EXAMPLE_PITCHER_IDS.poorControl
    );

    console.log(
      "Batter chase rate:",
      metrics.batterMetrics.chaseRate.toFixed(3)
    );
    console.log(
      "Pitcher zone rate:",
      metrics.pitcherMetrics.zoneRate.toFixed(3)
    );
    console.log("Matchup advantage:", metrics.matchupAdvantage);
    console.log("Prediction confidence:", metrics.predictionConfidence);
    console.log("Expected outcomes:");
    console.log(
      "- Walk probability:",
      metrics.expectedOutcomes.walkProbability.toFixed(3)
    );
    console.log(
      "- Strikeout probability:",
      metrics.expectedOutcomes.strikeoutProbability.toFixed(3)
    );
    console.log(
      "- In-play probability:",
      metrics.expectedOutcomes.inPlayProbability.toFixed(3)
    );
  } catch (error) {
    console.error("Error in Test 1:", error);
  }

  // Test a free-swinging batter vs. control pitcher (low walk expectation)
  try {
    console.log("\nTEST 2: Free-swinging batter vs. control pitcher");
    console.log("-----------------------------------------------");
    const metrics = await getAdvancedPlateDisciplineMetrics(
      EXAMPLE_BATTER_IDS.poorEye,
      EXAMPLE_PITCHER_IDS.goodControl
    );

    console.log(
      "Batter chase rate:",
      metrics.batterMetrics.chaseRate.toFixed(3)
    );
    console.log(
      "Pitcher zone rate:",
      metrics.pitcherMetrics.zoneRate.toFixed(3)
    );
    console.log("Matchup advantage:", metrics.matchupAdvantage);
    console.log("Prediction confidence:", metrics.predictionConfidence);
    console.log("Expected outcomes:");
    console.log(
      "- Walk probability:",
      metrics.expectedOutcomes.walkProbability.toFixed(3)
    );
    console.log(
      "- Strikeout probability:",
      metrics.expectedOutcomes.strikeoutProbability.toFixed(3)
    );
    console.log(
      "- In-play probability:",
      metrics.expectedOutcomes.inPlayProbability.toFixed(3)
    );
  } catch (error) {
    console.error("Error in Test 2:", error);
  }

  // Test an average batter vs. average pitcher (baseline expectation)
  try {
    console.log("\nTEST 3: Average batter vs. average pitcher");
    console.log("---------------------------------------");
    const metrics = await getAdvancedPlateDisciplineMetrics(
      EXAMPLE_BATTER_IDS.average,
      EXAMPLE_PITCHER_IDS.average
    );

    console.log(
      "Batter chase rate:",
      metrics.batterMetrics.chaseRate.toFixed(3)
    );
    console.log(
      "Pitcher zone rate:",
      metrics.pitcherMetrics.zoneRate.toFixed(3)
    );
    console.log("Matchup advantage:", metrics.matchupAdvantage);
    console.log("Prediction confidence:", metrics.predictionConfidence);
    console.log("Expected outcomes:");
    console.log(
      "- Walk probability:",
      metrics.expectedOutcomes.walkProbability.toFixed(3)
    );
    console.log(
      "- Strikeout probability:",
      metrics.expectedOutcomes.strikeoutProbability.toFixed(3)
    );
    console.log(
      "- In-play probability:",
      metrics.expectedOutcomes.inPlayProbability.toFixed(3)
    );
  } catch (error) {
    console.error("Error in Test 3:", error);
  }
}

/**
 * Test the DFS projection function that uses advanced metrics
 */
async function testDfsProjection() {
  console.log("\nTESTING DFS POINTS PROJECTION");
  console.log("============================");

  // Test patient batter vs. wild pitcher (higher walk expectation)
  try {
    console.log("\nDFS Projection - Patient batter vs. wild pitcher");
    console.log("----------------------------------------------");
    const projection = await calculateAdvancedPlateDisciplineProjection(
      EXAMPLE_BATTER_IDS.goodEye,
      EXAMPLE_PITCHER_IDS.poorControl
    );

    console.log("Expected walks:", projection.walks.expected.toFixed(2));
    console.log("Walk points:", projection.walks.points.toFixed(2));
    console.log("Expected HBP:", projection.hbp.expected.toFixed(2));
    console.log("HBP points:", projection.hbp.points.toFixed(2));
    console.log("Total points:", projection.total.points.toFixed(2));
    console.log("Confidence:", projection.total.confidence.toFixed(1) + "%");
    console.log("Insights:");
    projection.insights.forEach((insight, i) => console.log(`- ${insight}`));
  } catch (error) {
    console.error("Error in DFS projection test:", error);
  }

  // Compare with the traditional calculation
  try {
    console.log("\nComparing with traditional calculation");
    console.log("------------------------------------");
    const traditionalCalc = await calculateExpectedWalks(
      EXAMPLE_BATTER_IDS.goodEye,
      EXAMPLE_PITCHER_IDS.poorControl
    );

    console.log(
      "Traditional expected walks:",
      traditionalCalc.expectedWalks.toFixed(2)
    );
    console.log(
      "Traditional expected HBP:",
      traditionalCalc.expectedHbp.toFixed(2)
    );
    console.log(
      "Traditional confidence score:",
      traditionalCalc.confidenceScore.toFixed(1)
    );
  } catch (error) {
    console.error("Error in traditional calculation comparison:", error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    await testAdvancedPlateDisciplineMetrics();
    await testDfsProjection();

    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

// Execute tests
runTests();
