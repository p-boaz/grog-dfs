/**
 * Test script for strikeouts.ts module
 */

import fs from "fs";
import path from "path";
import {
  calculateExpectedStrikeouts,
  getPitcherStrikeoutStats,
  getTeamStrikeoutVulnerability,
} from "../../lib/mlb/dfs-analysis/pitchers/strikeouts";

// Logging setup
const logFile = path.join(__dirname, "../../logs/strikeouts-test.log");
fs.writeFileSync(logFile, "--- Strikeouts Test Log ---\n\n", { flag: "w" });

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + "\n");
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
  log("Starting tests for strikeouts.ts module...\n");

  // Test 1: Get pitcher strikeout stats
  log("Test 1: getPitcherStrikeoutStats for Gerrit Cole");
  try {
    const coleStrikeouts = await getPitcherStrikeoutStats(
      GERRIT_COLE_ID,
      "Yankees"
    );
    log(`Result: ${coleStrikeouts ? "Success" : "Failed"}`);
    if (coleStrikeouts) {
      log(`Pitcher name: ${coleStrikeouts.name}`);
      log(`Team: ${coleStrikeouts.teamName}`);
      log(`Strikeout rate (K/9): ${coleStrikeouts.strikeoutRate.toFixed(2)}`);
      log(
        `Strikeout percentage: ${(
          coleStrikeouts.strikeoutPercentage * 100
        ).toFixed(1)}%`
      );
      log(
        `Strikeout stuff rating: ${coleStrikeouts.strikeoutStuff.toFixed(1)}/10`
      );
      log(JSON.stringify(coleStrikeouts, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 1: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 2: Get team strikeout vulnerability
  log("Test 2: getTeamStrikeoutVulnerability for Red Sox");
  try {
    const redSoxVulnerability = await getTeamStrikeoutVulnerability(RED_SOX_ID);
    log(`Result: ${redSoxVulnerability ? "Success" : "Failed"}`);
    if (redSoxVulnerability) {
      log(`Team: ${redSoxVulnerability.teamName}`);
      log(
        `Strikeouts per game: ${redSoxVulnerability.strikeoutsPerGame.toFixed(
          2
        )}`
      );
      log(
        `Strikeout rate: ${(redSoxVulnerability.strikeoutRate * 100).toFixed(
          1
        )}%`
      );
      log(
        `Vulnerability rating: ${redSoxVulnerability.strikeoutVulnerability.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(redSoxVulnerability, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 2: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 3: Calculate expected strikeouts
  log("Test 3: calculateExpectedStrikeouts for Cole vs. Red Sox");
  try {
    const coleVsRedSox = await calculateExpectedStrikeouts(
      GERRIT_COLE_ID,
      RED_SOX_ID,
      TEST_GAME_ID
    );
    log(`Result: ${coleVsRedSox ? "Success" : "Failed"}`);
    if (coleVsRedSox) {
      log(`Expected strikeouts: ${coleVsRedSox.expectedStrikeouts.toFixed(1)}`);
      log(
        `Range: ${coleVsRedSox.lowRange.toFixed(
          1
        )} - ${coleVsRedSox.highRange.toFixed(1)}`
      );
      log(
        `Expected DFS points from Ks: ${coleVsRedSox.expectedDfsPoints.toFixed(
          1
        )}`
      );
      log(`Confidence: ${coleVsRedSox.confidence}/10`);
      log(JSON.stringify(coleVsRedSox, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 3: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 4: Another pitcher
  log("Test 4: getPitcherStrikeoutStats for Max Scherzer");
  try {
    const scherzerStrikeouts = await getPitcherStrikeoutStats(
      MAX_SCHERZER_ID,
      "Mets"
    );
    log(`Result: ${scherzerStrikeouts ? "Success" : "Failed"}`);
    if (scherzerStrikeouts) {
      log(`Pitcher name: ${scherzerStrikeouts.name}`);
      log(
        `Strikeout rate (K/9): ${scherzerStrikeouts.strikeoutRate.toFixed(2)}`
      );
      log(
        `Strikeout percentage: ${(
          scherzerStrikeouts.strikeoutPercentage * 100
        ).toFixed(1)}%`
      );
      log(
        `Strikeout stuff rating: ${scherzerStrikeouts.strikeoutStuff.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(scherzerStrikeouts, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 4: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 5: Another team
  log("Test 5: getTeamStrikeoutVulnerability for Angels");
  try {
    const angelsVulnerability = await getTeamStrikeoutVulnerability(ANGELS_ID);
    log(`Result: ${angelsVulnerability ? "Success" : "Failed"}`);
    if (angelsVulnerability) {
      log(`Team: ${angelsVulnerability.teamName}`);
      log(
        `Strikeouts per game: ${angelsVulnerability.strikeoutsPerGame.toFixed(
          2
        )}`
      );
      log(
        `Strikeout rate: ${(angelsVulnerability.strikeoutRate * 100).toFixed(
          1
        )}%`
      );
      log(
        `Vulnerability rating: ${angelsVulnerability.strikeoutVulnerability.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(angelsVulnerability, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 5: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 6: Calculate expected strikeouts
  log("Test 6: calculateExpectedStrikeouts for Burnes vs. Athletics");
  try {
    const burnesVsAthletics = await calculateExpectedStrikeouts(
      CORBIN_BURNES_ID,
      ATHLETICS_ID
    );
    log(`Result: ${burnesVsAthletics ? "Success" : "Failed"}`);
    if (burnesVsAthletics) {
      log(
        `Expected strikeouts: ${burnesVsAthletics.expectedStrikeouts.toFixed(
          1
        )}`
      );
      log(
        `Range: ${burnesVsAthletics.lowRange.toFixed(
          1
        )} - ${burnesVsAthletics.highRange.toFixed(1)}`
      );
      log(
        `Expected DFS points from Ks: ${burnesVsAthletics.expectedDfsPoints.toFixed(
          1
        )}`
      );
      log(`Confidence: ${burnesVsAthletics.confidence}/10`);
      log(JSON.stringify(burnesVsAthletics, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 6: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  log("Tests completed for strikeouts.ts module.");
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
