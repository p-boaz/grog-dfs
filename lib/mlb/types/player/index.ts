/**
 * MLB Player Type Definitions - Index File
 *
 * This file re-exports all player-related type definitions.
 */

// Export from common
export type * from "./common";

// Export from batter with explicit re-export to avoid name collision
export type {
  BatterPlateDiscipline,
  BatterSeasonStats,
  BatterSplits,
  BatterStats,
  MLBBatter,
  BatterStatsResponse,
  PlayerSBSeasonStats,
  PlayerSBCareerProfile,
  StolenBaseProjection,
  StolenBaseContext,
} from "./batter";

// Export from pitcher
export type * from "./pitcher";

// Export from matchups
export type * from "./matchups";

// For backward compatibility
export type { PitcherCareerStatsSeason as PitcherCareerStats } from './pitcher';
export type { PitcherHoldMetrics as PitcherControlMetrics } from './pitcher';
export type { MatchupStats as PlayerMatchupStats } from './matchups';

// Define additional player types needed for backward compatibility
export interface PlayerPitchOutcomes {
  strikeouts: number;
  walks: number;
  hits: number;
  homeRuns: number;
  total: number;
}

export interface PlayerVsPitchType {
  fastball: number; // Rating from 0-100
  slider: number;
  curveball: number;
  changeup: number;
  sinker: number;
  cutter: number;
  splitter: number;
}

// Define MLBPitcher type
export interface MLBPitcher {
  pitcherId: number;
  name: string;
  team: string;
  teamId: number;
  position: string;
  handedness: string;
  stats: {
    seasons: Record<string, import('./pitcher').PitcherSeasonStats>;
  };
}

// Define PitcherGameLog type
export interface PitcherGameLog {
  date: string;
  opponent: string;
  inningsPitched: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  homeRuns: number;
  era: number;
  result: 'W' | 'L' | 'ND';
}

// Define PitcherStatsResponse type
export interface PitcherStatsResponse {
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  throwsHand: string;
  seasonStats: import('./pitcher').PitcherSeasonStats;
  careerStats: Array<{
    season: string;
    team: string;
    wins: number;
    losses: number;
    gamesPlayed: number;
    gamesStarted: number;
    inningsPitched: number;
    strikeouts: number;
    walks: number;
    era: number;
    whip: number;
  }>;
}

// Define PitcherPitchTypes type
export interface PitcherPitchTypes {
  fourSeam: number;
  twoSeam: number;
  cutter: number;
  slider: number;
  curveball: number;
  changeup: number;
  splitter: number;
  sinker: number;
  other: number;
}