/**
 * Test script for the migrated starting-pitcher-analysis.ts module
 */
import * as fs from 'fs';
import * as path from 'path';
import { analyzeStartingPitchers, filterPitchersByExpectedStrikeouts, filterPitchersByWinProbability, sortPitchersByProjectedPoints } from '../lib/mlb/dfs-analysis/pitchers/starting-pitcher-analysis';

// Setup logging
const LOG_FILE = path.join(__dirname, '../logs/starting-pitcher-analysis-test.log');
fs.writeFileSync(LOG_FILE, '--- Starting-Pitcher-Analysis Module Test ---\n\n', 'utf-8');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n', 'utf-8');
}

// Sample game data for testing
const sampleGames = [
  {
    gameId: 717632,
    homeTeam: { id: 145, name: 'Chicago White Sox' },
    awayTeam: { id: 137, name: 'San Francisco Giants' },
    pitchers: {
      home: { id: 608334, fullName: 'Michael Kopech' },
      away: { id: 543606, fullName: 'Alex Cobb' }
    },
    venue: { name: 'Guaranteed Rate Field' },
    ballpark: { overall: 105, types: { homeRuns: 110 } },
    environment: { 
      temperature: 75, 
      windSpeed: 8, 
      windDirection: 'Out to CF', 
      isOutdoor: true 
    },
    lineups: {
      home: [553882, 665923, 667807, 474384, 547989, 663168, 619720, 623556, 672352],
      away: [592885, 596059, 543760, 592626, 592743, 665487, 543301, 607752, 621586]
    }
  },
  {
    gameId: 717633,
    homeTeam: { id: 138, name: 'St. Louis Cardinals' },
    awayTeam: { id: 121, name: 'New York Mets' },
    pitchers: {
      home: { id: 608379, fullName: 'Jack Flaherty' },
      away: { id: 592789, fullName: 'Max Scherzer' }
    },
    venue: { name: 'Busch Stadium' },
    ballpark: { overall: 98, types: { homeRuns: 94 } },
    environment: { 
      temperature: 82, 
      windSpeed: 5, 
      windDirection: 'Left to Right', 
      isOutdoor: true 
    },
    lineups: {
      home: [572761, 425877, 543939, 641485, 547180, 607208, 669740, 675620, 608336],
      away: [605204, 493316, 624413, 431151, 605190, 643319, 656669, 594980, 453943]
    }
  }
];

async function testStartingPitcherAnalysis() {
  try {
    log('Testing analyzeStartingPitchers...');
    
    const startTime = Date.now();
    const analyses = await analyzeStartingPitchers(sampleGames);
    const endTime = Date.now();
    
    log(`Analysis completed in ${(endTime - startTime) / 1000} seconds`);
    log(`Total pitchers analyzed: ${analyses.length}`);
    
    // Test pitcher sorting
    log('\nTesting sortPitchersByProjectedPoints...');
    const sortedPitchers = sortPitchersByProjectedPoints(analyses);
    
    log('Sorted pitcher rankings:');
    sortedPitchers.forEach((pitcher, index) => {
      const points = pitcher.projections.dfsProjection.expectedPoints ?? 0;
      log(`${index + 1}. ${pitcher.name} - ${points.toFixed(1)} points`);
    });
    
    // Test pitcher filtering by win probability
    log('\nTesting filterPitchersByWinProbability (>55%)...');
    const highWinPitchers = filterPitchersByWinProbability(analyses, 55);
    
    log(`Pitchers with win probability >55%: ${highWinPitchers.length}`);
    highWinPitchers.forEach(pitcher => {
      const winProb = pitcher.projections.winProbability ?? 0;
      log(`- ${pitcher.name}: ${(winProb).toFixed(1)}% win probability`);
    });
    
    // Test pitcher filtering by strikeouts
    log('\nTesting filterPitchersByExpectedStrikeouts (>5)...');
    const highKPitchers = filterPitchersByExpectedStrikeouts(analyses, 5);
    
    log(`Pitchers with expected K's >5: ${highKPitchers.length}`);
    highKPitchers.forEach(pitcher => {
      const expectedK = pitcher.projections.expectedStrikeouts ?? 0;
      log(`- ${pitcher.name}: ${expectedK.toFixed(1)} expected strikeouts`);
    });
    
    // Output detailed analysis for one pitcher
    if (analyses.length > 0) {
      log('\nDetailed analysis for the top pitcher:');
      const topPitcher = sortedPitchers[0];
      log(JSON.stringify(topPitcher, null, 2));
    }
    
    log('\nAll tests completed successfully!');
    return true;
  } catch (error) {
    log(`Error testing starting-pitcher-analysis module: ${error}`);
    if (error instanceof Error) {
      log(error.stack || 'No stack trace available');
    }
    return false;
  }
}

// Run the tests
(async () => {
  try {
    await testStartingPitcherAnalysis();
  } catch (error) {
    console.error('Test execution error:', error);
  }
})();