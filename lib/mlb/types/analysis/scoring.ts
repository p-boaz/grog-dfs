/**
 * MLB DFS Scoring Type Definitions
 *
 * This file contains type definitions for DFS scoring and projections.
 * These types build on the domain model types and add DFS-specific functionality.
 */

import { Batter, BatterStats, Pitcher, PitcherStats } from '../domain/player';
import { GameEnvironment } from '../domain/game';

// Keep legacy interfaces with deprecated markers for backward compatibility

/**
 * @deprecated Use BatterPointsBreakdown instead
 * DFS Points breakdown for a batter
 */
export interface BatterDFSPoints {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbis: number;
  runs: number;
  walks: number;
  hitByPitch: number;
  stolenBases: number;
  total: number;
}

/**
 * @deprecated Use PitcherPointsBreakdown instead
 * DFS Points breakdown for a pitcher
 */
export interface PitcherDFSPoints {
  inningsPitched: number;
  strikeouts: number;
  win: number;
  earnedRuns: number;
  hitsAllowed: number;
  walksAllowed: number;
  hitBatsmen: number;
  completeGame: number;
  shutout: number;
  noHitter: number;
  total: number;
}

/**
 * @deprecated Use DraftKingsScoring instead
 * DFS scoring point values
 */
export interface DFSScoringValues {
  hitter: {
    single: number; // +3 Pts
    double: number; // +5 Pts
    triple: number; // +8 Pts
    homeRun: number; // +10 Pts
    rbi: number; // +2 Pts
    run: number; // +2 Pts
    walk: number; // +2 Pts
    hitByPitch: number; // +2 Pts
    stolenBase: number; // +5 Pts
  };
  pitcher: {
    inningPitched: number; // +2.25 Pts (+0.75 Pts/Out)
    strikeout: number; // +2 Pts
    win: number; // +4 Pts
    earnedRunAllowed: number; // -2 Pts
    hitAgainst: number; // -0.6 Pts
    walkAgainst: number; // -0.6 Pts
    hitBatsman: number; // -0.6 Pts
    completeGame: number; // +2.5 Pts
    completeGameShutout: number; // +2.5 Pts
    noHitter: number; // +5 Pts
  };
}

/**
 * @deprecated Use BatterProjection or PitcherProjection instead
 * Aggregate player projection
 */
export interface PlayerProjection {
  playerId: number;
  name: string;
  position: string;
  team: string;
  opponent: string;
  salary: number;
  projectedPoints: number;
  upside: number;
  floor: number;
  valueScore: number; // Points per $1000 salary
  confidence: number; // 0-100
}

/**
 * DFS lineup with projected points
 */
export interface DFSLineup {
  totalSalary: number;
  totalProjectedPoints: number;
  players: Array<{
    playerId: number;
    name: string;
    position: string;
    team: string;
    salary: number;
    projectedPoints: number;
  }>;
}

// New, improved types that integrate with the domain model

/**
 * DraftKings scoring system for MLB
 */
export interface DraftKingsScoring {
  // Hitter scoring
  single: number;       // +3 Pts
  double: number;       // +5 Pts
  triple: number;       // +8 Pts
  homeRun: number;      // +10 Pts
  rbi: number;          // +2 Pts
  run: number;          // +2 Pts
  walk: number;         // +2 Pts
  hitByPitch: number;   // +2 Pts
  stolenBase: number;   // +5 Pts
  
  // Pitcher scoring
  inningPitched: number;    // +2.25 Pts (+0.75 Pts per out)
  strikeout: number;        // +2 Pts
  win: number;              // +4 Pts
  earnedRun: number;        // -2 Pts
  hit: number;              // -0.6 Pts
  walk: number;             // -0.6 Pts
  hitBatsman: number;       // -0.6 Pts
  completeGame: number;     // +2.5 Pts
  completeGameShutout: number; // +2.5 Pts
  noHitter: number;         // +5 Pts
}

/**
 * Standard DraftKings MLB scoring values
 */
export const DRAFTKINGS_MLB_SCORING: DraftKingsScoring = {
  // Hitter scoring
  single: 3,
  double: 5,
  triple: 8,
  homeRun: 10,
  rbi: 2,
  run: 2,
  walk: 2,
  hitByPitch: 2,
  stolenBase: 5,
  
  // Pitcher scoring
  inningPitched: 2.25,
  strikeout: 2,
  win: 4,
  earnedRun: -2,
  hit: -0.6,
  walk: -0.6,
  hitBatsman: -0.6,
  completeGame: 2.5,
  completeGameShutout: 2.5,
  noHitter: 5
};

/**
 * Batter fantasy point projection
 */
export interface BatterProjection {
  batterId: number;
  name: string;
  team: string;
  position: string;
  opponent: string;
  
  // Opponent details
  opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
  
  // Game details
  gameId: number;
  venue: string;
  
  // Projection details
  expected: BatterPointsBreakdown;
  ceiling: BatterPointsBreakdown;
  floor: BatterPointsBreakdown;
  
  // Overall points
  expectedPoints: number;
  ceilingPoints: number;
  floorPoints: number;
  
  // Confidence rating (0-100)
  confidence: number;
  
  // Environment factors
  factors: {
    weather: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
      factor: number; // Overall effect (1.0 is neutral)
    };
    ballpark: {
      overall: number;
      homeRuns: number;
      extraBaseHits: number;
      runs: number;
    };
    matchup: {
      advantage: number; // 0-1 scale
      handedness: string; // Platoon advantage "L vs R", etc.
      history: {
        atBats: number;
        hits: number;
        homeRuns: number;
        avg: number;
      };
    };
  };
  
  // DraftKings specifics
  draftKings: {
    salary: number;
    id: number | null;
    avgPointsPerGame: number;
  };
}

/**
 * Breakdown of batter fantasy points by category
 */
export interface BatterPointsBreakdown {
  // Hit breakdown
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  
  // Other categories
  runs: number;
  rbi: number;
  walks: number;
  hitByPitch: number;
  stolenBases: number;
  
  // Totals
  totalHits: number;
  totalBases: number;
  totalPoints: number;
}

/**
 * Pitcher fantasy point projection
 */
export interface PitcherProjection {
  pitcherId: number;
  name: string;
  team: string;
  throwsHand: string;
  opponent: string;
  
  // Game details
  gameId: number;
  venue: string;
  isHome: boolean;
  
  // Projection details
  expected: PitcherPointsBreakdown;
  ceiling: PitcherPointsBreakdown;
  floor: PitcherPointsBreakdown;
  
  // Overall points
  expectedPoints: number;
  ceilingPoints: number;
  floorPoints: number;
  
  // Confidence rating (0-100)
  confidence: number;
  
  // Environment factors
  factors: {
    weather: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
      factor: number; // Overall effect (1.0 is neutral)
    };
    ballpark: {
      overall: number;
      homeRuns: number;
      runs: number;
    };
    matchup: {
      opposingLineup: {
        overallRating: number; // 0-100 scale
        strikeoutVulnerability: number;
        powerRating: number;
      };
    };
    teamSupport: {
      bullpenStrength: number;
      runSupport: number;
      defenseRating: number;
    };
  };
  
  // Win and quality start probability
  winProbability: number;
  qualityStartProbability: number;
  completeGameProbability: number;
  
  // DraftKings specifics
  draftKings: {
    salary: number;
    id: number | null;
    avgPointsPerGame: number;
  };
}

/**
 * Breakdown of pitcher fantasy points by category
 */
export interface PitcherPointsBreakdown {
  // Innings and outs
  inningsPitched: number;
  outsPitched: number;
  
  // Positive stats
  strikeouts: number;
  wins: number;
  completeGames: number;
  shutouts: number;
  noHitters: number;
  
  // Negative stats
  earnedRuns: number;
  hits: number;
  walks: number;
  hitBatsmen: number;
  
  // Points breakdown
  inningsPoints: number;
  strikeoutPoints: number;
  winPoints: number;
  earnedRunPoints: number;
  hitPoints: number;
  walkHbpPoints: number;
  bonusPoints: number;
  
  // Total
  totalPoints: number;
}

/**
 * Calculate batter fantasy points from statistics
 */
export function calculateBatterFantasyPoints(
  stats: BatterStats,
  scoring: DraftKingsScoring = DRAFTKINGS_MLB_SCORING
): number {
  // Calculate singles
  const singles = stats.hits - stats.doubles - stats.triples - stats.homeRuns;
  
  // Calculate points
  return (
    singles * scoring.single +
    stats.doubles * scoring.double +
    stats.triples * scoring.triple +
    stats.homeRuns * scoring.homeRun +
    stats.rbi * scoring.rbi +
    stats.runs * scoring.run +
    stats.walks * scoring.walk +
    (stats.hitByPitches || 0) * scoring.hitByPitch +
    stats.stolenBases * scoring.stolenBase
  );
}

/**
 * Calculate pitcher fantasy points from statistics
 */
export function calculatePitcherFantasyPoints(
  stats: PitcherStats,
  scoring: DraftKingsScoring = DRAFTKINGS_MLB_SCORING
): number {
  // Calculate points for innings pitched
  const inningsPoints = stats.inningsDecimal * scoring.inningPitched;
  
  // Calculate points for other categories
  const strikeoutPoints = stats.strikeouts * scoring.strikeout;
  const winPoints = stats.wins * scoring.win;
  const earnedRunPoints = (stats.earnedRuns || 0) * scoring.earnedRun;
  const hitPoints = (stats.hitsAllowed || 0) * scoring.hit;
  const walkPoints = stats.walks * scoring.walk;
  const hitBatsmanPoints = stats.hitBatsmen * scoring.hitBatsman;
  
  // Calculate bonus points
  let bonusPoints = 0;
  
  // Complete game bonus
  if (stats.completeGames > 0) {
    bonusPoints += scoring.completeGame;
    
    // Complete game shutout bonus (if ERA is 0)
    if (stats.era === 0) {
      bonusPoints += scoring.completeGameShutout;
    }
  }
  
  // Total
  return (
    inningsPoints +
    strikeoutPoints +
    winPoints +
    earnedRunPoints +
    hitPoints +
    walkPoints +
    hitBatsmanPoints +
    bonusPoints
  );
}

/**
 * Create default batter points breakdown with zeros
 */
export function createEmptyBatterPointsBreakdown(): BatterPointsBreakdown {
  return {
    singles: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
    runs: 0,
    rbi: 0,
    walks: 0,
    hitByPitch: 0,
    stolenBases: 0,
    totalHits: 0,
    totalBases: 0,
    totalPoints: 0
  };
}

/**
 * Create default pitcher points breakdown with zeros
 */
export function createEmptyPitcherPointsBreakdown(): PitcherPointsBreakdown {
  return {
    inningsPitched: 0,
    outsPitched: 0,
    strikeouts: 0,
    wins: 0,
    completeGames: 0,
    shutouts: 0,
    noHitters: 0,
    earnedRuns: 0,
    hits: 0,
    walks: 0,
    hitBatsmen: 0,
    inningsPoints: 0,
    strikeoutPoints: 0,
    winPoints: 0,
    earnedRunPoints: 0,
    hitPoints: 0,
    walkHbpPoints: 0,
    bonusPoints: 0,
    totalPoints: 0
  };
}

// Adapter functions to convert between old and new types

/**
 * Convert from legacy BatterDFSPoints to new BatterPointsBreakdown
 */
export function convertToBatterPointsBreakdown(legacy: BatterDFSPoints): BatterPointsBreakdown {
  return {
    singles: legacy.singles,
    doubles: legacy.doubles,
    triples: legacy.triples,
    homeRuns: legacy.homeRuns,
    runs: legacy.runs,
    rbi: legacy.rbis, // Note the property name change
    walks: legacy.walks,
    hitByPitch: legacy.hitByPitch,
    stolenBases: legacy.stolenBases,
    totalHits: legacy.singles + legacy.doubles + legacy.triples + legacy.homeRuns,
    totalBases: 
      legacy.singles + 
      legacy.doubles * 2 + 
      legacy.triples * 3 + 
      legacy.homeRuns * 4,
    totalPoints: legacy.total
  };
}

/**
 * Convert from new BatterPointsBreakdown to legacy BatterDFSPoints
 */
export function convertToLegacyBatterDFSPoints(modern: BatterPointsBreakdown): BatterDFSPoints {
  return {
    singles: modern.singles,
    doubles: modern.doubles,
    triples: modern.triples,
    homeRuns: modern.homeRuns,
    rbis: modern.rbi, // Note the property name change
    runs: modern.runs,
    walks: modern.walks,
    hitByPitch: modern.hitByPitch,
    stolenBases: modern.stolenBases,
    total: modern.totalPoints
  };
}

/**
 * Convert from legacy PitcherDFSPoints to new PitcherPointsBreakdown
 */
export function convertToPitcherPointsBreakdown(legacy: PitcherDFSPoints): PitcherPointsBreakdown {
  return {
    inningsPitched: legacy.inningsPitched / 2.25, // Convert from points to innings
    outsPitched: (legacy.inningsPitched / 2.25) * 3, // 3 outs per inning
    strikeouts: legacy.strikeouts / 2, // Convert from points to count
    wins: legacy.win > 0 ? 1 : 0, // Convert from points to binary
    completeGames: legacy.completeGame > 0 ? 1 : 0, // Convert from points to binary
    shutouts: legacy.shutout > 0 ? 1 : 0, // Convert from points to binary
    noHitters: legacy.noHitter > 0 ? 1 : 0, // Convert from points to binary
    earnedRuns: Math.abs(legacy.earnedRuns / 2), // Convert from points to count
    hits: Math.abs(legacy.hitsAllowed / 0.6), // Convert from points to count
    walks: Math.abs(legacy.walksAllowed / 0.6), // Convert from points to count
    hitBatsmen: Math.abs(legacy.hitBatsmen / 0.6), // Convert from points to count
    inningsPoints: legacy.inningsPitched,
    strikeoutPoints: legacy.strikeouts,
    winPoints: legacy.win,
    earnedRunPoints: legacy.earnedRuns,
    hitPoints: legacy.hitsAllowed,
    walkHbpPoints: legacy.walksAllowed + legacy.hitBatsmen,
    bonusPoints: legacy.completeGame + legacy.shutout + legacy.noHitter,
    totalPoints: legacy.total
  };
}

/**
 * Convert from new PitcherPointsBreakdown to legacy PitcherDFSPoints
 */
export function convertToLegacyPitcherDFSPoints(modern: PitcherPointsBreakdown): PitcherDFSPoints {
  return {
    inningsPitched: modern.inningsPoints,
    strikeouts: modern.strikeoutPoints,
    win: modern.winPoints,
    earnedRuns: modern.earnedRunPoints,
    hitsAllowed: modern.hitPoints,
    walksAllowed: modern.walkHbpPoints / 2, // Approximation
    hitBatsmen: modern.walkHbpPoints / 2,   // Approximation
    completeGame: modern.completeGames > 0 ? 2.5 : 0,
    shutout: modern.shutouts > 0 ? 2.5 : 0,
    noHitter: modern.noHitters > 0 ? 5 : 0,
    total: modern.totalPoints
  };
}