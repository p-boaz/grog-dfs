import {
  captureConsoleOutput,
  createLogStream,
} from "../lib/mlb/core/file-utils";
import { collectDailyDFSData } from "../lib/mlb/daily-data-collector";

// Self-executing async function
(async () => {
  const { stream, logPath } = createLogStream(
    "test-output-detailed.log",
    "test"
  );
  const restoreConsole = captureConsoleOutput(stream);

  try {
    const data = await collectDailyDFSData("2025-03-31", 1, "test", false);
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
