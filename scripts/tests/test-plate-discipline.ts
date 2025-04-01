/**
 * Test script for plate-discipline.ts module
 */

import fs from "fs";
import path from "path";
import {
  getBatterDisciplineStats,
  getBatterPitcherDisciplineMatchup,
  getPitcherDisciplineStats,
} from "../../lib/mlb/dfs-analysis/shared/plate-discipline";

// Logging setup
const logFile = path.join(__dirname, "../../logs/plate-discipline-test.log");
fs.writeFileSync(logFile, "--- Plate Discipline Test Log ---\n\n", {
  flag: "w",
});

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + "\n");
}

// Test players
const MIKE_TROUT_ID = 545361;
const SHOHEI_OHTANI_BATTER_ID = 660271;
const MAX_SCHERZER_ID = 453286;
const JUAN_SOTO_ID = 665742;
const CARLOS_CORREA_ID = 621043;
const CORBIN_BURNES_ID = 669203;
const GERRIT_COLE_ID = 543037;
const ZACK_WHEELER_ID = 554430;

async function runTests() {
  log("Starting tests for plate-discipline.ts module...\n");

  // Test 1: Get batter discipline stats
  log("Test 1: getBatterDisciplineStats for Mike Trout");
  try {
    const troutDiscipline = await getBatterDisciplineStats(MIKE_TROUT_ID);
    log(`Result: ${troutDiscipline ? "Success" : "Failed"}`);
    if (troutDiscipline) {
      log(`Batter name: ${troutDiscipline.name}`);
      log(`Strikeout rate: ${troutDiscipline.strikeoutRate.toFixed(3)}`);
      log(`Walk rate: ${troutDiscipline.walkRate.toFixed(3)}`);
      log(`Contact rate: ${troutDiscipline.contactRate.toFixed(3)}`);
      log(
        `Plate discipline rating: ${troutDiscipline.disciplineRating.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(troutDiscipline, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 1: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 2: Get pitcher discipline stats
  log("Test 2: getPitcherDisciplineStats for Max Scherzer");
  try {
    const scherzerDiscipline = await getPitcherDisciplineStats(MAX_SCHERZER_ID);
    log(`Result: ${scherzerDiscipline ? "Success" : "Failed"}`);
    if (scherzerDiscipline) {
      log(`Pitcher name: ${scherzerDiscipline.name}`);
      log(`Strikeout rate: ${scherzerDiscipline.strikeoutRate.toFixed(3)}`);
      log(`Walk rate: ${scherzerDiscipline.walkRate.toFixed(3)}`);
      log(`K/BB ratio: ${scherzerDiscipline.kbbRatio.toFixed(2)}`);
      log(`Control rating: ${scherzerDiscipline.controlRating.toFixed(1)}/10`);
      log(JSON.stringify(scherzerDiscipline, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 2: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 3: Get matchup discipline
  log(
    "Test 3: getBatterPitcherDisciplineMatchup for Juan Soto vs Corbin Burnes"
  );
  try {
    const sotoVsBurnes = await getBatterPitcherDisciplineMatchup(
      JUAN_SOTO_ID,
      CORBIN_BURNES_ID
    );
    log(`Result: ${sotoVsBurnes ? "Success" : "Failed"}`);
    if (sotoVsBurnes) {
      log(`Matchup: ${sotoVsBurnes.batterName} vs ${sotoVsBurnes.pitcherName}`);
      log(
        `Expected strikeout probability: ${(
          sotoVsBurnes.expectedStrikeoutRate * 100
        ).toFixed(1)}%`
      );
      log(
        `Expected walk probability: ${(
          sotoVsBurnes.expectedWalkRate * 100
        ).toFixed(1)}%`
      );
      log(`Advantage: ${sotoVsBurnes.advantage}`);
      log(JSON.stringify(sotoVsBurnes, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 3: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 4: Another batter discipline test
  log("Test 4: getBatterDisciplineStats for Carlos Correa");
  try {
    const correaDiscipline = await getBatterDisciplineStats(CARLOS_CORREA_ID);
    log(`Result: ${correaDiscipline ? "Success" : "Failed"}`);
    if (correaDiscipline) {
      log(`Batter name: ${correaDiscipline.name}`);
      log(`Strikeout rate: ${correaDiscipline.strikeoutRate.toFixed(3)}`);
      log(`Walk rate: ${correaDiscipline.walkRate.toFixed(3)}`);
      log(`Contact rate: ${correaDiscipline.contactRate.toFixed(3)}`);
      log(
        `Plate discipline rating: ${correaDiscipline.disciplineRating.toFixed(
          1
        )}/10`
      );
      log(JSON.stringify(correaDiscipline, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 4: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 5: Another pitcher discipline test
  log("Test 5: getPitcherDisciplineStats for Gerrit Cole");
  try {
    const coleDiscipline = await getPitcherDisciplineStats(GERRIT_COLE_ID);
    log(`Result: ${coleDiscipline ? "Success" : "Failed"}`);
    if (coleDiscipline) {
      log(`Pitcher name: ${coleDiscipline.name}`);
      log(`Strikeout rate: ${coleDiscipline.strikeoutRate.toFixed(3)}`);
      log(`Walk rate: ${coleDiscipline.walkRate.toFixed(3)}`);
      log(`K/BB ratio: ${coleDiscipline.kbbRatio.toFixed(2)}`);
      log(`Control rating: ${coleDiscipline.controlRating.toFixed(1)}/10`);
      log(JSON.stringify(coleDiscipline, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 5: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  // Test 6: Another matchup test
  log(
    "Test 6: getBatterPitcherDisciplineMatchup for Carlos Correa vs Zack Wheeler"
  );
  try {
    const correaVsWheeler = await getBatterPitcherDisciplineMatchup(
      CARLOS_CORREA_ID,
      ZACK_WHEELER_ID
    );
    log(`Result: ${correaVsWheeler ? "Success" : "Failed"}`);
    if (correaVsWheeler) {
      log(
        `Matchup: ${correaVsWheeler.batterName} vs ${correaVsWheeler.pitcherName}`
      );
      log(
        `Expected strikeout probability: ${(
          correaVsWheeler.expectedStrikeoutRate * 100
        ).toFixed(1)}%`
      );
      log(
        `Expected walk probability: ${(
          correaVsWheeler.expectedWalkRate * 100
        ).toFixed(1)}%`
      );
      log(`Advantage: ${correaVsWheeler.advantage}`);
      log(JSON.stringify(correaVsWheeler, null, 2));
    }
  } catch (error) {
    log(
      `Error in Test 6: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  log("\n---\n");

  log("Tests completed for plate-discipline.ts module.");
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
