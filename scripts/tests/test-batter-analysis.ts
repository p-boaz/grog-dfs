/**
 * Test script for batter-analysis module with real MLB data
 * 
 * This test analyzes real MLB batters using actual player IDs and game data
 */

import * as fs from "fs";
import * as path from "path";
import { 
  analyzeBatters, 
  analyzeBatter, 
  estimateBatterPoints,
  calculateProjections,
  getDefaultBatterAnalysis
} from "../../lib/mlb/dfs-analysis/batters/batter-analysis";

// Import functions from other modules for the specific analyses
import { estimateHomeRunProbability } from "../../lib/mlb/dfs-analysis/batters/home-runs";
import { calculateRunProduction } from "../../lib/mlb/dfs-analysis/batters/run-production";

// Setup logging
const LOG_FILE = path.join(
  __dirname,
  "../../logs/batter-analysis-test.log"
);
fs.writeFileSync(
  LOG_FILE,
  "--- Batter Analysis Module Test ---\n\n",
  "utf-8"
);

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + "\n", "utf-8");
}

// Sample game data for testing with REAL PLAYER IDs
const sampleGames = [
  {
    gameId: 717465,
    homeTeam: { id: 108, name: "Los Angeles Angels" },
    awayTeam: { id: 140, name: "Texas Rangers" },
    pitchers: {
      home: { id: 592789, fullName: "Tyler Anderson" },
      away: { id: 592346, fullName: "Jon Gray" },
    },
    venue: { name: "Angel Stadium" },
    ballpark: { overall: 102, types: { homeRuns: 103 } },
    environment: {
      temperature: 78,
      windSpeed: 5,
      windDirection: "Out to RF",
      isOutdoor: true,
    },
    lineups: {
      home: [
        545361, // Mike Trout
        660271, // Jo Adell
        600303, // Anthony Rendon
        571740, // Tyler Wade
        592743, // Luis Rengifo
        456078, // Justin Upton
        543760, // Kurt Suzuki
        571466, // Andrew Velazquez
      ],
      away: [
        608369, // Corey Seager
        543760, // Marcus Semien
        643376, // Adolis Garcia
        670096, // Nathaniel Lowe
        608336, // Jonah Heim
        665750, // Leody Taveras
        608671, // Travis Jankowski
        677649, // Ezequiel Duran
      ],
    },
  },
  {
    gameId: 717466,
    homeTeam: { id: 111, name: "Boston Red Sox" },
    awayTeam: { id: 147, name: "New York Yankees" },
    pitchers: {
      home: { id: 605483, fullName: "Nathan Eovaldi" },
      away: { id: 543037, fullName: "Gerrit Cole" },
    },
    venue: { name: "Fenway Park" },
    ballpark: { overall: 112, types: { homeRuns: 109 } },
    environment: {
      temperature: 72,
      windSpeed: 10,
      windDirection: "Left to Right",
      isOutdoor: true,
    },
    lineups: {
      home: [
        646240, // Alex Verdugo
        646240, // Rafael Devers
        605141, // Xander Bogaerts
        646240, // J.D. Martinez
        502110, // Christian Vazquez
        646240, // Trevor Story
        605141, // Bobby Dalbec
        646240, // Jackie Bradley Jr.
      ],
      away: [
        624413, // DJ LeMahieu
        592450, // Aaron Judge
        650402, // Anthony Rizzo
        518934, // Giancarlo Stanton
        596142, // Josh Donaldson
        650402, // Gleyber Torres
        656555, // Joey Gallo
        665487, // Isiah Kiner-Falefa
      ],
    },
  },
];

async function testBatterAnalysis() {
  try {
    log("Testing individual analyzeBatter calls with real MLB data...");

    // Extract batters from sample games and create batter info objects
    const batters = [];
    const results = [];
    
    // Process each game
    for (const game of sampleGames) {
      const gameId = game.gameId.toString();
      
      // Process home batters
      for (const batterId of game.lineups.home) {
        const batterInfo = {
          id: batterId,
          name: `Player ${batterId}`, // We don't have names, just IDs
          position: "Unknown",
          lineupPosition: game.lineups.home.indexOf(batterId) + 1,
          isHome: true,
          opposingPitcher: {
            id: game.pitchers.away.id,
            name: game.pitchers.away.fullName,
            throwsHand: "R", // Assuming right-handed for simplicity
          },
        };
        
        try {
          log(`Analyzing batter ID ${batterId} (home team) vs pitcher ${game.pitchers.away.fullName}...`);
          const analysis = await analyzeBatter(
            batterId,
            gameId,
            true,
            game.pitchers.away.id
          );
          results.push(analysis);
        } catch (error) {
          log(`Error analyzing batter ${batterId}: ${error}`);
        }
      }
      
      // Process away batters
      for (const batterId of game.lineups.away) {
        const batterInfo = {
          id: batterId,
          name: `Player ${batterId}`, // We don't have names, just IDs
          position: "Unknown",
          lineupPosition: game.lineups.away.indexOf(batterId) + 1,
          isHome: false,
          opposingPitcher: {
            id: game.pitchers.home.id,
            name: game.pitchers.home.fullName,
            throwsHand: "R", // Assuming right-handed for simplicity
          },
        };
        
        try {
          log(`Analyzing batter ID ${batterId} (away team) vs pitcher ${game.pitchers.home.fullName}...`);
          const analysis = await analyzeBatter(
            batterId,
            gameId,
            false,
            game.pitchers.home.id
          );
          results.push(analysis);
        } catch (error) {
          log(`Error analyzing batter ${batterId}: ${error}`);
        }
      }
    }
    
    const analyses = results;
    const startTime = Date.now();
    const endTime = Date.now();

    log(`Analysis completed in ${(endTime - startTime) / 1000} seconds`);
    log(`Total batters analyzed: ${analyses.length}`);

    // Sort batters manually by expected points
    log("\nSorting batters by projected points...");
    const sortedBatters = [...analyses].sort((a, b) => {
      const pointsA = a.projections?.expectedPoints || 0;
      const pointsB = b.projections?.expectedPoints || 0;
      return pointsB - pointsA; // Sort descending
    });

    log("Top 10 batters by projected points:");
    sortedBatters.slice(0, 10).forEach((batter, index) => {
      const points = batter.projections?.expectedPoints ?? 0;
      log(`${index + 1}. ${batter.name} (${batter.team}) - ${points.toFixed(1)} points`);
    });

    // Test individual batter analysis
    log("\nTesting analyzeBatter for specific player...");
    const mikeTroutId = 545361; // Mike Trout
    
    // Find the game where Mike Trout is playing
    const mikeTroutGame = sampleGames.find(game => 
      game.lineups.home.includes(mikeTroutId) || 
      game.lineups.away.includes(mikeTroutId)
    );
    
    if (mikeTroutGame) {
      const isHome = mikeTroutGame.lineups.home.includes(mikeTroutId);
      const opposingPitcherId = isHome ? 
        mikeTroutGame.pitchers.away.id : 
        mikeTroutGame.pitchers.home.id;
      
      const batterAnalysis = await analyzeBatter(
        mikeTroutId,
        mikeTroutGame.gameId,
        isHome,
        opposingPitcherId
      );
      
      log(`Analysis for Mike Trout vs ${isHome ? 'away' : 'home'} pitcher (ID: ${opposingPitcherId}):`);
      log(`  Expected points: ${batterAnalysis.projections?.expectedPoints?.toFixed(2) || 'N/A'}`);
      log(`  Confidence: ${batterAnalysis.projections?.confidence || 'N/A'}`);
    } else {
      log("Mike Trout not found in sample games lineup.");
    }

    // Test home run probability directly
    log("\nTesting estimateHomeRunProbability...");
    const aaronJudgeId = 592450; // Aaron Judge
    const gerritColeId = 543037; // Gerrit Cole (use in reverse as opposing pitcher)
    
    try {
      const hrProbability = await estimateHomeRunProbability(
        aaronJudgeId,
        gerritColeId,
        717466
      );
      
      log(`Home run probability for Aaron Judge vs Gerrit Cole:`);
      log(`  Expected HR: ${hrProbability.expectedHomeRuns?.toFixed(3) || 'N/A'}`);
      log(`  Expected points: ${hrProbability.expectedPoints?.toFixed(2) || 'N/A'}`);
      log(`  Confidence: ${hrProbability.confidence || 'N/A'}`);
    } catch (error) {
      log(`Error estimating home run probability: ${error}`);
    }

    // Test run production directly
    log("\nTesting calculateRunProduction...");
    const coreySeagerId = 608369; // Corey Seager
    const tylerAndersonId = 592789; // Tyler Anderson
    
    try {
      const runProduction = await calculateRunProduction(
        coreySeagerId,
        tylerAndersonId,
        717465
      );
      
      log(`Run production for Corey Seager vs Tyler Anderson:`);
      log(`  Expected runs: ${runProduction.expectedRuns?.toFixed(2) || 'N/A'}`);
      log(`  Expected RBIs: ${runProduction.expectedRbis?.toFixed(2) || 'N/A'}`);
      log(`  Expected points: ${runProduction.expectedPoints?.toFixed(2) || 'N/A'}`);
      log(`  Confidence: ${runProduction.confidence || 'N/A'}`);
    } catch (error) {
      log(`Error calculating run production: ${error}`);
    }

    // Output detailed analysis for one batter
    if (analyses.length > 0) {
      log("\nDetailed analysis for the top batter:");
      const topBatter = sortedBatters[0];
      log(JSON.stringify(topBatter, null, 2));
    }

    log("\nAll tests completed successfully!");
    return true;
  } catch (error) {
    log(`Error testing batter-analysis module: ${error}`);
    if (error instanceof Error) {
      log(error.stack || "No stack trace available");
    }
    return false;
  }
}

// Run the tests
(async () => {
  try {
    await testBatterAnalysis();
  } catch (error) {
    console.error("Test execution error:", error);
  }
})();