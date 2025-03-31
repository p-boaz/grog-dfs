import {
  captureConsoleOutput,
  createLogStream,
} from "../lib/mlb/core/file-utils";
import { collectDailyDFSData } from "../lib/mlb/daily-data-collector";

/**
 * Main data collection script that processes all MLB games for the day
 * This script will:
 * - Collect data for all scheduled games
 * - Save results to the default data directory
 * - Keep the process running after completion
 */
(async () => {
  const { stream, logPath } = createLogStream(
    "test-output-detailed.log",
    "test"
  );
  const restoreConsole = captureConsoleOutput(stream);

  try {
    // Call with default parameters to process all games for today
    await collectDailyDFSData(
      undefined, // date: undefined = use today's date
      undefined, // maxGames: undefined = process all games
      undefined, // outputDir: undefined = use default directory
      false // shouldExit: false = keep process running
    );
  } catch (error) {
    console.error(error);
  } finally {
    restoreConsole();
    console.log("Log saved to:", logPath);
  }
})();
