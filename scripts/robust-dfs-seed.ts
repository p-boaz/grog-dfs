/**
 * Robust MLB DFS Database Seeding Script
 * 
 * This script provides a reliable mechanism for seeding the DFS database tables with 
 * comprehensive sample data. It handles date formatting properly for PostgreSQL,
 * includes proper error handling, and provides multiple seeding options.
 * 
 * Run with: pnpm tsx scripts/robust-dfs-seed.ts [option]
 * Options:
 *   --reset         Clear existing data before seeding
 *   --sample        Use sample data only (default)
 *   --players       Seed players only
 *   --games         Seed games only
 *   --projections   Seed projections only
 *   --env=dev|test  Specify environment (defaults to dev)
 */

import { db, client } from '../lib/db/drizzle';
import { 
  mlbPlayers, 
  mlbBatterStats, 
  mlbPitcherStats, 
  mlbGames, 
  mlbBatterProjections, 
  mlbPitcherProjections, 
  MLBGameStatus 
} from '../lib/db/schema';
import { sql } from 'drizzle-orm';
import { Domain } from '../lib/mlb/types';
import fs from 'fs';
import path from 'path';
import { 
  insertGame,
  insertPlayer,
  insertBatterStats,
  insertPitcherStats,
  saveBatterProjection,
  savePitcherProjection
} from '../lib/db/queries';

// Define sample data
const SAMPLE_DATA_FILE = path.join(process.cwd(), "data", "sample-dfs-data.json");
let sampleData: any = null;

// Command line arguments
const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');
const seedPlayersOnly = args.includes('--players');
const seedGamesOnly = args.includes('--games');
const seedProjectionsOnly = args.includes('--projections');
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'dev';

// Process-wide error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close database connection on error
  client.end().then(() => {
    process.exit(1);
  });
});

// Load sample data
function loadSampleData() {
  try {
    if (fs.existsSync(SAMPLE_DATA_FILE)) {
      console.log('Loading sample data from file...');
      sampleData = JSON.parse(fs.readFileSync(SAMPLE_DATA_FILE, "utf-8"));
      return true;
    } else {
      console.error('Sample data file not found:', SAMPLE_DATA_FILE);
      return false;
    }
  } catch (err) {
    console.error("Error loading sample data:", err);
    return false;
  }
}

// Format date safely for Postgres
function formatDate(dateString: string) {
  try {
    // Just get the date part YYYY-MM-DD
    return dateString.split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return new Date().toISOString().split('T')[0]; // Fallback to today
  }
}

// Clear existing data
async function resetData() {
  if (!shouldReset) return;
  
  console.log('Clearing existing data...');
  try {
    await db.delete(mlbPitcherProjections);
    await db.delete(mlbBatterProjections);
    await db.delete(mlbPitcherStats);
    await db.delete(mlbBatterStats);
    await db.delete(mlbGames);
    await db.delete(mlbPlayers);
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error; // Re-throw to handle in the main function
  }
}

// Seed MLB Players and Stats
async function seedPlayers() {
  if (seedGamesOnly || seedProjectionsOnly) return;
  
  console.log('Seeding MLB players...');
  
  // Sample Players (include more diversity for testing different scenarios)
  const players = [
    // Batters
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
      id: 545361,
      fullName: "Mike Trout",
      team: "Los Angeles Angels",
      teamId: 108,
      position: "CF",
      handedness: "R",
      isPitcher: false
    },
    {
      id: 605141,
      fullName: "Mookie Betts",
      team: "Los Angeles Dodgers",
      teamId: 119,
      position: "RF",
      handedness: "R",
      isPitcher: false
    },
    {
      id: 670541,
      fullName: "Vladimir Guerrero Jr.",
      team: "Toronto Blue Jays",
      teamId: 141,
      position: "1B",
      handedness: "R",
      isPitcher: false
    },
    {
      id: 660271,
      fullName: "Juan Soto",
      team: "New York Yankees",
      teamId: 147,
      position: "RF",
      handedness: "L",
      isPitcher: false
    },
    // Pitchers
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
    },
    {
      id: 477132,
      fullName: "Max Scherzer",
      team: "Texas Rangers",
      teamId: 140,
      position: "SP",
      throwsHand: "R",
      isPitcher: true
    },
    {
      id: 518516,
      fullName: "Gerrit Cole",
      team: "New York Yankees",
      teamId: 147,
      position: "SP",
      throwsHand: "R",
      isPitcher: true
    },
    {
      id: 621244,
      fullName: "Shane Bieber",
      team: "Cleveland Guardians",
      teamId: 114,
      position: "SP",
      throwsHand: "R",
      isPitcher: true
    },
    {
      id: 663855,
      fullName: "Shohei Ohtani",
      team: "Los Angeles Dodgers",
      teamId: 119,
      position: "SP/DH",
      throwsHand: "R",
      handedness: "L", // Special case: two-way player
      isPitcher: true
    }
  ];

  // Insert players
  try {
    const insertedPlayers = await db.insert(mlbPlayers).values(players)
      .onConflictDoUpdate({
        target: mlbPlayers.id,
        set: {
          fullName: sql`EXCLUDED.full_name`,
          team: sql`EXCLUDED.team`,
          teamId: sql`EXCLUDED.team_id`,
          position: sql`EXCLUDED.position`,
          handedness: sql`EXCLUDED.handedness`,
          throwsHand: sql`EXCLUDED.throws_hand`
        }
      })
      .returning();
    
    console.log(`✅ ${insertedPlayers.length} players inserted or updated`);
    
    // Add stats for players (just the first few for demonstration)
    if (insertedPlayers.length > 0) {
      await seedPlayerStats();
    }
  } catch (error) {
    console.error('Error seeding players:', error);
    throw error;
  }
}

// Seed player stats
async function seedPlayerStats() {
  console.log('Seeding player statistics...');
  
  // Sample batter stats
  const batterStats: Array<{playerId: number, stats: any, isCareer?: boolean}> = [
    {
      playerId: 665742, // Pete Alonso
      stats: {
        gamesPlayed: 162,
        atBats: 552,
        hits: 146,
        homeRuns: 46,
        rbi: 118,
        stolenBases: 4,
        avg: 0.265,
        obp: 0.358,
        slg: 0.542,
        ops: 0.900,
        runs: 96,
        walks: 78,
        strikeouts: 147,
        caughtStealing: 1,
        doubles: 31,
        triples: 1,
        hitByPitches: 10,
        sacrificeFlies: 6,
        plateAppearances: 646,
        babip: 0.271,
        iso: 0.277,
        hrRate: 0.083,
        kRate: 0.227,
        bbRate: 0.121,
        sbRate: 0.025
      }
    },
    {
      playerId: 547180, // Trea Turner
      stats: {
        gamesPlayed: 155,
        atBats: 592,
        hits: 172,
        homeRuns: 26,
        rbi: 76,
        stolenBases: 30,
        avg: 0.291,
        obp: 0.342,
        slg: 0.482,
        ops: 0.824,
        runs: 102,
        walks: 47,
        strikeouts: 118,
        caughtStealing: 5,
        doubles: 35,
        triples: 5,
        hitByPitches: 8,
        sacrificeFlies: 3,
        plateAppearances: 650,
        babip: 0.315,
        iso: 0.191,
        hrRate: 0.044,
        kRate: 0.182,
        bbRate: 0.072,
        sbRate: 0.194
      }
    },
    {
      playerId: 545361, // Mike Trout
      stats: {
        gamesPlayed: 82,
        atBats: 300,
        hits: 90,
        homeRuns: 28,
        rbi: 65,
        stolenBases: 8,
        avg: 0.300,
        obp: 0.402,
        slg: 0.633,
        ops: 1.035,
        runs: 62,
        walks: 55,
        strikeouts: 89,
        caughtStealing: 2,
        doubles: 18,
        triples: 2,
        hitByPitches: 7,
        sacrificeFlies: 3,
        plateAppearances: 365,
        babip: 0.320,
        iso: 0.333,
        hrRate: 0.093,
        kRate: 0.244,
        bbRate: 0.151,
        sbRate: 0.027
      }
    }
  ];
  
  // Sample pitcher stats
  const pitcherStats: Array<{playerId: number, stats: any, isCareer?: boolean}> = [
    {
      playerId: 592789, // Zack Wheeler
      stats: {
        gamesPlayed: 32,
        gamesStarted: 32,
        inningsPitched: 207,
        wins: 14,
        losses: 8,
        era: 3.07,
        whip: 1.05,
        strikeouts: 212,
        walks: 45,
        saves: 0,
        homeRunsAllowed: 23,
        hitBatsmen: 5,
        qualityStarts: 23,
        blownSaves: 0,
        holds: 0,
        battersFaced: 839,
        hitsAllowed: 173,
        earnedRuns: 71,
        completeGames: 1,
        shutouts: 0,
        kRate: 0.253,
        bbRate: 0.054,
        k9: 9.22,
        bb9: 1.96,
        hr9: 1.00
      }
    },
    {
      playerId: 656844, // David Peterson
      stats: {
        gamesPlayed: 23,
        gamesStarted: 22,
        inningsPitched: 118.2,
        wins: 8,
        losses: 5,
        era: 4.32,
        whip: 1.42,
        strikeouts: 131,
        walks: 53,
        saves: 0,
        homeRunsAllowed: 15,
        hitBatsmen: 4,
        qualityStarts: 8,
        blownSaves: 0,
        holds: 0,
        battersFaced: 519,
        hitsAllowed: 116,
        earnedRuns: 57,
        completeGames: 0,
        shutouts: 0,
        kRate: 0.252,
        bbRate: 0.102,
        k9: 9.93,
        bb9: 4.02,
        hr9: 1.14
      }
    },
    {
      playerId: 518516, // Gerrit Cole
      stats: {
        gamesPlayed: 33,
        gamesStarted: 33,
        inningsPitched: 209,
        wins: 15,
        losses: 4,
        era: 2.63,
        whip: 0.98,
        strikeouts: 222,
        walks: 44,
        saves: 0,
        homeRunsAllowed: 18,
        hitBatsmen: 3,
        qualityStarts: 26,
        blownSaves: 0,
        holds: 0,
        battersFaced: 842,
        hitsAllowed: 161,
        earnedRuns: 61,
        completeGames: 2,
        shutouts: 1,
        kRate: 0.264,
        bbRate: 0.052,
        k9: 9.57,
        bb9: 1.90,
        hr9: 0.78
      }
    }
  ];
  
  try {
    // Insert batter stats
    for (const { playerId, stats } of batterStats) {
      // Current season stats
      await db.insert(mlbBatterStats).values({
        playerId,
        season: '2025',
        isCareer: false,
        gamesPlayed: stats.gamesPlayed,
        atBats: stats.atBats,
        hits: stats.hits,
        homeRuns: stats.homeRuns,
        rbi: stats.rbi,
        stolenBases: stats.stolenBases,
        avg: stats.avg,
        obp: stats.obp,
        slg: stats.slg,
        ops: stats.ops,
        runs: stats.runs,
        walks: stats.walks,
        strikeouts: stats.strikeouts,
        caughtStealing: stats.caughtStealing,
        doubles: stats.doubles,
        triples: stats.triples,
        hitByPitches: stats.hitByPitches,
        sacrificeFlies: stats.sacrificeFlies,
        plateAppearances: stats.plateAppearances,
        babip: stats.babip,
        iso: stats.iso,
        hrRate: stats.hrRate,
        kRate: stats.kRate,
        bbRate: stats.bbRate,
        sbRate: stats.sbRate
      }).onConflictDoUpdate({
        target: [mlbBatterStats.playerId, mlbBatterStats.season, mlbBatterStats.isCareer],
        set: {
          gamesPlayed: sql`EXCLUDED.games_played`,
          atBats: sql`EXCLUDED.at_bats`,
          hits: sql`EXCLUDED.hits`,
          // Other fields...
          lastUpdated: sql`now()`
        }
      });
      
      // Also add career stats (slightly inflated)
      await db.insert(mlbBatterStats).values({
        playerId,
        season: 'career',
        isCareer: true,
        gamesPlayed: stats.gamesPlayed * 3,
        atBats: stats.atBats * 3,
        hits: stats.hits * 3,
        homeRuns: Math.round(stats.homeRuns * 3.2),
        rbi: Math.round(stats.rbi * 3.1),
        stolenBases: Math.round(stats.stolenBases * 2.8),
        avg: Math.round(stats.avg * 1000) / 1000, // Keep same average
        obp: Math.round(stats.obp * 1000) / 1000,
        slg: Math.round(stats.slg * 1000) / 1000,
        ops: Math.round(stats.ops * 1000) / 1000,
        runs: Math.round(stats.runs * 3),
        walks: Math.round(stats.walks * 3.1),
        strikeouts: Math.round(stats.strikeouts * 2.9),
        caughtStealing: Math.round(stats.caughtStealing * 2.5),
        doubles: Math.round(stats.doubles * 3.1),
        triples: Math.round(stats.triples * 2.2),
        hitByPitches: Math.round(stats.hitByPitches * 2.8),
        sacrificeFlies: Math.round(stats.sacrificeFlies * 2.7),
        plateAppearances: Math.round(stats.plateAppearances * 3),
        babip: Math.round(stats.babip * 1000) / 1000,
        iso: Math.round(stats.iso * 1000) / 1000,
        hrRate: Math.round(stats.hrRate * 1000) / 1000,
        kRate: Math.round(stats.kRate * 1000) / 1000,
        bbRate: Math.round(stats.bbRate * 1000) / 1000,
        sbRate: Math.round(stats.sbRate * 1000) / 1000
      }).onConflictDoUpdate({
        target: [mlbBatterStats.playerId, mlbBatterStats.season, mlbBatterStats.isCareer],
        set: {
          lastUpdated: sql`now()`
        }
      });
    }
    
    // Insert pitcher stats
    for (const { playerId, stats } of pitcherStats) {
      // Current season stats
      await db.insert(mlbPitcherStats).values({
        playerId,
        season: '2025',
        isCareer: false,
        gamesPlayed: stats.gamesPlayed,
        gamesStarted: stats.gamesStarted,
        inningsPitched: stats.inningsPitched,
        wins: stats.wins,
        losses: stats.losses,
        era: stats.era,
        whip: stats.whip,
        strikeouts: stats.strikeouts,
        walks: stats.walks,
        saves: stats.saves,
        homeRunsAllowed: stats.homeRunsAllowed,
        hitBatsmen: stats.hitBatsmen,
        qualityStarts: stats.qualityStarts,
        blownSaves: stats.blownSaves,
        holds: stats.holds,
        battersFaced: stats.battersFaced,
        hitsAllowed: stats.hitsAllowed,
        earnedRuns: stats.earnedRuns,
        completeGames: stats.completeGames,
        shutouts: stats.shutouts,
        kRate: stats.kRate,
        bbRate: stats.bbRate,
        k9: stats.k9,
        bb9: stats.bb9,
        hr9: stats.hr9
      }).onConflictDoUpdate({
        target: [mlbPitcherStats.playerId, mlbPitcherStats.season, mlbPitcherStats.isCareer],
        set: {
          lastUpdated: sql`now()`
        }
      });
      
      // Also add career stats
      await db.insert(mlbPitcherStats).values({
        playerId,
        season: 'career',
        isCareer: true,
        gamesPlayed: stats.gamesPlayed * 4,
        gamesStarted: stats.gamesStarted * 4,
        inningsPitched: stats.inningsPitched * 4,
        wins: Math.round(stats.wins * 3.8),
        losses: Math.round(stats.losses * 3.7),
        era: Math.round(stats.era * 100) / 100, // Keep similar ERA
        whip: Math.round(stats.whip * 100) / 100,
        strikeouts: Math.round(stats.strikeouts * 4),
        walks: Math.round(stats.walks * 3.9),
        saves: Math.round(stats.saves * 3.5),
        homeRunsAllowed: Math.round(stats.homeRunsAllowed * 3.8),
        hitBatsmen: Math.round(stats.hitBatsmen * 3.6),
        qualityStarts: Math.round(stats.qualityStarts * 3.9),
        blownSaves: Math.round(stats.blownSaves * 3.7),
        holds: Math.round(stats.holds * 3.5),
        battersFaced: Math.round(stats.battersFaced * 4),
        hitsAllowed: Math.round(stats.hitsAllowed * 3.9),
        earnedRuns: Math.round(stats.earnedRuns * 3.9),
        completeGames: Math.round(stats.completeGames * 3.5),
        shutouts: Math.round(stats.shutouts * 3.2),
        kRate: Math.round(stats.kRate * 1000) / 1000,
        bbRate: Math.round(stats.bbRate * 1000) / 1000,
        k9: Math.round(stats.k9 * 100) / 100,
        bb9: Math.round(stats.bb9 * 100) / 100,
        hr9: Math.round(stats.hr9 * 100) / 100
      }).onConflictDoUpdate({
        target: [mlbPitcherStats.playerId, mlbPitcherStats.season, mlbPitcherStats.isCareer],
        set: {
          lastUpdated: sql`now()`
        }
      });
    }
    
    console.log(`✅ Player stats inserted: ${batterStats.length} batters, ${pitcherStats.length} pitchers`);
  } catch (error) {
    console.error('Error seeding player stats:', error);
    throw error;
  }
}

// Seed MLB Games
async function seedGames() {
  if (seedPlayersOnly || seedProjectionsOnly) return;
  
  console.log('Seeding MLB games...');
  
  // Create a week of games (today and next 6 days)
  const games = [];
  const today = new Date();
  
  // Teams (for creating different matchups)
  const teams = [
    { id: 143, name: "Philadelphia Phillies" },
    { id: 121, name: "New York Mets" },
    { id: 147, name: "New York Yankees" },
    { id: 110, name: "Baltimore Orioles" },
    { id: 119, name: "Los Angeles Dodgers" },
    { id: 117, name: "Houston Astros" },
    { id: 141, name: "Toronto Blue Jays" },
    { id: 108, name: "Los Angeles Angels" },
    { id: 133, name: "Oakland Athletics" },
    { id: 144, name: "Atlanta Braves" }
  ];
  
  // Venues
  const venues = [
    { id: 2681, name: "Citizens Bank Park" },
    { id: 3289, name: "Citi Field" },
    { id: 3313, name: "Yankee Stadium" },
    { id: 2392, name: "Camden Yards" },
    { id: 22, name: "Dodger Stadium" },
    { id: 2392, name: "Minute Maid Park" },
    { id: 14, name: "Rogers Centre" },
    { id: 1, name: "Angel Stadium" },
    { id: 10, name: "Oakland Coliseum" },
    { id: 4705, name: "Truist Park" }
  ];
  
  // Create games for the next 7 days
  for (let i = 0; i < 7; i++) {
    const gameDate = new Date(today);
    gameDate.setDate(today.getDate() + i);
    const dateString = gameDate.toISOString().split('T')[0];
    
    // Create 3 games for each day
    for (let j = 0; j < 3; j++) {
      const homeTeamIndex = (j * 2) % teams.length;
      const awayTeamIndex = (j * 2 + 1) % teams.length;
      const venueIndex = homeTeamIndex % venues.length;
      
      // Game time (afternoon and evening games)
      const gameHour = j === 0 ? 13 : j === 1 ? 16 : 19;
      const gameMinute = j === 0 ? 5 : j === 1 ? 10 : 5;
      
      const gameTime = new Date(gameDate);
      gameTime.setHours(gameHour, gameMinute, 0);
      
      // Generate a unique gamePk (day * 1000 + game number + seed)
      const gamePk = 717000 + (i * 100) + j + 1;
      
      // Status is dependent on date
      let status = MLBGameStatus.SCHEDULED;
      // Games in the past are FINAL, today's games are LIVE or PREGAME, future games are SCHEDULED
      if (i === 0) {
        if (gameHour <= new Date().getHours()) {
          status = MLBGameStatus.LIVE;
        } else {
          status = MLBGameStatus.PREGAME;
        }
      } else if (i < 0) {
        status = MLBGameStatus.FINAL;
      }
      
      games.push({
        gamePk,
        gameDate: dateString as any, // Casting to bypass TypeScript's date validation
        gameTime: gameTime.toISOString() as any,
        homeTeamId: teams[homeTeamIndex].id,
        awayTeamId: teams[awayTeamIndex].id,
        homeTeamName: teams[homeTeamIndex].name,
        awayTeamName: teams[awayTeamIndex].name,
        venueId: venues[venueIndex].id,
        venueName: venues[venueIndex].name,
        status,
        detailedState: status === MLBGameStatus.LIVE ? "In Progress" : 
                       status === MLBGameStatus.FINAL ? "Final" : "Scheduled"
      });
    }
  }
  
  try {
    // Insert games using the upsert pattern
    const insertedGames = await db.insert(mlbGames).values(games)
      .onConflictDoUpdate({
        target: mlbGames.gamePk,
        set: {
          gameDate: sql`EXCLUDED.game_date`,
          gameTime: sql`EXCLUDED.game_time`,
          homeTeamId: sql`EXCLUDED.home_team_id`,
          awayTeamId: sql`EXCLUDED.away_team_id`,
          homeTeamName: sql`EXCLUDED.home_team_name`,
          awayTeamName: sql`EXCLUDED.away_team_name`,
          venueId: sql`EXCLUDED.venue_id`,
          venueName: sql`EXCLUDED.venue_name`,
          status: sql`EXCLUDED.status`,
          detailedState: sql`EXCLUDED.detailed_state`,
          lastUpdated: sql`now()`
        }
      })
      .returning();
    
    console.log(`✅ ${insertedGames.length} games inserted or updated`);
  } catch (error) {
    console.error('Error seeding games:', error);
    throw error;
  }
}

// Seed MLB Projections
async function seedProjections() {
  if (seedPlayersOnly || seedGamesOnly) return;
  
  console.log('Seeding MLB projections...');
  
  try {
    // Get all players by type
    const batters = await db.select().from(mlbPlayers).where(sql`is_pitcher = false`);
    const pitchers = await db.select().from(mlbPlayers).where(sql`is_pitcher = true`);
    
    // Get games for the week (ordered by date)
    const games = await db.select().from(mlbGames).orderBy(mlbGames.gameDate, mlbGames.gameTime);
    
    if (batters.length === 0 || pitchers.length === 0 || games.length === 0) {
      console.log('No players or games found. Please seed players and games first.');
      return;
    }
    
    // Create batter projections
    const batterProjections = [];
    
    // Assign each batter to games where their team is playing
    for (const game of games) {
      // Find batters on home team
      const homeBatters = batters.filter(b => b.teamId === game.homeTeamId);
      // Find batters on away team
      const awayBatters = batters.filter(b => b.teamId === game.awayTeamId);
      
      // Find opponent pitchers
      const homePitchers = pitchers.filter(p => p.teamId === game.homeTeamId);
      const awayPitchers = pitchers.filter(p => p.teamId === game.awayTeamId);
      
      // Assign a starting pitcher from each team if available
      const homeStartingPitcher = homePitchers.length > 0 ? homePitchers[0] : null;
      const awayStartingPitcher = awayPitchers.length > 0 ? awayPitchers[0] : null;
      
      // Create projections for home batters
      for (let i = 0; i < homeBatters.length; i++) {
        const batter = homeBatters[i];
        const battingOrder = i < 9 ? i + 1 : 0; // For players not in the starting lineup
        
        // Generate some realistic projected stats
        const projectedHits = Math.random() * 0.4 + 0.5; // 0.5 to 0.9
        const projectedHomeRuns = Math.random() * 0.3; // 0 to 0.3
        const projectedRbi = Math.random() * 1 + 0.3; // 0.3 to 1.3
        const projectedRuns = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
        const projectedStolenBases = Math.random() * 0.25; // 0 to 0.25
        
        // Calculate expected DFS points using DraftKings scoring
        const expectedPoints = 
          projectedHits * 3 + // Singles
          projectedHomeRuns * 10 + // Home runs
          projectedRbi * 2 + // RBI
          projectedRuns * 2 + // Runs
          projectedStolenBases * 5; // Stolen bases
        
        // Insert or update projection
        batterProjections.push({
          playerId: batter.id,
          gamePk: game.gamePk,
          projectedPoints: Math.round(expectedPoints * 100) / 100,
          confidence: Math.round(Math.random() * 30 + 50), // 50-80% confidence
          draftKingsSalary: Math.round(3000 + Math.random() * 6000), // $3,000 to $9,000
          projectedHits,
          projectedHomeRuns,
          projectedRbi,
          projectedRuns,
          projectedStolenBases,
          battingOrderPosition: battingOrder,
          opposingPitcherId: awayStartingPitcher?.id,
          analysisFactors: ["matchup", "ballpark factors", "recent performance"]
        });
      }
      
      // Create projections for away batters
      for (let i = 0; i < awayBatters.length; i++) {
        const batter = awayBatters[i];
        const battingOrder = i < 9 ? i + 1 : 0; // For players not in the starting lineup
        
        // Generate some realistic projected stats
        const projectedHits = Math.random() * 0.4 + 0.5; // 0.5 to 0.9
        const projectedHomeRuns = Math.random() * 0.3; // 0 to 0.3
        const projectedRbi = Math.random() * 1 + 0.3; // 0.3 to 1.3
        const projectedRuns = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
        const projectedStolenBases = Math.random() * 0.25; // 0 to 0.25
        
        // Calculate expected DFS points using DraftKings scoring
        const expectedPoints = 
          projectedHits * 3 + // Singles
          projectedHomeRuns * 10 + // Home runs
          projectedRbi * 2 + // RBI
          projectedRuns * 2 + // Runs
          projectedStolenBases * 5; // Stolen bases
        
        // Insert or update projection
        batterProjections.push({
          playerId: batter.id,
          gamePk: game.gamePk,
          projectedPoints: Math.round(expectedPoints * 100) / 100,
          confidence: Math.round(Math.random() * 30 + 50), // 50-80% confidence
          draftKingsSalary: Math.round(3000 + Math.random() * 6000), // $3,000 to $9,000
          projectedHits,
          projectedHomeRuns,
          projectedRbi,
          projectedRuns,
          projectedStolenBases,
          battingOrderPosition: battingOrder,
          opposingPitcherId: homeStartingPitcher?.id,
          analysisFactors: ["matchup", "ballpark factors", "recent performance"]
        });
      }
    }
    
    // Process batches of 50 projections at a time
    for (let i = 0; i < batterProjections.length; i += 50) {
      const batch = batterProjections.slice(i, i + 50);
      await db.insert(mlbBatterProjections).values(batch)
        .onConflictDoUpdate({
          target: [mlbBatterProjections.playerId, mlbBatterProjections.gamePk],
          set: {
            projectedPoints: sql`EXCLUDED.projected_points`,
            confidence: sql`EXCLUDED.confidence`,
            draftKingsSalary: sql`EXCLUDED.dk_salary`,
            projectedHits: sql`EXCLUDED.projected_hits`,
            projectedHomeRuns: sql`EXCLUDED.projected_home_runs`,
            projectedRbi: sql`EXCLUDED.projected_rbi`,
            projectedRuns: sql`EXCLUDED.projected_runs`,
            projectedStolenBases: sql`EXCLUDED.projected_stolen_bases`,
            battingOrderPosition: sql`EXCLUDED.batting_order_position`,
            opposingPitcherId: sql`EXCLUDED.opposing_pitcher_id`,
            analysisFactors: sql`EXCLUDED.analysis_factors`,
            createdAt: sql`now()`
          }
        });
    }
    console.log(`✅ ${batterProjections.length} batter projections inserted or updated`);
    
    // Create pitcher projections
    const pitcherProjections = [];
    
    // For each game, create projections for starting pitchers
    for (const game of games) {
      // Find starting pitchers for this game
      const homePitchers = pitchers.filter(p => p.teamId === game.homeTeamId);
      const awayPitchers = pitchers.filter(p => p.teamId === game.awayTeamId);
      
      // Skip if no pitchers are available for either team
      if (homePitchers.length === 0 || awayPitchers.length === 0) continue;
      
      // Create projection for home pitcher
      const homePitcher = homePitchers[0];
      const homeInnings = Math.random() * 2.0 + 4.5; // 4.5 to 6.5 innings
      const homeStrikeouts = Math.random() * 4.0 + 3.0; // 3 to 7 strikeouts
      const homeWinProb = Math.random() * 0.3 + 0.35; // 35% to 65% win probability
      const homeQsProb = Math.random() * 0.4 + 0.3; // 30% to 70% quality start probability
      
      // Calculate expected DFS points using DraftKings scoring
      const homePoints = 
        homeInnings * 2.25 + // Innings pitched
        homeStrikeouts * 2 + // Strikeouts
        homeWinProb * 4; // Win probability * win points
      
      pitcherProjections.push({
        playerId: homePitcher.id,
        gamePk: game.gamePk,
        projectedPoints: Math.round(homePoints * 100) / 100,
        confidence: Math.round(Math.random() * 30 + 50), // 50-80% confidence
        draftKingsSalary: Math.round(6000 + Math.random() * 6000), // $6,000 to $12,000
        projectedInnings: Math.round(homeInnings * 10) / 10,
        projectedStrikeouts: Math.round(homeStrikeouts * 10) / 10,
        projectedWinProbability: Math.round(homeWinProb * 100) / 100,
        projectedQualityStart: Math.round(homeQsProb * 100) / 100,
        opposingLineupStrength: Math.round(Math.random() * 100) / 100, // 0 to 1
        analysisFactors: ["strikeout potential", "team win probability", "innings efficiency"]
      });
      
      // Create projection for away pitcher
      const awayPitcher = awayPitchers[0];
      const awayInnings = Math.random() * 2.0 + 4.5; // 4.5 to 6.5 innings
      const awayStrikeouts = Math.random() * 4.0 + 3.0; // 3 to 7 strikeouts
      const awayWinProb = Math.random() * 0.3 + 0.35; // 35% to 65% win probability
      const awayQsProb = Math.random() * 0.4 + 0.3; // 30% to 70% quality start probability
      
      // Calculate expected DFS points using DraftKings scoring
      const awayPoints = 
        awayInnings * 2.25 + // Innings pitched
        awayStrikeouts * 2 + // Strikeouts
        awayWinProb * 4; // Win probability * win points
      
      pitcherProjections.push({
        playerId: awayPitcher.id,
        gamePk: game.gamePk,
        projectedPoints: Math.round(awayPoints * 100) / 100,
        confidence: Math.round(Math.random() * 30 + 50), // 50-80% confidence
        draftKingsSalary: Math.round(6000 + Math.random() * 6000), // $6,000 to $12,000
        projectedInnings: Math.round(awayInnings * 10) / 10,
        projectedStrikeouts: Math.round(awayStrikeouts * 10) / 10,
        projectedWinProbability: Math.round(awayWinProb * 100) / 100,
        projectedQualityStart: Math.round(awayQsProb * 100) / 100,
        opposingLineupStrength: Math.round(Math.random() * 100) / 100, // 0 to 1
        analysisFactors: ["strikeout potential", "team win probability", "innings efficiency"]
      });
    }
    
    // Process pitcher projections
    await db.insert(mlbPitcherProjections).values(pitcherProjections)
      .onConflictDoUpdate({
        target: [mlbPitcherProjections.playerId, mlbPitcherProjections.gamePk],
        set: {
          projectedPoints: sql`EXCLUDED.projected_points`,
          confidence: sql`EXCLUDED.confidence`,
          draftKingsSalary: sql`EXCLUDED.dk_salary`,
          projectedInnings: sql`EXCLUDED.projected_innings`,
          projectedStrikeouts: sql`EXCLUDED.projected_strikeouts`,
          projectedWinProbability: sql`EXCLUDED.projected_win_probability`,
          projectedQualityStart: sql`EXCLUDED.projected_quality_start`,
          opposingLineupStrength: sql`EXCLUDED.opposing_lineup_strength`,
          analysisFactors: sql`EXCLUDED.analysis_factors`,
          createdAt: sql`now()`
        }
      });
    
    console.log(`✅ ${pitcherProjections.length} pitcher projections inserted or updated`);
  } catch (error) {
    console.error('Error seeding projections:', error);
    throw error;
  }
}

// Main function to orchestrate the seeding process
async function main() {
  console.log(`Starting MLB DFS data seeding (${env} environment)...`);
  
  try {
    // First, load sample data for validation
    loadSampleData();
    
    // Reset data if requested
    await resetData();
    
    // Seed the data in sequence
    await seedPlayers();
    await seedGames();
    await seedProjections();
    
    // Print summary of what's in the database
    await printDatabaseSummary();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Print a summary of the database contents
async function printDatabaseSummary() {
  try {
    const playerCount = await db.select({ count: sql`count(*)` }).from(mlbPlayers);
    const gameCount = await db.select({ count: sql`count(*)` }).from(mlbGames);
    const batterStatsCount = await db.select({ count: sql`count(*)` }).from(mlbBatterStats);
    const pitcherStatsCount = await db.select({ count: sql`count(*)` }).from(mlbPitcherStats);
    const batterProjCount = await db.select({ count: sql`count(*)` }).from(mlbBatterProjections);
    const pitcherProjCount = await db.select({ count: sql`count(*)` }).from(mlbPitcherProjections);
    
    console.log(`\n📊 Database now contains:`);
    console.log(`- ${playerCount[0].count} players`);
    console.log(`- ${gameCount[0].count} games`);
    console.log(`- ${batterStatsCount[0].count} batter stats records`);
    console.log(`- ${pitcherStatsCount[0].count} pitcher stats records`);
    console.log(`- ${batterProjCount[0].count} batter projections`);
    console.log(`- ${pitcherProjCount[0].count} pitcher projections`);
  } catch (error) {
    console.error('Error getting database summary:', error);
  }
}

// Run the main function
main();