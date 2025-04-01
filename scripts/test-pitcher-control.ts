/**
 * Test script for the pitcher-control.ts module
 * Used to validate the migration to the domain model types
 */

import fs from 'fs';
import path from 'path';
import { 
  getPitcherControlStats, 
  getPitcherControlProfile, 
  getCareerControlProfile,
  calculateExpectedControlEvents,
  calculateControlProjection
} from '../lib/mlb/dfs-analysis/pitchers/pitcher-control';

// Test pitcher IDs
const GERRIT_COLE_ID = 543037;
const CORBIN_BURNES_ID = 669203;
const YANKEES_LINEUP = [664086, 547989, 624413, 650402, 543760, 665487, 677951, 489334, 609280];

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file path
const logFilePath = path.join(logsDir, 'pitcher-control-test.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'w' });

// Helper to write to both console and log file
function log(message: string) {
  console.log(message);
  logStream.write(message + '\n');
}

// Format date for report header
const formatDate = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

// Test result type
interface TestResult<T> {
  name: string;
  success: boolean;
  data: T | null;
  error?: Error;
  duration: number;
}

// Test function that returns detailed results
async function testFunction<T>(name: string, fn: () => Promise<T | null>): Promise<TestResult<T>> {
  log(`Testing ${name}...`);
  const startTime = Date.now();
  let success = false;
  let error: Error | undefined;
  let data: T | null = null;
  
  try {
    data = await fn();
    success = data !== null;
    
    if (success) {
      log(`✅ ${name}: Success`);
    } else {
      log(`❌ ${name}: Failed (null result)`);
    }
  } catch (e) {
    error = e as Error;
    log(`❌ Error in ${name}: ${error.message}`);
  }
  
  const duration = Date.now() - startTime;
  log(`Duration: ${duration}ms\n`);
  
  return {
    name,
    success,
    data,
    error,
    duration
  };
}

async function runTests(): Promise<void> {
  const testResults: TestResult<any>[] = [];
  const testStartTime = Date.now();
  
  // Write report header
  log('='.repeat(80));
  log(`PITCHER CONTROL MODULE TEST REPORT - ${formatDate()}`);
  log('='.repeat(80));
  log('\n');

  // Test 1: Get pitcher control stats for Gerrit Cole
  testResults.push(await testFunction('getPitcherControlStats', 
    () => getPitcherControlStats(GERRIT_COLE_ID)
  ));

  // Test 2: Get control profile for Corbin Burnes
  testResults.push(await testFunction('getPitcherControlProfile', 
    () => getPitcherControlProfile(CORBIN_BURNES_ID)
  ));

  // Test 3: Get career control profile for Gerrit Cole
  testResults.push(await testFunction('getCareerControlProfile', 
    () => getCareerControlProfile(GERRIT_COLE_ID)
  ));

  // Test 4: Calculate expected control events
  testResults.push(await testFunction('calculateExpectedControlEvents', 
    () => calculateExpectedControlEvents(GERRIT_COLE_ID, YANKEES_LINEUP)
  ));

  // Test 5: Calculate control projection
  testResults.push(await testFunction('calculateControlProjection', 
    () => calculateControlProjection(GERRIT_COLE_ID, YANKEES_LINEUP)
  ));

  // Generate summary report
  const testEndTime = Date.now();
  const totalDuration = testEndTime - testStartTime;
  const successCount = testResults.filter(r => r.success).length;
  const failureCount = testResults.length - successCount;
  
  log('='.repeat(80));
  log('TEST SUMMARY');
  log('='.repeat(80));
  log(`Total Tests: ${testResults.length}`);
  log(`Successes: ${successCount}`);
  log(`Failures: ${failureCount}`);
  log(`Total Duration: ${totalDuration}ms`);
  log('\n');

  // Per-test result summary
  log('DETAILED RESULTS:');
  testResults.forEach(result => {
    log(`${result.name}: ${result.success ? 'SUCCESS' : 'FAILURE'} (${result.duration}ms)`);
    
    // For successful tests, write the first 300 chars of the result data
    if (result.success && result.data) {
      log('Data sample:');
      log(JSON.stringify(result.data, null, 2).substring(0, 300) + '...\n');
    }
    
    // For failed tests, include the error
    if (!result.success && result.error) {
      log(`Error: ${result.error.message}`);
      if (result.error.stack) {
        log(result.error.stack);
      }
      log('');
    }
  });

  // Close log file
  log('Test run complete');
  logStream.end();
  
  // Output filepath to console
  console.log(`\nDetailed test report written to: ${logFilePath}`);
  
  // Ensure the process terminates
  setTimeout(() => {
    process.exit(0);
  }, 500);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error during test execution:', error);
  process.exit(1);
});