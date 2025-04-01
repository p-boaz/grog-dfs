/**
 * Test script for the migrated quality-metrics.ts module
 */
import * as fs from 'fs';
import * as path from 'path';
import { calculateQualityMetrics } from '../lib/mlb/dfs-analysis/shared/quality-metrics';
import { BatterStats } from '../lib/mlb/types/domain/player';

// Setup logging
const LOG_FILE = path.join(__dirname, '../logs/quality-metrics-test.log');
fs.writeFileSync(LOG_FILE, '--- Quality Metrics Module Test ---\n\n', 'utf-8');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n', 'utf-8');
}

// Sample batting stats for testing
const sampleStats: BatterStats = {
  gamesPlayed: 143,
  atBats: 547,
  hits: 161,
  homeRuns: 37,
  rbi: 98,
  stolenBases: 12,
  avg: 0.294,
  obp: 0.371,
  slg: 0.578,
  ops: 0.949,
  runs: 106,
  walks: 73,
  strikeouts: 127,
  caughtStealing: 3,
  doubles: 28,
  triples: 5,
  hitByPitches: 8,
  sacrificeFlies: 6,
  plateAppearances: 637,
  babip: 0.309,
  iso: 0.284,
  hrRate: 0.068,
  kRate: 0.199,
  bbRate: 0.115,
  sbRate: 0.084
};

const averageStats: BatterStats = {
  gamesPlayed: 120,
  atBats: 420,
  hits: 109,
  homeRuns: 18,
  rbi: 65,
  stolenBases: 5,
  avg: 0.260,
  obp: 0.320,
  slg: 0.420,
  ops: 0.740,
  runs: 60,
  walks: 42,
  strikeouts: 98,
  caughtStealing: 2,
  doubles: 22,
  triples: 2,
  hitByPitches: 4,
  sacrificeFlies: 3,
  plateAppearances: 480,
  babip: 0.290,
  iso: 0.160,
  hrRate: 0.043,
  kRate: 0.204,
  bbRate: 0.088,
  sbRate: 0.042
};

const rookieStats: BatterStats = {
  gamesPlayed: 32,
  atBats: 101,
  hits: 25,
  homeRuns: 5,
  rbi: 14,
  stolenBases: 3,
  avg: 0.248,
  obp: 0.310,
  slg: 0.435,
  ops: 0.745,
  runs: 12,
  walks: 11,
  strikeouts: 32,
  caughtStealing: 1,
  doubles: 6,
  triples: 0,
  hitByPitches: 1,
  sacrificeFlies: 1,
  plateAppearances: 114,
  babip: 0.278,
  iso: 0.188,
  hrRate: 0.050,
  kRate: 0.281,
  bbRate: 0.096,
  sbRate: 0.094
};

async function testQualityMetrics() {
  try {
    log('Testing calculateQualityMetrics...');
    
    // Test with a star player
    const starMetrics = calculateQualityMetrics(sampleStats);
    log('\nStar Player Metrics:');
    log(JSON.stringify(starMetrics, null, 2));
    
    // Test with average player
    const averageMetrics = calculateQualityMetrics(averageStats);
    log('\nAverage Player Metrics:');
    log(JSON.stringify(averageMetrics, null, 2));
    
    // Test with rookie player (less games)
    const rookieMetrics = calculateQualityMetrics(rookieStats);
    log('\nRookie Player Metrics:');
    log(JSON.stringify(rookieMetrics, null, 2));
    
    // Test with invalid data
    log('\nTesting with invalid data (should use defaults):');
    // @ts-ignore - intentional for testing
    const invalidMetrics = calculateQualityMetrics({ gamesPlayed: 10 });
    log(JSON.stringify(invalidMetrics, null, 2));
    
    // Test specific metrics calculations
    log('\nComparison of specific metrics:');
    log(`Star player power rating: ${starMetrics.power.toFixed(2)}`);
    log(`Average player power rating: ${averageMetrics.power.toFixed(2)}`);
    log(`Rookie player power rating: ${rookieMetrics.power.toFixed(2)}`);
    
    log(`\nStar player contact rating: ${starMetrics.contactRate.toFixed(2)}`);
    log(`Average player contact rating: ${averageMetrics.contactRate.toFixed(2)}`);
    log(`Rookie player contact rating: ${rookieMetrics.contactRate.toFixed(2)}`);
    
    log(`\nStar player consistency: ${starMetrics.consistency}`);
    log(`Average player consistency: ${averageMetrics.consistency}`);
    log(`Rookie player consistency: ${rookieMetrics.consistency}`);
    
    log('\nAll tests completed successfully!');
    return true;
  } catch (error) {
    log(`Error testing quality-metrics module: ${error}`);
    if (error instanceof Error) {
      log(error.stack || 'No stack trace available');
    }
    return false;
  }
}

// Run the tests
(async () => {
  try {
    await testQualityMetrics();
  } catch (error) {
    console.error('Test execution error:', error);
  }
})();