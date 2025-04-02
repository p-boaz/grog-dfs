/**
 * Test script for rare-events.ts module
 */

import * as fs from "fs";
import * as path from "path";
import {
  analyzeHistoricalRareEvents,
  calculateRareEventPotential,
} from "../../lib/mlb/dfs-analysis/pitchers/rare-events";

// Logger setup
const LOG_FILE_PATH = path.join(__dirname, "../../logs/rare-events-test.log");

// Create logs directory if it doesn't exist
if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
  fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

// Initialize log file with timestamp
const initLogMessage = `
====================================
Rare Events Test Results
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
const JUSTIN_VERLANDER_ID = 434378;
const CLAYTON_KERSHAW_ID = 477132;
const SHANE_BIEBER_ID = 669456;
const ZACK_WHEELER_ID = 554430;

// Test game ID
const TEST_GAME_PK = "717465"; // Use a real game ID

async function runTests() {
  log("Starting tests for rare-events.ts module...\n");

  // Test 1: Calculate rare event potential for a dominant pitcher
  log("Test 1: calculateRareEventPotential for Max Scherzer");
  try {
    const scherzerRareEvents = await calculateRareEventPotential(
      MAX_SCHERZER_ID,
      TEST_GAME_PK
    );
    log(`Result: ${scherzerRareEvents ? "Success" : "Failed"}`);
    if (scherzerRareEvents) {
      log(
        `Complete Game probability: ${scherzerRareEvents.eventProbabilities.completeGame.toFixed(
          2
        )}%`
      );
      log(
        `Quality Start probability: ${scherzerRareEvents.eventProbabilities.qualityStart.toFixed(
          2
        )}%`
      );
      log(
        `Shutout probability: ${scherzerRareEvents.eventProbabilities.shutout.toFixed(
          2
        )}%`
      );
      log(
        `No-Hitter probability: ${scherzerRareEvents.eventProbabilities.noHitter.toFixed(
          2
        )}%`
      );
      log(
        `Perfect Game probability: ${scherzerRareEvents.eventProbabilities.perfectGame.toFixed(
          2
        )}%`
      );
      log(
        `Expected DFS points from rare events: ${scherzerRareEvents.expectedRareEventPoints.toFixed(
          2
        )}`
      );
      log(
        `Risk-Reward Rating: ${scherzerRareEvents.riskRewardRating.toFixed(
          1
        )}/10`
      );
      log(`Confidence: ${scherzerRareEvents.confidence}/100`);
      log(JSON.stringify(scherzerRareEvents, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 1: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 2: Calculate rare event potential for another pitcher
  log("Test 2: calculateRareEventPotential for Gerrit Cole");
  try {
    const coleRareEvents = await calculateRareEventPotential(
      GERRIT_COLE_ID,
      TEST_GAME_PK
    );
    log(`Result: ${coleRareEvents ? "Success" : "Failed"}`);
    if (coleRareEvents) {
      log(
        `Complete Game probability: ${coleRareEvents.eventProbabilities.completeGame.toFixed(
          2
        )}%`
      );
      log(
        `Quality Start probability: ${coleRareEvents.eventProbabilities.qualityStart.toFixed(
          2
        )}%`
      );
      log(
        `Shutout probability: ${coleRareEvents.eventProbabilities.shutout.toFixed(
          2
        )}%`
      );
      log(
        `No-Hitter probability: ${coleRareEvents.eventProbabilities.noHitter.toFixed(
          2
        )}%`
      );
      log(
        `Perfect Game probability: ${coleRareEvents.eventProbabilities.perfectGame.toFixed(
          2
        )}%`
      );
      log(
        `Expected DFS points from rare events: ${coleRareEvents.expectedRareEventPoints.toFixed(
          2
        )}`
      );
      log(
        `Risk-Reward Rating: ${coleRareEvents.riskRewardRating.toFixed(1)}/10`
      );
      log(`Confidence: ${coleRareEvents.confidence}/100`);
      log(JSON.stringify(coleRareEvents, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 2: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 3: Analyze historical rare events for a veteran pitcher
  log("Test 3: analyzeHistoricalRareEvents for Justin Verlander");
  try {
    const verlanderHistory = await analyzeHistoricalRareEvents(
      JUSTIN_VERLANDER_ID
    );
    log(`Result: ${verlanderHistory ? "Success" : "Failed"}`);
    if (verlanderHistory) {
      log(
        `Pitcher: ${verlanderHistory.pitcher.name} (${verlanderHistory.pitcher.team})`
      );
      log(`Career Games: ${verlanderHistory.careerStats.totalGames}`);
      log(
        `Career Complete Games: ${verlanderHistory.careerStats.completeGames}`
      );
      log(`Career Shutouts: ${verlanderHistory.careerStats.shutouts}`);
      log(`Career No-Hitters: ${verlanderHistory.careerStats.noHitters}`);
      log(
        `Career Completion Rate: ${(
          verlanderHistory.careerStats.completionRate * 100
        ).toFixed(1)}%`
      );
      log(`Current Season Games: ${verlanderHistory.seasonStats.totalGames}`);
      log(
        `Season Complete Games: ${verlanderHistory.seasonStats.completeGames}`
      );
      log(JSON.stringify(verlanderHistory, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 3: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 4: Analyze historical rare events for a younger pitcher
  log("Test 4: analyzeHistoricalRareEvents for Shane Bieber");
  try {
    const bieberHistory = await analyzeHistoricalRareEvents(SHANE_BIEBER_ID);
    log(`Result: ${bieberHistory ? "Success" : "Failed"}`);
    if (bieberHistory) {
      log(
        `Pitcher: ${bieberHistory.pitcher.name} (${bieberHistory.pitcher.team})`
      );
      log(`Career Games: ${bieberHistory.careerStats.totalGames}`);
      log(`Career Complete Games: ${bieberHistory.careerStats.completeGames}`);
      log(`Career Shutouts: ${bieberHistory.careerStats.shutouts}`);
      log(`Career No-Hitters: ${bieberHistory.careerStats.noHitters}`);
      log(
        `Career Completion Rate: ${(
          bieberHistory.careerStats.completionRate * 100
        ).toFixed(1)}%`
      );
      log(`Current Season Games: ${bieberHistory.seasonStats.totalGames}`);
      log(`Season Complete Games: ${bieberHistory.seasonStats.completeGames}`);
      log(JSON.stringify(bieberHistory, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 4: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 5: Calculate rare event potential for one more pitcher
  log("Test 5: calculateRareEventPotential for Clayton Kershaw");
  try {
    const kershawRareEvents = await calculateRareEventPotential(
      CLAYTON_KERSHAW_ID,
      TEST_GAME_PK
    );
    log(`Result: ${kershawRareEvents ? "Success" : "Failed"}`);
    if (kershawRareEvents) {
      log(
        `Complete Game probability: ${kershawRareEvents.eventProbabilities.completeGame.toFixed(
          2
        )}%`
      );
      log(
        `Quality Start probability: ${kershawRareEvents.eventProbabilities.qualityStart.toFixed(
          2
        )}%`
      );
      log(
        `Expected DFS points from rare events: ${kershawRareEvents.expectedRareEventPoints.toFixed(
          2
        )}`
      );
      log(
        `Risk-Reward Rating: ${kershawRareEvents.riskRewardRating.toFixed(
          1
        )}/10`
      );
      log(`Confidence: ${kershawRareEvents.confidence}/100`);
      log(JSON.stringify(kershawRareEvents, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 5: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  log("Tests completed for rare-events.ts module.");
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
