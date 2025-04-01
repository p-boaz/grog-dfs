/**
 * MLB Hit Analysis Type Definitions
 *
 * This file contains type definitions for hit analysis and projections.
 * This includes hit types, ballpark factors, weather impacts, and projection models.
 */

import { BatterStats, PitcherStats } from "../domain/player";
import { BallparkFactors, GameEnvironment } from "../domain/game";

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
 * Projected hit type rates with factors that influenced the projection
 *
 * @property expectedBA - Expected batting average
 * @property hitTypeRates - Rates for each hit type
 * @property factors - Factors that influence the projection
 */
export interface HitTypeRates {
  expectedBA: number; // Expected batting average
  hitTypeRates: {
    single: number;
    double: number;
    triple: number;
    homeRun: number;
  };
  
  // Factors that influenced the projection
  factors: {
    playerBaseline: number;
    ballpark: {
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
    };
    weather: {
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
    };
    pitcher: number;
    matchup: number;
    platoon: number;
    homeAway: number;
  };
}

/**
 * Ballpark factors for different hit types
 *
 * @property overall - Overall park factor (1.0 is neutral)
 * @property singles - Park factor for singles (1.0 is neutral)
 * @property doubles - Park factor for doubles (1.0 is neutral) 
 * @property triples - Park factor for triples (1.0 is neutral)
 * @property homeRuns - Park factor for home runs (1.0 is neutral)
 * @property runFactor - Park factor for runs (1.0 is neutral)
 * @property rbiFactor - Park factor for RBIs (1.0 is neutral)
 * @property byHitType - Factors by hit type (same as singles, doubles, etc.)
 * @property byHandedness - Factors by batter handedness
 */
export interface BallparkHitFactor {
  // Overall park factor
  overall: number; // 1.0 is neutral
  
  // Individual hit type factors
  singles: number; // 1.0 is neutral
  doubles: number; // 1.0 is neutral
  triples: number; // 1.0 is neutral
  homeRuns: number; // 1.0 is neutral
  
  // Run production factors
  runFactor: number; // 1.0 is neutral
  rbiFactor: number; // 1.0 is neutral
  
  // Grouped factors (for convenience)
  byHitType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
  
  // Handedness factors
  byHandedness: {
    rHB: number; // Right-handed batters
    lHB: number; // Left-handed batters
  };
}

/**
 * Weather impact on different hit types
 *
 * @property temperature - Game temperature (°F)
 * @property windSpeed - Wind speed (mph)
 * @property windDirection - Wind direction
 * @property isOutdoor - Whether the game is played outdoors
 * @property temperatureFactor - Impact of temperature
 * @property windFactor - Impact of wind
 * @property overallFactor - Overall weather impact
 * @property byHitType - Impact by hit type
 */
export interface WeatherHitImpact {
  // Environmental conditions
  temperature: number; // °F
  windSpeed: number; // mph
  windDirection: string; // "in", "out", "left", "right", "none"
  isOutdoor: boolean;
  
  // Impact factors (1.0 is neutral)
  temperatureFactor: number;
  windFactor: number; 
  overallFactor: number;
  
  // Impact by hit type (1.0 is neutral)
  byHitType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
}

/**
 * Platoon splits for a batter against LHP/RHP
 *
 * @property vsLeft - Stats against left-handed pitchers
 * @property vsRight - Stats against right-handed pitchers
 * @property platoonAdvantage - Which pitcher handedness gives batter advantage
 * @property platoonSplit - Magnitude of the platoon split
 */
export interface BatterPlatoonSplits {
  vsLeft: {
    battingAverage: number;
    onBasePercentage: number;
    sluggingPct: number;
    ops: number;
    atBats: number;
  };
  vsRight: {
    battingAverage: number;
    onBasePercentage: number;
    sluggingPct: number;
    ops: number;
    atBats: number;
  };
  platoonAdvantage: "vs-left" | "vs-right" | "balanced";
  platoonSplit: number; // Magnitude of the split (OPS points)
}

/**
 * Player hit stats with additional metrics specific to hit analysis
 * 
 * @property battingAverage - Batting average
 * @property onBasePercentage - On-base percentage
 * @property sluggingPct - Slugging percentage
 * @property hits - Total hits
 * @property singles - Singles count
 * @property doubles - Doubles count
 * @property triples - Triples count
 * @property atBats - Total at-bats
 * @property games - Games played
 * @property hitRate - Hits per at-bat
 * @property singleRate - Singles per at-bat
 * @property doubleRate - Doubles per at-bat
 * @property tripleRate - Triples per at-bat
 * @property babip - Batting average on balls in play
 * @property lineDriverRate - Line drive percentage
 * @property contactRate - Contact rate on swings
 */
export interface PlayerHitStats {
  // Core batting metrics
  battingAverage: number;
  onBasePercentage: number;
  sluggingPct: number;
  
  // Hit counts
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  
  // Context metrics
  atBats: number;
  games: number;
  
  // Hit rates
  hitRate: number;
  singleRate: number;
  doubleRate: number;
  tripleRate: number;
  babip: number;
  
  // Quality metrics
  lineDriverRate: number;
  contactRate: number;
}

/**
 * Career hit profile for a batter with comprehensive metrics
 *
 * @property careerHits - Total career hits
 * @property careerSingles - Total career singles
 * @property careerDoubles - Total career doubles
 * @property careerTriples - Total career triples
 * @property careerGames - Total career games
 * @property careerAtBats - Total career at-bats
 * @property careerBattingAverage - Career batting average
 * @property hitTypeDistribution - Distribution of hit types
 * @property bestSeasonAvg - Best single-season batting average
 * @property recentTrend - Recent trend direction
 * @property homeVsAway - Home vs away performance
 */
export interface CareerHitProfile {
  // Career totals
  careerHits: number;
  careerSingles: number;
  careerDoubles: number;
  careerTriples: number;
  careerGames: number;
  careerAtBats: number;
  careerBattingAverage: number;
  
  // Distribution of hit types
  hitTypeDistribution: {
    singlePct: number;
    doublePct: number;
    triplePct: number;
    homeRunPct: number;
  };
  
  // Performance metrics
  bestSeasonAvg: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  
  // Splits
  homeVsAway: {
    homeAvg: number;
    awayAvg: number;
    homeAdvantage: number;
  };
}

/**
 * Pitcher vulnerability to different hit types
 *
 * @property gamesStarted - Games started
 * @property inningsPitched - Innings pitched
 * @property hitsAllowed - Hits allowed
 * @property hitsPer9 - Hits allowed per 9 innings
 * @property babip - Batting average on balls in play allowed
 * @property byHitType - Vulnerability by hit type (1-10 scale)
 * @property hitVulnerability - Overall hit vulnerability rating
 */
export interface PitcherHitVulnerability {
  // Core stats
  gamesStarted: number;
  inningsPitched: number;
  hitsAllowed: number;
  hitsPer9: number;
  babip: number;
  
  // Vulnerability ratings (higher = more vulnerable)
  byHitType: {
    singles: number; // 1-10 scale
    doubles: number; // 1-10 scale
    triples: number; // 1-10 scale
  };
  
  // Overall rating
  hitVulnerability: number; // 1-10 scale
}

/**
 * Matchup hit statistics for batter vs pitcher
 *
 * @property atBats - Total at-bats in matchup
 * @property hits - Total hits in matchup
 * @property singles - Singles in matchup
 * @property doubles - Doubles in matchup
 * @property triples - Triples in matchup
 * @property battingAverage - Batting average in matchup
 * @property sampleSize - Sample size classification
 * @property advantage - Which player has the advantage
 */
export interface MatchupHitStats {
  // Raw matchup numbers
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  battingAverage: number;
  
  // Evaluation metrics
  sampleSize: "large" | "medium" | "small" | "none";
  advantage: "batter" | "pitcher" | "neutral";
}