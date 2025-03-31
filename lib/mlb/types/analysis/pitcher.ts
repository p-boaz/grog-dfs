/**
 * MLB Pitcher Analysis Type Definitions
 *
 * This file contains type definitions for pitcher analysis and projections.
 */

import { DraftKingsInfo } from '../draftkings';
import { PitcherSeasonStats } from '../player/pitcher';

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
 * Pitcher control metrics projection
 * 
 * @property walks - Projected walks
 * @property hits - Projected hits allowed
 * @property hitsByPitch - Projected hit batters
 * @property total - Combined control impact on scoring
 */
export interface ControlProjection {
  walks: {
    expected: number;
    points: number;
    confidence: number; // 0-100
  };
  hits: {
    expected: number;
    points: number;
    confidence: number; // 0-100
  };
  hitsByPitch: {
    expected: number;
    points: number;
    confidence: number; // 0-100
  };
  total: {
    expected: number;
    points: number;
    confidence: number; // 0-100
  };
}