/**
 * Run All Tests Script
 * 
 * This script executes all test files in the scripts/tests directory
 * and consolidates the output.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Paths
const TESTS_DIR = path.join(process.cwd(), 'scripts', 'tests');
const LOGS_DIR = path.join(process.cwd(), 'logs');
const SUMMARY_LOG = path.join(LOGS_DIR, 'test-summary.log');
const ERROR_LOG = path.join(process.cwd(), 'test-errors.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Clear previous error log
fs.writeFileSync(ERROR_LOG, '');

// Get all test files
const getTestFiles = (): string[] => {
  const allFiles = fs.readdirSync(TESTS_DIR, { recursive: true })
    .filter((file): file is string => typeof file === 'string')
    .filter(file => file.endsWith('.ts') && !file.includes('old-') && file.includes('test-'));
  
  // Get all subdirectories
  const subDirs = fs.readdirSync(TESTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const testFiles: string[] = [];
  
  // Add top-level test files
  testFiles.push(...allFiles.filter(file => !file.includes('/')));
  
  // Add subdirectory files
  subDirs.forEach(dir => {
    const dirPath = path.join(TESTS_DIR, dir);
    const dirFiles = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.ts') && !file.includes('old-') && file.includes('test-'))
      .map(file => path.join(dir, file));
    
    testFiles.push(...dirFiles);
  });
  
  return testFiles;
};

// Main function to run all tests
async function runAllTests() {
  const testFiles = getTestFiles();
  console.log(`Found ${testFiles.length} test files to run.`);
  
  const results: Record<string, { success: boolean, message: string, duration: number }> = {};
  let passedTests = 0;
  let failedTests = 0;
  
  // Run each test
  for (const file of testFiles) {
    const testName = path.basename(file, '.ts');
    const fullPath = path.join(TESTS_DIR, file);
    console.log(`Running ${testName}...`);
    
    const startTime = Date.now();
    try {
      // Execute the test with increased buffer size and memory allocation
      const output = execSync(`pnpm tsx ${fullPath}`, { 
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' } // Increase memory limit
      });
      
      const duration = Date.now() - startTime;
      results[testName] = { 
        success: true, 
        message: `Passed in ${duration}ms`,
        duration 
      };
      passedTests++;
      
      console.log(`✅ ${testName} - Passed in ${duration}ms`);
      
      // Write test output to its own log file
      const logFile = path.join(LOGS_DIR, `${testName}.log`);
      fs.writeFileSync(logFile, output);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      results[testName] = { 
        success: false, 
        message: `Failed: ${errorMessage}`,
        duration
      };
      failedTests++;
      
      console.error(`❌ ${testName} - Failed in ${duration}ms`);
      
      // Append to error log
      fs.appendFileSync(ERROR_LOG, 
        `${'-'.repeat(40)}\n` +
        `Test: ${testName}\n` +
        `Time: ${new Date().toISOString()}\n` +
        `Error: ${errorMessage}\n\n`
      );
    }
  }
  
  // Generate summary
  const summary = [
    `=== MLB Analysis Test Summary ===`,
    `Run on: ${new Date().toLocaleString()}`,
    `Tests: ${testFiles.length}`,
    `Passed: ${passedTests}`,
    `Failed: ${failedTests}`,
    `Pass rate: ${Math.round((passedTests / testFiles.length) * 100)}%`,
    ``,
    `=== Detailed Results ===`,
    ...Object.entries(results).map(([test, result]) => {
      const icon = result.success ? '✅' : '❌';
      return `${icon} ${test}: ${result.message} (${result.duration}ms)`;
    }),
    ``,
    `=== Failed Tests ===`,
    ...Object.entries(results)
      .filter(([_, result]) => !result.success)
      .map(([test, result]) => `${test}: ${result.message}`)
  ].join('\n');
  
  // Write summary
  fs.writeFileSync(SUMMARY_LOG, summary);
  
  // Print final summary
  console.log(`\n=== Test Summary ===`);
  console.log(`Total: ${testFiles.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Pass rate: ${Math.round((passedTests / testFiles.length) * 100)}%`);
  console.log(`\nFull report saved to: ${SUMMARY_LOG}`);
  
  if (failedTests > 0) {
    console.log(`Error details saved to: ${ERROR_LOG}`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});