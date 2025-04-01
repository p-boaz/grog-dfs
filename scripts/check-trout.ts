/**
 * Quick script to check Mike Trout's actual batting stats in the test environment
 * This will help us validate if the stats we're seeing are accurate
 */

import { makeMLBApiRequest } from '../lib/mlb/core/api-client';

async function checkMikeTrout() {
  try {
    // Get the current year - in the test environment it might be 2025
    const currentYear = new Date().getFullYear();
    
    console.log(`Checking Mike Trout stats in test environment for year ${currentYear}...`);
    const response = await makeMLBApiRequest(
      `/people/545361?hydrate=stats(group=[hitting],type=[yearByYear])`
    );
    
    console.log("\n=== Raw API Response ===");
    console.log(JSON.stringify(response, null, 2));
    
    // Get most recent stats (current season)
    const stats = response.people[0]?.stats || [];
    const hittingStats = stats.find(
      (s: any) => s.group.displayName === "hitting" && s.type.displayName === "yearByYear"
    );
    
    if (hittingStats?.splits?.length > 0) {
      // Get stats for the current season (which should be 2025 in the test env)
      const currentSeasonStats = hittingStats.splits.find((s: any) => 
        s.season === currentYear.toString()
      );
      
      if (currentSeasonStats) {
        console.log("\n=== Current Season Stats ===");
        console.log(JSON.stringify(currentSeasonStats, null, 2));
        
        // Print key stats
        const battingAvg = currentSeasonStats.stat.avg;
        const hits = currentSeasonStats.stat.hits;
        const atBats = currentSeasonStats.stat.atBats;
        const homeRuns = currentSeasonStats.stat.homeRuns;
        
        console.log("\n=== Key Batting Stats ===");
        console.log(`Batting Average: ${battingAvg}`);
        console.log(`Hits: ${hits}`);
        console.log(`At Bats: ${atBats}`);
        console.log(`Home Runs: ${homeRuns}`);
        
        // Check if batting average matches what we'd calculate
        const calculatedAvg = hits / atBats;
        console.log(`\nCalculated Avg: ${calculatedAvg.toFixed(3)}`);
        console.log(`API Reported Avg: ${battingAvg}`);
        console.log(`Match: ${Math.abs(calculatedAvg - parseFloat(battingAvg)) < 0.001 ? 'Yes' : 'No'}`);
      } else {
        console.log(`No stats found for the current season (${currentYear})`);
        
        // Get most recent season
        const seasons = hittingStats.splits.map((s: any) => parseInt(s.season)).sort((a: number, b: number) => b - a);
        const mostRecentSeason = seasons[0];
        
        console.log(`\nMost recent season data (${mostRecentSeason}):`);
        const mostRecentStats = hittingStats.splits.find((s: any) => s.season === mostRecentSeason.toString());
        console.log(JSON.stringify(mostRecentStats, null, 2));
      }
    } else {
      console.log("No hitting stats found");
    }
    
  } catch (error) {
    console.error("Error checking Mike Trout stats:", error);
  }
}

// Run the script
checkMikeTrout().catch(console.error);