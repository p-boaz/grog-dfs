/**
 * Test script for API to database integration
 * 
 * This script tests the MLB API integration with the database.
 */

import { insertGame, insertPlayer, saveBatterProjection, savePitcherProjection } from '../lib/db/queries';
import { MLBGameStatus } from '../lib/db/schema';
import { getSchedule } from '../lib/mlb/schedule/schedule';
import { formatDateForDb } from '../lib/db/utils';
import { getBatterStats } from '../lib/mlb/player/batter-stats';
import { batterAnalysis } from '../lib/mlb/dfs-analysis/batters/batter-analysis';

async function runApiTest() {
  console.log("Starting MLB API to database integration test...");
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Step 1: Get schedule for today
    console.log(`\nFetching MLB schedule for ${today}...`);
    const schedule = await getSchedule(today);
    
    if (!schedule.dates || schedule.dates.length === 0 || !schedule.dates[0].games || schedule.dates[0].games.length === 0) {
      console.log("No games found for today. Using sample data instead.");
      
      // Insert a sample game
      const sampleGamePk = 717000;
      console.log(`\nInserting sample game with ID ${sampleGamePk}...`);
      
      await insertGame({
        gamePk: sampleGamePk,
        gameDate: today,
        teams: {
          home: {
            team: {
              id: 143,
              name: "Philadelphia Phillies"
            }
          },
          away: {
            team: {
              id: 121,
              name: "New York Mets"
            }
          }
        },
        venue: {
          id: 2681,
          name: "Citizens Bank Park"
        },
        status: {
          abstractGameState: "Preview",
          detailedState: "Scheduled"
        }
      });
      
      console.log("✅ Sample game inserted successfully");
      
      // Insert sample players
      const batters = [
        {
          id: 665742, // Pete Alonso
          fullName: "Pete Alonso",
          team: "New York Mets",
          teamId: 121,
          position: "1B",
          handedness: "R"
        },
        {
          id: 592789, // Zack Wheeler
          fullName: "Zack Wheeler",
          team: "Philadelphia Phillies",
          teamId: 143,
          position: "SP",
          throwsHand: "R"
        }
      ];
      
      for (const player of batters) {
        console.log(`\nInserting player ${player.fullName}...`);
        if ("throwsHand" in player) {
          await insertPlayer({
            id: player.id,
            fullName: player.fullName,
            team: player.team,
            teamId: player.teamId,
            position: player.position,
            throwsHand: player.throwsHand,
            isPitcher: true
          });
        } else {
          await insertPlayer({
            id: player.id,
            fullName: player.fullName,
            team: player.team,
            teamId: player.teamId,
            position: player.position,
            handedness: player.handedness,
            isPitcher: false
          });
        }
        console.log(`✅ Player ${player.fullName} inserted successfully`);
      }
      
      // Insert projections
      console.log(`\nInserting batter projection for Pete Alonso...`);
      await saveBatterProjection({
        playerId: 665742,
        gamePk: sampleGamePk,
        projectedPoints: 15.5,
        confidence: 75,
        draftKingsSalary: 5800,
        projectedHits: 0.98,
        projectedHomeRuns: 0.35,
        projectedRbi: 1.2,
        projectedRuns: 0.85,
        projectedStolenBases: 0.03,
        battingOrderPosition: 4,
        opposingPitcherId: 592789,
        analysisFactors: ["Power hitter", "Good matchup"]
      });
      console.log(`✅ Batter projection inserted successfully`);
      
      console.log(`\nInserting pitcher projection for Zack Wheeler...`);
      await savePitcherProjection({
        playerId: 592789,
        gamePk: sampleGamePk,
        projectedPoints: 22.3,
        confidence: 82,
        draftKingsSalary: 9600,
        projectedInnings: 6.2,
        projectedStrikeouts: 7.8,
        projectedWinProbability: 0.62,
        projectedQualityStart: 0.72,
        opposingLineupStrength: 0.68,
        analysisFactors: ["High strikeout pitcher", "Home field advantage"]
      });
      console.log(`✅ Pitcher projection inserted successfully`);
    } else {
      // Use real data
      const game = schedule.dates[0].games[0];
      console.log(`\nFound game: ${game.teams.away.team.name} @ ${game.teams.home.team.name}`);
      
      // Insert the game
      console.log(`\nInserting game with ID ${game.gamePk}...`);
      await insertGame({
        gamePk: game.gamePk,
        gameDate: today,
        teams: {
          home: {
            team: {
              id: game.teams.home.team.id,
              name: game.teams.home.team.name
            }
          },
          away: {
            team: {
              id: game.teams.away.team.id,
              name: game.teams.away.team.name
            }
          }
        },
        venue: game.venue,
        status: game.status
      });
      console.log(`✅ Game inserted successfully`);
      
      // Insert a player
      if (game.teams.away.probablePitcher) {
        const pitcherId = game.teams.away.probablePitcher.id;
        const pitcherName = game.teams.away.probablePitcher.fullName;
        
        console.log(`\nInserting pitcher ${pitcherName}...`);
        await insertPlayer({
          id: pitcherId,
          fullName: pitcherName,
          team: game.teams.away.team.name,
          teamId: game.teams.away.team.id,
          position: "SP",
          throwsHand: "R", // Default
          isPitcher: true
        });
        
        console.log(`✅ Pitcher inserted successfully`);
        
        // Insert a pitcher projection
        console.log(`\nInserting pitcher projection for ${pitcherName}...`);
        await savePitcherProjection({
          playerId: pitcherId,
          gamePk: game.gamePk,
          projectedPoints: 20.5,
          confidence: 75,
          draftKingsSalary: 8500,
          projectedInnings: 5.8,
          projectedStrikeouts: 7.2,
          projectedWinProbability: 0.55,
          projectedQualityStart: 0.65,
          opposingLineupStrength: 0.62,
          analysisFactors: ["Real API pitcher"]
        });
        console.log(`✅ Pitcher projection inserted successfully`);
      }
    }
    
    console.log("\nAPI to database integration test completed successfully!");
    
  } catch (error) {
    console.error("❌ API to database integration test failed:", error);
  }
}

// Run the test
runApiTest().catch(error => {
  console.error("Unhandled error in test script:", error);
});