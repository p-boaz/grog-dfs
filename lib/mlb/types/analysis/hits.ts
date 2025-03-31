/**
 * MLB Hit Analysis Type Definitions
 *
 * This file contains type definitions for hit analysis and projections.
 */

/**
 * Hit type enum - moved to hits.ts as concrete enum (not as type)
 */
export enum HitType {
  SINGLE = "single",
  DOUBLE = "double",
  TRIPLE = "triple",
  HOME_RUN = "homeRun"
}

/**
 * Hit type point values
 */
export const HIT_TYPE_POINTS = {
  [HitType.SINGLE]: 3,
  [HitType.DOUBLE]: 5,
  [HitType.TRIPLE]: 8,
  [HitType.HOME_RUN]: 10
};

/**
 * Hit type rates for a batter
 *
 * @property single - Rate of singles per at-bat
 * @property double - Rate of doubles per at-bat
 * @property triple - Rate of triples per at-bat
 * @property homeRun - Rate of home runs per at-bat
 */
export interface HitTypeRates {
  single: number;
  double: number;
  triple: number;
  homeRun: number;
}

/**
 * Ballpark factor for different hit types
 *
 * @property singles - Park factor for singles (1.0 is neutral)
 * @property doubles - Park factor for doubles (1.0 is neutral) 
 * @property triples - Park factor for triples (1.0 is neutral)
 * @property homeRuns - Park factor for home runs (1.0 is neutral)
 */
export interface BallparkHitFactor {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
}

/**
 * Weather impact on different hit types
 *
 * @property temperature - Temperature factor
 * @property wind - Wind factor
 * @property overall - Overall weather factor
 * @property byType - Factors by hit type
 */
export interface WeatherHitImpact {
  temperature: number;
  wind: number; 
  overall: number;
  byType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
}

/**
 * Platoon splits for a batter
 *
 * @property vsLeft - Stats against left-handed pitchers
 * @property vsRight - Stats against right-handed pitchers
 */
export interface BatterPlatoonSplits {
  vsLeft: {
    avg: number;
    ops: number;
    wOBA: number;
  };
  vsRight: {
    avg: number;
    ops: number;
    wOBA: number;
  };
}

/**
 * Player hit stats
 *
 * @property avg - Batting average
 * @property obp - On-base percentage
 * @property slg - Slugging percentage
 * @property ops - On-base plus slugging
 * @property iso - Isolated power
 * @property babip - Batting average on balls in play
 */
export interface PlayerHitStats {
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  iso?: number;
  babip?: number;
}

/**
 * Career hit profile for a batter
 *
 * @property careerAvg - Career batting average
 * @property careerIso - Career isolated power
 * @property recentTrend - Recent trend direction
 * @property consistencyRating - How consistent is the batter
 * @property advantageVsHandedness - Advantage vs pitcher handedness
 */
export interface CareerHitProfile {
  careerAvg: number;
  careerIso: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  consistencyRating: number; // 0-100
  advantageVsHandedness: number; // 0-1 scale
}

/**
 * Pitcher vulnerability to different hit types
 *
 * @property contactAllowed - Rate of contact allowed
 * @property hardHitAllowed - Rate of hard hit balls allowed
 * @property byType - Vulnerability by hit type
 */
export interface PitcherHitVulnerability {
  contactAllowed: number; // Higher = more vulnerable
  hardHitAllowed: number; // Higher = more vulnerable  
  byType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
}

/**
 * Matchup hit statistics
 *
 * @property atBats - Total at-bats in matchup
 * @property hits - Total hits in matchup
 * @property extraBaseHits - Total extra-base hits
 * @property homeRuns - Total home runs
 * @property avg - Batting average in matchup
 * @property ops - OPS in matchup
 */
export interface MatchupHitStats {
  atBats: number;
  hits: number;
  extraBaseHits: number;
  homeRuns: number;
  avg: number;
  ops: number;
}