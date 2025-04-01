/**
 * Test script for home-runs module after type migration
 * 
 * Runs tests on various functions in the home-runs module
 * and outputs detailed results to logs/home-runs-test.log
 */

import fs from 'fs';
import path from 'path';
import { 
  getPlayerHomeRunStats,
  getCareerHomeRunProfile,
  getBallparkHomeRunFactor,
  getWeatherHomeRunImpact,
  getPitcherHomeRunVulnerability,
  estimateHomeRunProbability
} from '../lib/mlb/dfs-analysis/batters/home-runs';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file path
const logFilePath = path.join(logsDir, 'home-runs-test.log');
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
  log(`HOME RUNS MODULE TEST REPORT - ${formatDate()}`);
  log('='.repeat(80));
  log('\n');

  // Test home run stats for Mike Trout (ID: 545361)
  testResults.push(await testFunction('getPlayerHomeRunStats', 
    () => getPlayerHomeRunStats(545361)
  ));

  // Test career home run profile for Mike Trout
  testResults.push(await testFunction('getCareerHomeRunProfile', 
    () => getCareerHomeRunProfile(545361)
  ));

  // Test ballpark home run factor for Yankee Stadium (ID: 3313)
  testResults.push(await testFunction('getBallparkHomeRunFactor', 
    () => getBallparkHomeRunFactor(3313, "R")
  ));

  // Test weather impact on home runs for a specific game
  // Using a test game ID
  testResults.push(await testFunction('getWeatherHomeRunImpact', 
    () => getWeatherHomeRunImpact("717465")
  ));

  // Test pitcher home run vulnerability for Gerrit Cole (ID: 543037)
  testResults.push(await testFunction('getPitcherHomeRunVulnerability', 
    () => getPitcherHomeRunVulnerability(543037)
  ));

  // Test home run probability estimate for Trout vs Cole in Yankee Stadium
  testResults.push(await testFunction('estimateHomeRunProbability', 
    () => estimateHomeRunProbability(545361, 543037, 3313, true)
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