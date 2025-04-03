/**
 * DFS Database Seeding Runner
 * 
 * A simple script to run the robust-dfs-seed.ts script with appropriate options.
 * This helps avoid typing out the full command with options each time.
 * 
 * Run with: pnpm tsx scripts/run-dfs-seed.ts [options]
 */

import { exec } from 'child_process';

// Get command line options (after the script name)
const cliArgs = process.argv.slice(2);

// Add default options if none provided
if (cliArgs.length === 0) {
  cliArgs.push('--sample'); // Default to sample data
}

// Run the robust seed script with the passed options
const seedScript = `pnpm tsx scripts/robust-dfs-seed.ts ${cliArgs.join(' ')}`;

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