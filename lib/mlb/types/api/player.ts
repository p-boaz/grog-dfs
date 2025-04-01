/**
 * MLB Player API Type Definitions
 *
 * These types represent the raw responses from MLB API endpoints
 * for player data, including batters and pitchers.
 */

import { ApiSourceMarker, PlayerPosition, TeamReference } from './common';

/**
 * Raw batter API response
 * Based on actual API responses from player endpoints
 */
export interface BatterApiResponse extends ApiSourceMarker {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  batSide: string;
  seasonStats: BatterSeasonApiStats;
  careerStats: BatterCareerApiStats[];
}

/**
 * Raw pitcher API response
 * Based on actual API responses from pitcher endpoints
 */
export interface PitcherApiResponse extends ApiSourceMarker {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  pitchHand: string;
  seasonStats: Record<string, PitcherSeasonApiStats>;
  careerStats: PitcherCareerApiStats[];
}

/**
 * Batter season statistics from API
 * Some numeric values are returned as strings with formatted values (e.g., batting average)
 */
export interface BatterSeasonApiStats {
  gamesPlayed: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  rbis: number; // Duplicate field for backward compatibility
  walks: number;
  strikeouts: number;
  stolenBases: number;
  avg: string; // Batting average as formatted string (e.g., ".300")
  obp: string; // On-base percentage as formatted string
  slg: string; // Slugging percentage as formatted string
  ops: string; // OPS as formatted string
  plateAppearances: number;
  caughtStealing: number;
  runs: number;
  hitByPitches: number;
  sacrificeFlies: number;
  
  // Advanced metrics (may be absent in some responses)
  babip?: number;
  iso?: number;
  hrRate?: number;
  kRate?: number;
  bbRate?: number;
  sbRate?: number;
}

/**
 * Batter career statistics entry from API
 */
export interface BatterCareerApiStats {
  season: string;
  team: string;
  gamesPlayed: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  avg: string; // Batting average as formatted string
  obp: string; // On-base percentage as formatted string
  slg: string; // Slugging percentage as formatted string
  ops: string; // OPS as formatted string
  stolenBases: number;
  caughtStealing: number;
  
  // These fields may be absent in older seasons
  doubles?: number;
  triples?: number;
  strikeouts?: number;
  walks?: number;
  wOBA?: number;
  iso?: number;
  babip?: number;
  plateAppearances?: number;
}

/**
 * Pitcher season statistics from API
 */
export interface PitcherSeasonApiStats {
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: string; // Innings pitched as formatted string (e.g., "183.2")
  wins: number;
  losses: number;
  era: string; // ERA as formatted string (e.g., "3.24")
  whip: string; // WHIP as formatted string
  strikeouts: number;
  walks: number;
  saves: number;
  homeRunsAllowed: number;
  hitBatsmen: number;
  
  // These fields may be absent in some responses
  qualityStarts?: number;
  blownSaves?: number;
  holds?: number;
  battersFaced?: number;
  hitsAllowed?: number;
  earnedRuns?: number;
  completeGames?: number;
  shutouts?: number;
}

/**
 * Pitcher career statistics entry from API
 */
export interface PitcherCareerApiStats {
  season: string;
  team: string;
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: string; // Innings pitched as formatted string
  wins: number;
  losses: number;
  era: string; // ERA as formatted string
  whip: string; // WHIP as formatted string
  strikeouts: number;
  walks: number;
  saves: number;
  homeRunsAllowed: number;
  hitBatsmen: number;
}

/**
 * Pitch mix data for a pitcher
 */
export interface PitchMixApiData {
  pitcherId: number;
  pitches: {
    fastball: number;
    slider: number;
    curve: number;
    changeup: number;
    cutter: number;
    sinker: number;
    splitter: number;
    other: number;
  };
  velocities: {
    fastball?: number;
    slider?: number;
    curve?: number;
    changeup?: number;
    cutter?: number;
    sinker?: number;
    splitter?: number;
  };
  sourceTimestamp: string;
}