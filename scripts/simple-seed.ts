/**
 * Simple script to seed basic game and projection data
 */

import { db } from '../lib/db/drizzle';
import { mlbGames, mlbPlayers, mlbBatterProjections, mlbPitcherProjections, MLBGameStatus } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Seeding basic DFS data...');
  
  try {
    // First clean up any existing data (for testing purposes)
    console.log('Clearing existing data...');
    await db.delete(mlbPitcherProjections);
    await db.delete(mlbBatterProjections);
    await db.delete(mlbGames);
    await db.delete(mlbPlayers);
    console.log('✅ Existing data cleared');
    
    // Now insert new data
    // Create MLB Players
    const insertedPlayers = await db.insert(mlbPlayers).values([
      {
        id: 665742,
        fullName: "Pete Alonso",
        team: "New York Mets",
        teamId: 121,
        position: "1B",
        handedness: "R",
        isPitcher: false
      },
      {
        id: 547180,
        fullName: "Trea Turner",
        team: "Philadelphia Phillies",
        teamId: 143,
        position: "SS",
        handedness: "R",
        isPitcher: false
      },
      {
        id: 592789,
        fullName: "Zack Wheeler",
        team: "Philadelphia Phillies",
        teamId: 143,
        position: "SP",
        throwsHand: "R",
        isPitcher: true
      },
      {
        id: 656844,
        fullName: "David Peterson",
        team: "New York Mets",
        teamId: 121,
        position: "SP",
        throwsHand: "L",
        isPitcher: true
      }
    ]).returning();
    
    console.log(`✅ ${insertedPlayers.length} players inserted`);
    
    // Create a game (today)
    const today = new Date();
    // Format dates as strings
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeString = new Date(today.setHours(19, 5, 0)).toISOString(); // Full timestamp
    
    const insertedGames = await db.insert(mlbGames).values([
      {
        gamePk: 717465,
        gameDate: dateString as any, // Cast to any to work around type checking
        gameTime: timeString as any, // Cast to any to work around type checking
        homeTeamId: 143,
        awayTeamId: 121,
        homeTeamName: "Philadelphia Phillies",
        awayTeamName: "New York Mets",
        venueId: 2681,
        venueName: "Citizens Bank Park",
        status: MLBGameStatus.PREGAME,
        detailedState: "Scheduled"
      }
    ]).returning();
    
    console.log(`✅ ${insertedGames.length} games inserted`);
    
    // Add some projections
    const batterProjections = await db.insert(mlbBatterProjections).values([
      {
        playerId: 665742, // Pete Alonso
        gamePk: 717465,
        projectedPoints: 9.7,
        confidence: 72,
        draftKingsSalary: 5200,
        projectedHits: 0.92,
        projectedHomeRuns: 0.26,
        projectedRbi: 0.85,
        projectedRuns: 0.72,
        projectedStolenBases: 0.03,
        battingOrderPosition: 3,
        opposingPitcherId: 592789 // Wheeler
      },
      {
        playerId: 547180, // Trea Turner
        gamePk: 717465,
        projectedPoints: 8.5,
        confidence: 68,
        draftKingsSalary: 4900,
        projectedHits: 0.87,
        projectedHomeRuns: 0.18,
        projectedRbi: 0.62,
        projectedRuns: 0.78,
        projectedStolenBases: 0.21,
        battingOrderPosition: 2,
        opposingPitcherId: 656844 // Peterson
      }
    ]).returning();
    
    console.log(`✅ ${batterProjections.length} batter projections inserted`);
    
    const pitcherProjections = await db.insert(mlbPitcherProjections).values([
      {
        playerId: 592789, // Wheeler
        gamePk: 717465,
        projectedPoints: 18.2,
        confidence: 76,
        draftKingsSalary: 9700,
        projectedInnings: 6.2,
        projectedStrikeouts: 7.4,
        projectedWinProbability: 0.58,
        projectedQualityStart: 0.65,
        opposingLineupStrength: 0.62
      },
      {
        playerId: 656844, // Peterson
        gamePk: 717465,
        projectedPoints: 14.6,
        confidence: 62,
        draftKingsSalary: 7800,
        projectedInnings: 5.1,
        projectedStrikeouts: 6.2,
        projectedWinProbability: 0.42,
        projectedQualityStart: 0.48,
        opposingLineupStrength: 0.71
      }
    ]).returning();
    
    console.log(`✅ ${pitcherProjections.length} pitcher projections inserted`);
    
    // Run a query to verify data was inserted correctly
    const playerCount = await db.select({ count: sql`count(*)` }).from(mlbPlayers);
    const gameCount = await db.select({ count: sql`count(*)` }).from(mlbGames);
    const batterProjCount = await db.select({ count: sql`count(*)` }).from(mlbBatterProjections);
    const pitcherProjCount = await db.select({ count: sql`count(*)` }).from(mlbPitcherProjections);
    
    console.log(`📊 Database now contains:`);
    console.log(`- ${playerCount[0].count} players`);
    console.log(`- ${gameCount[0].count} games`);
    console.log(`- ${batterProjCount[0].count} batter projections`);
    console.log(`- ${pitcherProjCount[0].count} pitcher projections`);
    console.log('\nDatabase seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Import the client for proper connection closing
import { client } from '../lib/db/drizzle';

main();