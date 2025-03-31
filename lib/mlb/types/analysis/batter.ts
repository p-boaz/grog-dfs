/**
 * MLB Batter Analysis Type Definitions
 *
 * This file contains type definitions for batter analysis and projections.
 */

import { DraftKingsInfo } from '../draftkings';

/**
 * Comprehensive batter analysis for DFS
 * 
 * @property batterId - MLB player ID
 * @property name - Player's full name
 * @property team - Team abbreviation
 * @property opponent - Opponent team name
 * @property gameId - MLB game ID
 * @property position - Primary position
 * @property stats - Season and recent statistics
 * @property matchup - Matchup data with probable pitcher
 * @property projections - DFS projections
 * @property draftKings - DraftKings data
 */
export interface BatterAnalysis {
  batterId: number;
  name: string;
  team: string;
  opponent: string;
  gameId: number;
  position: string;
  handedness: string;
  stats: {
    season: {
      avg: number | null;
      obp: number | null;
      slg: number | null;
      ops: number | null;
      homeRuns: number | null;
      rbi: number | null;
      runs: number | null;
      stolenBases: number | null;
    };
    vsPitcherHand: {
      avg: number | null;
      obp: number | null;
      slg: number | null;
      ops: number | null;
    };
    recent: {
      last7Days?: {
        avg: number | null;
        ops: number | null;
      };
      last15Days?: {
        avg: number | null;
        ops: number | null;
      };
    };
  };
  matchup: {
    pitcher: {
      id: number;
      name: string;
      handedness: string;
      era: number | null;
      whip: number | null;
    };
    ballpark: {
      name: string;
      factor: number;
    };
    weather: {
      temperature: number | null;
      windSpeed: number | null;
      windDirection: string;
    };
  };
  projections: {
    expectedPoints: number;
    upside: number;
    floor: number;
    breakdown: {
      hits: number;
      extraBaseHits: number;
      homeRuns: number;
      rbis: number;
      runs: number;
      walks: number;
      stolenBases: number;
    };
    confidence: number; // 0-100
  };
  draftKings: DraftKingsInfo;
}

/**
 * Batter quality metrics
 */
export interface BatterQualityMetrics {
  contactQuality: number; // 0-100
  discipline: number; // 0-100
  power: number; // 0-100
  speed: number; // 0-100
  consistency: number; // 0-100
  overall: number; // 0-100
}

/**
 * Hit projections for batter
 */
export interface HitProjection {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  walks: number;
  hitByPitch: number;
  stolenBases: number;
  expectedPoints: number;
}

/**
 * Detailed batter projections
 */
export interface BatterProjections {
  expected: HitProjection;
  upside: HitProjection;
  floor: HitProjection;
  confidence: number; // 0-100
}

/**
 * Detailed hit projections by category
 */
export interface DetailedHitProjections {
  singles: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  doubles: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  triples: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  homeRuns: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  walks: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  runs: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  rbis: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
  stolenBases: {
    expected: number;
    upside: number;
    floor: number;
    confidence: number; // 0-100
  };
}