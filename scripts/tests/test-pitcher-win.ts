/**
 * Test script for pitcher-win.ts module
 */

import * as fs from "fs";
import * as path from "path";
import {
  calculatePitcherWinProbability,
  getPitcherWinStats,
  getTeamBullpenStrength,
  getTeamOffensiveSupport,
} from "../../lib/mlb/dfs-analysis/pitchers/pitcher-win";

// Logger setup
const LOG_FILE_PATH = path.join(__dirname, "../../logs/pitcher-win-test.log");

// Create logs directory if it doesn't exist
if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
  fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

// Initialize log file with timestamp
const initLogMessage = `
====================================
Pitcher Win Test Results
Run Date: ${new Date().toISOString()}
====================================

`;

fs.writeFileSync(LOG_FILE_PATH, initLogMessage);

// Logger function for both console and file
function log(message: string): void {
  console.log(message);
  fs.appendFileSync(LOG_FILE_PATH, message + "\n");
}

// Test pitcher IDs
const GERRIT_COLE_ID = 543037;
const MAX_SCHERZER_ID = 453286;
const ZACK_WHEELER_ID = 554430;
const SHOHEI_OHTANI_PITCHER_ID = 660271;
const SHANE_BIEBER_ID = 669456;
const LOGAN_WEBB_ID = 657277;

// Test game IDs
const TEST_GAME_PK = "717465"; // Use a real game ID

async function runTests() {
  log("Starting tests for pitcher-win.ts module...\n");

  // Test 1: Get pitcher win stats
  log("Test 1: getPitcherWinStats for Gerrit Cole");
  try {
    const coleWinStats = await getPitcherWinStats(GERRIT_COLE_ID);
    log(`Result: ${coleWinStats ? "Success" : "Failed"}`);
    if (coleWinStats) {
      log(`Pitcher name: ${coleWinStats.name}`);
      log(`Team: ${coleWinStats.teamName}`);
      log(`Games started: ${coleWinStats.gamesStarted}`);
      log(`Win-Loss: ${coleWinStats.wins}-${coleWinStats.losses}`);
      log(`Win percentage: ${(coleWinStats.winPercentage * 100).toFixed(1)}%`);
      log(
        `Team win percentage: ${(coleWinStats.teamWinPct * 100).toFixed(1)}%`
      );
      log(`ERA: ${coleWinStats.era.toFixed(2)}`);
      log(`WHIP: ${coleWinStats.whip.toFixed(2)}`);
      log(
        `Avg innings per start: ${coleWinStats.avgInningsPerStart.toFixed(1)}`
      );
      log(JSON.stringify(coleWinStats, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 1: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 2: Get team offensive support stats
  log("Test 2: getTeamOffensiveSupport for Yankees (147)");
  try {
    const yankeeOffense = await getTeamOffensiveSupport(147);
    log(`Result: ${yankeeOffense ? "Success" : "Failed"}`);
    if (yankeeOffense) {
      log(`Runs per game: ${yankeeOffense.runsPerGame.toFixed(2)}`);
      log(`Team OPS: ${yankeeOffense.teamOPS.toFixed(3)}`);
      log(
        `Run support rating: ${yankeeOffense.runSupportRating.toFixed(1)}/10`
      );
      log(JSON.stringify(yankeeOffense, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 2: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 3: Get team bullpen strength
  log("Test 3: getTeamBullpenStrength for Dodgers (119)");
  try {
    const dodgersBullpen = await getTeamBullpenStrength(119);
    log(`Result: ${dodgersBullpen ? "Success" : "Failed"}`);
    if (dodgersBullpen) {
      log(`Bullpen ERA: ${dodgersBullpen.bullpenERA.toFixed(2)}`);
      log(`Bullpen WHIP: ${dodgersBullpen.bullpenWHIP.toFixed(2)}`);
      log(`Bullpen rating: ${dodgersBullpen.bullpenRating.toFixed(1)}/10`);
      log(JSON.stringify(dodgersBullpen, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 3: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 4: Calculate win probability
  log("Test 4: calculatePitcherWinProbability for Max Scherzer");
  try {
    const scherzerWinProb = await calculatePitcherWinProbability(
      MAX_SCHERZER_ID,
      TEST_GAME_PK
    );
    log(`Result: ${scherzerWinProb ? "Success" : "Failed"}`);
    if (scherzerWinProb) {
      log(`Overall win probability: ${scherzerWinProb.overallWinProbability}%`);
      log(
        `Expected DFS points: ${scherzerWinProb.expectedDfsPoints.toFixed(2)}`
      );
      log(`Confidence: ${scherzerWinProb.confidence}/100`);
      log(
        `Pitcher quality: ${scherzerWinProb.pitcherFactors.pitcherQuality.toFixed(
          1
        )}/10`
      );
      log(
        `Team offense: ${scherzerWinProb.teamFactors.runSupport.toFixed(1)}/10`
      );
      log(
        `Bullpen strength: ${scherzerWinProb.teamFactors.bullpenStrength.toFixed(
          1
        )}/10`
      );
      log(
        `Home/Away factor: ${scherzerWinProb.gameFactors.homeAway} (1=home, -1=away)`
      );
      log(JSON.stringify(scherzerWinProb, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 4: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 5: Another pitcher win stats test
  log("Test 5: getPitcherWinStats for Shane Bieber");
  try {
    const bieberWinStats = await getPitcherWinStats(SHANE_BIEBER_ID);
    log(`Result: ${bieberWinStats ? "Success" : "Failed"}`);
    if (bieberWinStats) {
      log(`Pitcher name: ${bieberWinStats.name}`);
      log(`Team: ${bieberWinStats.teamName}`);
      log(`Games started: ${bieberWinStats.gamesStarted}`);
      log(`Win-Loss: ${bieberWinStats.wins}-${bieberWinStats.losses}`);
      log(
        `Win percentage: ${(bieberWinStats.winPercentage * 100).toFixed(1)}%`
      );
      log(
        `Team win percentage: ${(bieberWinStats.teamWinPct * 100).toFixed(1)}%`
      );
      log(`ERA: ${bieberWinStats.era.toFixed(2)}`);
      log(`WHIP: ${bieberWinStats.whip.toFixed(2)}`);
      log(
        `Avg innings per start: ${bieberWinStats.avgInningsPerStart.toFixed(1)}`
      );
      log(JSON.stringify(bieberWinStats, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 5: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 6: Another team offensive support test
  log("Test 6: getTeamOffensiveSupport for Braves (144)");
  try {
    const bravesOffense = await getTeamOffensiveSupport(144);
    log(`Result: ${bravesOffense ? "Success" : "Failed"}`);
    if (bravesOffense) {
      log(`Runs per game: ${bravesOffense.runsPerGame.toFixed(2)}`);
      log(`Team OPS: ${bravesOffense.teamOPS.toFixed(3)}`);
      log(
        `Run support rating: ${bravesOffense.runSupportRating.toFixed(1)}/10`
      );
      log(JSON.stringify(bravesOffense, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 6: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  log("Tests completed for pitcher-win.ts module.");
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
