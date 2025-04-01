/**
 * Test script for plate-discipline module after type migration
 * 
 * Runs tests on various functions in the plate-discipline module
 * and outputs detailed results to logs/plate-discipline-test.log
 */

import fs from 'fs';
import path from 'path';
import { 
  getPlayerPlateDisciplineStats,
  getCareerPlateDisciplineProfile,
  getPitcherControlProfile,
  getMatchupWalkData,
  calculatePlateDisciplineProjection,
  BatterPlateDiscipline
} from '../lib/mlb/dfs-analysis/shared/plate-discipline';

// Define interfaces for ControlProjection to make type checking clear
interface ControlProjection {
  walks: {
    expected: number;
    high: number;
    low: number;
    range: number;
  };
  hits: {
    expected: number;
    high: number;
    low: number;
    range: number;
  };
  hbp: {
    expected: number;
    high: number;
    low: number;
    range: number;
  };
  overall: {
    controlRating: number;
    confidenceScore: number;
  };
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file path
const logFilePath = path.join(logsDir, 'plate-discipline-test.log');
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
  log(`PLATE DISCIPLINE MODULE TEST REPORT - ${formatDate()}`);
  log('='.repeat(80));
  log('\n');

  // Test plate discipline stats for Mike Trout (ID: 545361)
  testResults.push(await testFunction('getPlayerPlateDisciplineStats', 
    () => getPlayerPlateDisciplineStats(545361)
  ));

  // Test career plate discipline profile for Mike Trout
  testResults.push(await testFunction('getCareerPlateDisciplineProfile', 
    () => getCareerPlateDisciplineProfile(545361)
  ));

  // Test pitcher control profile for Gerrit Cole (ID: 543037)
  // Note: This function will now always return a value, never null
  testResults.push(await testFunction('getPitcherControlProfile', 
    async () => {
      const result = await getPitcherControlProfile(543037);
      // Force success by checking if the result is an object with expected properties
      return result && typeof result === 'object' && 'control' in result ? result : null;
    }
  ));

  // Test matchup walk data for Trout vs Cole
  testResults.push(await testFunction('getMatchupWalkData', 
    () => getMatchupWalkData(545361, 543037)
  ));

  // Test plate discipline projection for Trout vs Cole
  testResults.push(await testFunction('calculatePlateDisciplineProjection', 
    () => calculatePlateDisciplineProjection(545361, 543037)
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
    
    // For successful tests, write the first 200 chars of the result data
    if (result.success && result.data) {
      log('Data sample:');
      log(JSON.stringify(result.data, null, 2).substring(0, 200) + '...\n');
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