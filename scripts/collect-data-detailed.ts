import {
  captureConsoleOutput,
  createLogStream,
} from "../lib/mlb/core/file-utils";
import { collectDailyDFSData } from "../lib/mlb/daily-data-collector";

/**
 * Detailed test script that captures full logging output
 * This script will:
 * - Collect data for a single game
 * - Save detailed logs to test-output-detailed.log
 * - Output formatted JSON for game details, lineups, pitchers, and environment
 */
(async () => {
  const { stream, logPath } = createLogStream(
    "test-output-detailed.log",
    "test"
  );
  const restoreConsole = captureConsoleOutput(stream);

  try {
    const data = await collectDailyDFSData(
      "2025-03-31", // date: specific test date
      1, // maxGames: limit to one game
      "test", // outputDir: save to test directory
      false // shouldExit: keep process running
    );

    console.log("\n--- Test Summary ---\n");
    console.log("Game details:", JSON.stringify(data.games[0], null, 2));
    console.log("\nLineups:", JSON.stringify(data.games[0].lineups, null, 2));
    console.log("\nPitchers:", JSON.stringify(data.games[0].pitchers, null, 2));
    console.log(
      "\nEnvironment:",
      JSON.stringify(data.games[0].environment, null, 2)
    );
  } catch (error) {
    console.error(error);
  } finally {
    restoreConsole();
    console.log("Log saved to:", logPath);
  }
})();
