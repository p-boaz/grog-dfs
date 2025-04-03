/**
 * DFS Database Seeding Runner
 * 
 * A simple script to run the robust-dfs-seed.ts script with appropriate options.
 * This helps avoid typing out the full command with options each time.
 * 
 * Run with: pnpm tsx scripts/run-dfs-seed.ts [options]
 * 
 * Example:
 * pnpm tsx scripts/run-dfs-seed.ts --reset
 * pnpm tsx scripts/run-dfs-seed.ts --players --games
 * pnpm tsx scripts/run-dfs-seed.ts --env=test
 */

import { exec } from 'child_process';
import { collectDailyDFSData } from '../lib/mlb/daily-data-collector';

// Get command line options (after the script name)
const cliArgs = process.argv.slice(2);

// Check for special commands
const shouldCollectLiveData = cliArgs.includes('--collect-live');
const shouldRunDbOnly = cliArgs.includes('--db-only');

// Filter out our special commands from args we pass to the robust seed script
const filteredArgs = cliArgs.filter(arg => 
  arg !== '--collect-live' && arg !== '--db-only');

// If we're collecting live data before seeding
if (shouldCollectLiveData) {
  console.log('Collecting live data from MLB API before seeding...');
  
  // Run the data collector
  (async () => {
    try {
      const date = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
      console.log(`Collecting data for ${date}...`);
      
      // Collect the data - this will also save to database if DB integration is enabled
      const data = await collectDailyDFSData(date);
      
      console.log(`Data collection complete. Found ${data.games.length} games.`);
      
      // Then run the seed script if needed
      if (!shouldRunDbOnly) {
        runRobustSeedScript(filteredArgs);
      } else {
        console.log('Skipping the robust seed script due to --db-only flag.');
      }
    } catch (error) {
      console.error('Error collecting live data:', error);
      process.exit(1);
    }
  })();
} else {
  // Just run the normal seed script
  runRobustSeedScript(filteredArgs.length ? filteredArgs : ['--sample']);
}

/**
 * Run the robust seed script with the given arguments
 */
function runRobustSeedScript(args: string[]) {
  // Add default options if none provided
  if (args.length === 0) {
    args.push('--sample'); // Default to sample data
  }

  // Run the robust seed script with the passed options
  const seedScript = `pnpm tsx scripts/robust-dfs-seed.ts ${args.join(' ')}`;

  console.log(`Running: ${seedScript}`);

  // Execute the seed script
  exec(seedScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running seed script: ${error.message}`);
      return;
    }
    
    // Output the results
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
  });
}