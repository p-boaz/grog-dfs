/**
 * MLB Pitcher Analysis Type Definitions
 *
 * This file contains type definitions for pitcher analysis and projections.
 */

import { DraftKingsInfo } from "../draftkings";
import { PitcherSeasonStats } from "../player/pitcher";

/**
 * Comprehensive pitcher analysis for DFS
 *
 * @property pitcherId - MLB player ID
 * @property name - Pitcher's full name
 * @property team - Team abbreviation
 * @property opponent - Opponent team name
 * @property gameId - MLB game ID
 * @property venue - Stadium name
 * @property stats - Season statistics
 * @property projections - DFS projections
 * @property environment - Game environment data
 * @property ballparkFactors - Ballpark factors
 * @property draftKings - DraftKings data
 */
export interface StartingPitcherAnalysis {
  pitcherId: number;
  name: string;
  team: string;
  opponent: string;
  gameId: number;
  venue: string;
  stats: {
    seasonStats: PitcherSeasonStats;
    homeRunVulnerability?: {
      hrPer9: number | null;
      flyBallPct?: number | null;
      hrPerFlyBall?: number | null;
      homeRunVulnerability: number | null;
    };
  };
  projections: {
    winProbability: number | null;
    expectedStrikeouts: number | null;
    expectedInnings: number | null;
    dfsProjection: {
      expectedPoints: number | null;
      upside: number | null;
      floor: number | null;
    };
  };
  environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballparkFactors: {
    overall: number;
    homeRuns: number;
  };
  draftKings: DraftKingsInfo;
}

/**
 * Pitcher win probability analysis
 *
 * @property overallWinProbability - Probability of win (0-1)
 * @property factorWeights - Weighting of factors
 * @property factors - Factors affecting win probability
 * @property confidence - Confidence score (0-100)
 */
export interface WinProbabilityAnalysis {
  overallWinProbability: number;
  factorWeights: {
    pitcherSkill: number;
    teamOffense: number;
    teamDefense: number;
    bullpenStrength: number;
    homeField: number;
    opposingPitcher: number;
  };
  factors: {
    pitcherSkill: number; // 0-10 scale
    teamOffense: number; // 0-10 scale
    teamDefense: number; // 0-10 scale
    bullpenStrength: number; // 0-10 scale
    homeField: number; // 0-10 scale
    opposingPitcher: number; // 0-10 scale
  };
  confidence: number; // 0-100
}

/**
 * Pitcher strikeout projection
 *
 * @property expectedStrikeouts - Projected strikeouts
 * @property perInningRate - Strikeouts per inning
 * @property factors - Factors affecting strikeout rate
 * @property confidence - Confidence score (0-100)
 */
export interface StrikeoutProjection {
  expectedStrikeouts: number;
  perInningRate: number;
  factors: {
    pitcherKRate: number; // 0-10 scale
    opposingTeamKRate: number; // 0-10 scale
    parkFactor: number; // 0-10 scale
    weather: number; // 0-10 scale
  };
  ranges: {
    low: number;
    high: number;
  };
  confidence: number; // 0-100
}

/**
 * Pitcher innings projection
 *
 * @property expectedInnings - Projected innings pitched
 * @property leashLength - How long manager keeps pitcher in (0-10)
 * @property workloadConcerns - Injury/fatigue concerns (0-10)
 * @property gameScriptImpact - How game flow affects IP (0-10)
 * @property confidence - Confidence score (0-100)
 */
export interface InningsProjection {
  expectedInnings: number;
  leashLength: number; // 0-10 scale
  workloadConcerns: number; // 0-10 scale
  gameScriptImpact: number; // 0-10 scale
  pastWorkload: {
    last3Games: number[]; // Innings pitched in last 3 games
    averageInnings: number;
  };
  confidence: number; // 0-100
}

/**
 * Expected control outcomes for a game
 *
 * @property walks - Walk projection details
 * @property hits - Hit projection details
 * @property hbp - Hit-by-pitch projection details
 * @property overall - Overall control projection
 */
export interface ControlProjection {
  walks: {
    expected: number;
    high: number;
    low: number;
    range: number;
    points?: number;
    confidence?: number;
  };
  hits: {
    expected: number;
    high: number;
    low: number;
    range: number;
    points?: number;
    confidence?: number;
  };
  hbp: {
    expected: number;
    high: number;
    low: number;
    range: number;
    points?: number;
    confidence?: number;
  };
  overall: {
    controlRating: number; // 0-10 scale
    confidenceScore: number; // 0-100 scale
  };
}

/**
 * Pitcher's control statistics and metrics
 *
 * @property walks - Total walks issued
 * @property hits - Total hits allowed
 * @property hitBatsmen - Total hit batters
 * @property inningsPitched - Innings pitched
 * @property gamesStarted - Games started
 * @property walksPerNine - Walks per 9 innings
 * @property hitsPerNine - Hits per 9 innings
 * @property hbpPerNine - Hit batters per 9 innings
 * @property whip - Walks plus hits per inning pitched
 * @property strikeoutToWalkRatio - K/BB ratio
 * @property zonePercentage - Percentage of pitches in strike zone
 * @property firstPitchStrikePercentage - First pitch strike percentage
 * @property pitchEfficiency - Average pitches per plate appearance
 */
export interface PitcherControlStats {
  walks: number;
  hits: number;
  hitBatsmen: number;
  inningsPitched: number;
  gamesStarted: number;
  walksPerNine: number;
  hitsPerNine: number;
  hbpPerNine: number;
  whip: number;
  strikeoutToWalkRatio: number;
  zonePercentage?: number;
  firstPitchStrikePercentage?: number;
  pitchEfficiency?: number; // Average pitches per PA
}

/**
 * Detailed pitcher control profile with ratings
 *
 * @property gamesStarted - Games started
 * @property inningsPitched - Innings pitched
 * @property walks - Total walks issued
 * @property strikeouts - Total strikeouts
 * @property hits - Total hits allowed
 * @property hitBatsmen - Total hit batters
 * @property walksPerNine - Walks per 9 innings
 * @property hitsPerNine - Hits per 9 innings
 * @property hbpPerNine - Hit batters per 9 innings
 * @property whip - Walks plus hits per inning pitched
 * @property strikeoutToWalkRatio - K/BB ratio
 * @property control - Control propensity ratings
 * @property controlRating - Overall control rating (0-10 scale)
 */
export interface PitcherControlProfile {
  gamesStarted: number;
  inningsPitched: number;
  walks: number;
  strikeouts: number;
  hits: number;
  hitBatsmen: number;
  walksPerNine: number;
  hitsPerNine: number;
  hbpPerNine: number;
  whip: number;
  strikeoutToWalkRatio: number;
  control: {
    walkPropensity: "high" | "medium" | "low";
    hitsPropensity: "high" | "medium" | "low";
    hbpPropensity: "high" | "medium" | "low";
    zonePercentage?: number;
    firstPitchStrikePercentage?: number;
    pitchEfficiency?: number;
  };
  controlRating: number; // 0-10 scale where 5 is average
}

/**
 * Career control profile and trends for pitcher
 *
 * @property careerWalks - Total career walks
 * @property careerHits - Total career hits allowed
 * @property careerHbp - Total career hit batters
 * @property careerInningsPitched - Total career innings pitched
 * @property careerWhip - Career WHIP
 * @property bestSeasonWhip - Best season WHIP
 * @property recentTrend - Direction of recent trend
 * @property controlPropensity - Overall control tendency
 * @property age - Pitcher's age
 * @property yearsExperience - Years of MLB experience
 * @property seasonToSeasonConsistency - Consistency rating (0-1 scale)
 */
export interface CareerControlProfile {
  careerWalks: number;
  careerHits: number;
  careerHbp: number;
  careerInningsPitched: number;
  careerWhip: number;
  bestSeasonWhip: number;
  recentTrend: "improving" | "declining" | "stable";
  controlPropensity: "high" | "medium" | "low";
  age: number;
  yearsExperience: number;
  seasonToSeasonConsistency: number; // 0-1 scale, 1 being very consistent
}

/**
 * Batter vs pitcher control matchup data
 *
 * @property plateAppearances - Total plate appearances
 * @property atBats - Total at bats
 * @property hits - Total hits
 * @property walks - Total walks
 * @property hitByPitch - Total hit by pitch
 * @property strikeouts - Total strikeouts
 * @property hitRate - Hits / at bats
 * @property walkRate - Walks / plate appearances
 * @property hbpRate - HBP / plate appearances
 * @property strikeoutRate - Strikeouts / plate appearances
 * @property sampleSize - Quality of sample
 * @property relativeHitRate - Matchup hit rate vs pitcher's baseline
 * @property relativeWalkRate - Matchup walk rate vs pitcher's baseline
 */
export interface ControlMatchupData {
  plateAppearances: number;
  atBats: number;
  hits: number;
  walks: number;
  hitByPitch: number;
  strikeouts: number;
  hitRate: number;
  walkRate: number;
  hbpRate: number;
  strikeoutRate: number;
  sampleSize: "large" | "medium" | "small" | "none";
  relativeHitRate: number; // How this matchup compares to pitcher's overall hit rate
  relativeWalkRate: number; // How this matchup compares to pitcher's overall walk rate
}

/**
 * Batter's control-related attributes
 *
 * @property eyeRating - Batter's ability to draw walks (0-10)
 * @property contactRating - Batter's ability to make contact (0-10)
 * @property discipline - Plate discipline metrics
 */
export interface BatterControlFactors {
  eyeRating: number; // 0-10 scale of batter's ability to draw walks
  contactRating: number; // 0-10 scale of batter's ability to make contact
  discipline: {
    chaseRate?: number; // Swing % at pitches outside zone
    contactRate?: number; // Contact % on swings
    walkRate: number; // BB/PA
    strikeoutRate: number; // K/PA
  };
}

/**
 * Expected control events for a pitcher in a game
 *
 * @property expectedHitsAllowed - Projected hits allowed
 * @property expectedWalksAllowed - Projected walks issued
 * @property expectedHbpAllowed - Projected hit batters
 * @property confidenceScore - Confidence score (0-100)
 * @property factors - Factors affecting control events
 */
export interface ExpectedControlEvents {
  expectedHitsAllowed: number;
  expectedWalksAllowed: number;
  expectedHbpAllowed: number;
  confidenceScore: number; // 0-100
  factors: {
    pitcherControlFactor: number;
    batterEyeFactor: number;
    batterContactFactor: number;
    matchupFactor: number;
  };
}
