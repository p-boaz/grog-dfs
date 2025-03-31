import { collectDailyDFSData } from "../lib/mlb/daily-data-collector";

/**
 * Test script that processes just one game
 * This script will:
 * - Collect data for a single game
 * - Save results to the 'test' directory
 * - Use a specific test date (2025-03-31)
 */
(async () => {
  const data = await collectDailyDFSData(
    "2025-03-31", // date: specific test date in YYYY-MM-DD format
    1, // maxGames: limit to processing just 1 game
    "test", // outputDir: save files to data/test/ directory
    false // shouldExit: false = keep process running
  );

  // Log summary of processed data
  console.log(`\nProcessed ${data.count} entries for ${data.date}`);
  console.log(
    `Game processed: ${data.games[0].homeTeam.name} vs ${data.games[0].awayTeam.name}`
  );
})();
