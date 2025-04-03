/**
 * Script to seed DFS database with sample data
 * 
 * This script creates sample data for testing the DFS database tables
 * Run with: pnpm tsx scripts/seed-dfs-data.ts
 */

import { 
  insertGame,
  insertPlayer,
  insertBatterStats,
  insertPitcherStats,
  saveBatterProjection,
  savePitcherProjection
} from '../lib/db/queries';
import { Domain } from '../lib/mlb/types';

async function main() {
  console.log('Seeding DFS database with sample data...');
  
  // Create a sample game
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const gameTimeString = `${dateString}T19:05:00Z`; // 7:05 PM game time
  
  const sampleGame: Domain.Game = {
    gamePk: 717465,
    gameDate: gameTimeString,
    status: {
      abstractGameState: "Preview",
      detailedState: "Scheduled",
    },
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
    }
  };

  // Create another sample game
  const sampleGame2: Domain.Game = {
    gamePk: 717466,
    gameDate: gameTimeString,
    status: {
      abstractGameState: "Preview",
      detailedState: "Scheduled",
    },
    teams: {
      home: {
        team: {
          id: 146,
          name: "Miami Marlins"
        }
      },
      away: {
        team: {
          id: 144,
          name: "Atlanta Braves"
        }
      }
    },
    venue: {
      id: 4169,
      name: "LoanDepot Park"
    }
  };
  
  // Sample players - batters
  const sampleBatter1: Domain.Batter = {
    id: 665742,
    fullName: "Pete Alonso",
    team: "New York Mets",
    teamId: 121,
    position: "1B",
    handedness: "R",
    currentSeason: {
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
    },
    careerByYear: {},
    career: {
      gamesPlayed: 592,
      atBats: 2208,
      hits: 584,
      homeRuns: 173,
      rbi: 453,
      stolenBases: 9,
      avg: 0.264,
      obp: 0.350,
      slg: 0.535,
      ops: 0.885,
      runs: 381,
      walks: 292,
      strikeouts: 587,
      caughtStealing: 6,
      doubles: 107,
      triples: 3,
      hitByPitches: 45,
      sacrificeFlies: 22,
      plateAppearances: 2567,
      babip: 0.271,
      iso: 0.270,
      hrRate: 0.078,
      kRate: 0.229,
      bbRate: 0.114,
      sbRate: 0.015
    }
  };
  
  const sampleBatter2: Domain.Batter = {
    id: 547180,
    fullName: "Trea Turner",
    team: "Philadelphia Phillies",
    teamId: 143,
    position: "SS",
    handedness: "R",
    currentSeason: {
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
    },
    careerByYear: {},
    career: {
      gamesPlayed: 1022,
      atBats: 4099,
      hits: 1311,
      homeRuns: 156,
      rbi: 520,
      stolenBases: 253,
      avg: 0.320,
      obp: 0.368,
      slg: 0.512,
      ops: 0.880,
      runs: 739,
      walks: 304,
      strikeouts: 714,
      caughtStealing: 52,
      doubles: 218,
      triples: 37,
      hitByPitches: 56,
      sacrificeFlies: 31,
      plateAppearances: 4490,
      babip: 0.337,
      iso: 0.192,
      hrRate: 0.038,
      kRate: 0.159,
      bbRate: 0.068,
      sbRate: 0.247
    }
  };
  
  // Sample pitchers
  const samplePitcher1: Domain.Pitcher = {
    id: 592789,
    fullName: "Zack Wheeler",
    team: "Philadelphia Phillies",
    teamId: 143,
    position: "SP",
    throwsHand: "R",
    currentSeason: {
      gamesPlayed: 32,
      gamesStarted: 32,
      inningsPitched: 207,
      inningsDecimal: 207.0,
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
    },
    careerByYear: {},
    career: {
      gamesPlayed: 249,
      gamesStarted: 247,
      inningsPitched: 1484.2,
      inningsDecimal: 1484.67,
      wins: 98,
      losses: 76,
      era: 3.43,
      whip: 1.17,
      strikeouts: 1550,
      walks: 431,
      saves: 0,
      homeRunsAllowed: 162,
      hitBatsmen: 42,
      qualityStarts: 156,
      blownSaves: 0,
      holds: 0,
      battersFaced: 6170,
      hitsAllowed: 1297,
      earnedRuns: 566,
      completeGames: 12,
      shutouts: 4,
      kRate: 0.251,
      bbRate: 0.070,
      k9: 9.38,
      bb9: 2.61,
      hr9: 0.98
    }
  };
  
  const samplePitcher2: Domain.Pitcher = {
    id: 656844,
    fullName: "David Peterson",
    team: "New York Mets",
    teamId: 121,
    position: "SP",
    throwsHand: "L",
    currentSeason: {
      gamesPlayed: 23,
      gamesStarted: 22,
      inningsPitched: 118.2,
      inningsDecimal: 118.67,
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
    },
    careerByYear: {},
    career: {
      gamesPlayed: 88,
      gamesStarted: 75,
      inningsPitched: 409.2,
      inningsDecimal: 409.67,
      wins: 23,
      losses: 22,
      era: 4.45,
      whip: 1.40,
      strikeouts: 422,
      walks: 174,
      saves: 0,
      homeRunsAllowed: 50,
      hitBatsmen: 20,
      qualityStarts: 28,
      blownSaves: 0,
      holds: 1,
      battersFaced: 1767,
      hitsAllowed: 400,
      earnedRuns: 202,
      completeGames: 0,
      shutouts: 0,
      kRate: 0.239,
      bbRate: 0.098,
      k9: 9.26,
      bb9: 3.82,
      hr9: 1.10
    }
  };

  try {
    // Insert games
    await insertGame(sampleGame);
    await insertGame(sampleGame2);
    console.log('✅ Games inserted');
    
    // Insert players
    await insertPlayer(sampleBatter1);
    await insertPlayer(sampleBatter2);
    await insertPlayer(samplePitcher1);
    await insertPlayer(samplePitcher2);
    console.log('✅ Players inserted');
    
    // Insert stats
    await insertBatterStats(sampleBatter1.id, '2025', sampleBatter1.currentSeason);
    await insertBatterStats(sampleBatter1.id, 'career', sampleBatter1.career, true);
    await insertBatterStats(sampleBatter2.id, '2025', sampleBatter2.currentSeason);
    await insertBatterStats(sampleBatter2.id, 'career', sampleBatter2.career, true);
    
    await insertPitcherStats(samplePitcher1.id, '2025', samplePitcher1.currentSeason);
    await insertPitcherStats(samplePitcher1.id, 'career', samplePitcher1.career, true);
    await insertPitcherStats(samplePitcher2.id, '2025', samplePitcher2.currentSeason);
    await insertPitcherStats(samplePitcher2.id, 'career', samplePitcher2.career, true);
    console.log('✅ Stats inserted');
    
    // Insert projections
    await saveBatterProjection({
      playerId: sampleBatter1.id,
      gamePk: sampleGame.gamePk,
      projectedPoints: 9.7,
      confidence: 72,
      draftKingsSalary: 5200,
      projectedHits: 0.92,
      projectedHomeRuns: 0.26,
      projectedRbi: 0.85,
      projectedRuns: 0.72,
      projectedStolenBases: 0.03,
      battingOrderPosition: 3,
      opposingPitcherId: samplePitcher1.id,
      analysisFactors: ["pitcher matchup", "ballpark factors", "recent performance"]
    });
    
    await saveBatterProjection({
      playerId: sampleBatter2.id,
      gamePk: sampleGame.gamePk,
      projectedPoints: 8.5,
      confidence: 68,
      draftKingsSalary: 4900,
      projectedHits: 0.87,
      projectedHomeRuns: 0.18,
      projectedRbi: 0.62,
      projectedRuns: 0.78,
      projectedStolenBases: 0.21,
      battingOrderPosition: 2,
      opposingPitcherId: samplePitcher2.id,
      analysisFactors: ["pitcher matchup", "ballpark factors", "recent performance", "stolen base opportunity"]
    });
    
    await savePitcherProjection({
      playerId: samplePitcher1.id,
      gamePk: sampleGame.gamePk,
      projectedPoints: 18.2,
      confidence: 76,
      draftKingsSalary: 9700,
      projectedInnings: 6.2,
      projectedStrikeouts: 7.4,
      projectedWinProbability: 0.58,
      projectedQualityStart: 0.65,
      opposingLineupStrength: 0.62,
      analysisFactors: ["strikeout potential", "innings efficiency", "team win probability"]
    });
    
    await savePitcherProjection({
      playerId: samplePitcher2.id,
      gamePk: sampleGame.gamePk,
      projectedPoints: 14.6,
      confidence: 62,
      draftKingsSalary: 7800,
      projectedInnings: 5.1,
      projectedStrikeouts: 6.2,
      projectedWinProbability: 0.42,
      projectedQualityStart: 0.48,
      opposingLineupStrength: 0.71,
      analysisFactors: ["strikeout potential", "control issues", "team win probability"]
    });
    console.log('✅ Projections inserted');
    
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();