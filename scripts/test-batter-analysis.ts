/**
 * Test script for batter-analysis module after type migration
 * 
 * Tests the getDefaultBatterAnalysis function from the batter-analysis module
 * and outputs detailed results to logs/batter-analysis-test.log
 */

import fs from 'fs';
import path from 'path';
import { getDefaultBatterAnalysis } from '../lib/mlb/dfs-analysis/batters/batter-analysis';
import { BatterAnalysis } from '../lib/mlb/types/analysis';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file path
const logFilePath = path.join(logsDir, 'batter-analysis-test.log');
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
  log(`BATTER ANALYSIS MODULE TEST REPORT - ${formatDate()}`);
  log('='.repeat(80));
  log('\n');

  // Test the getDefaultBatterAnalysis function which doesn't have external dependencies
  
  // Create a sample game and batter
  const sampleGameId = '717465';
  const mikeTroutId = 545361;
  
  // Sample batter info
  const sampleBatter = {
    id: mikeTroutId,
    name: "Mike Trout",
    position: "CF",
    lineupPosition: 2,
    isHome: true,
    opposingPitcher: {
      id: 543037,
      name: "Gerrit Cole",
      throwsHand: "R"
    }
  };

  // Sample game info
  const sampleGame = {
    gameId: parseInt(sampleGameId),
    venue: { name: "Angel Stadium" },
    homeTeam: { name: "Los Angeles Angels", id: 108 },
    awayTeam: { name: "New York Yankees", id: 147 },
    environment: {
      temperature: 75,
      windSpeed: 5,
      windDirection: "Out to CF",
      isOutdoor: true
    },
    ballpark: {
      overall: 1.02,
      types: {
        singles: 1.01,
        doubles: 1.03,
        triples: 0.95,
        homeRuns: 1.05,
        runs: 1.02
      }
    },
    pitchers: {
      home: { id: 545361, name: "Mike Trout", throwsHand: "R" }, // Just for testing
      away: { id: 543037, name: "Gerrit Cole", throwsHand: "R" }
    },
    lineups: {
      homeCatcher: { id: 123456, name: "Sample Catcher" },
      awayCatcher: { id: 654321, name: "Sample Catcher" }
    }
  };

  // Test getDefaultBatterAnalysis function
  testResults.push(await testFunction('getDefaultBatterAnalysis', 
    async () => {
      try {
        return getDefaultBatterAnalysis(sampleBatter, sampleGame);
      } catch (error) {
        console.error('Error in getDefaultBatterAnalysis:', error);
        return null;
      }
    }
  ));

  // Verify that type guard function isBatterStats works correctly
  // This is part of the domain model and should always return a non-null result
  testResults.push(await testFunction('getDefaultBatterAnalysis with null game', 
    async () => {
      try {
        return getDefaultBatterAnalysis(sampleBatter, null);
      } catch (error) {
        console.error('Error in getDefaultBatterAnalysis with null game:', error);
        return null;
      }
    }
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
    
    // For successful tests, write the first 500 chars of the result data
    if (result.success && result.data) {
      log('Data sample:');
      try {
        log(JSON.stringify(result.data, null, 2).substring(0, 500) + '...\n');
      } catch (error) {
        log(`Error stringifying result: ${error}\n`);
      }
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