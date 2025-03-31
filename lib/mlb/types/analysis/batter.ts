/**
 * MLB Batter Analysis Type Definitions
 *
 * This file contains type definitions for batter analysis and projections.
 */

import { DraftKingsInfo } from '../draftkings';

/**
 * Run production statistics for a batter
 * 
 * @property runs - Total runs scored
 * @property rbi - Total RBIs
 * @property games - Games played
 * @property plateAppearances - Total plate appearances
 * @property runsPerGame - Runs per game
 * @property rbiPerGame - RBIs per game
 * @property onBasePercentage - On-base percentage
 * @property sluggingPct - Slugging percentage
 * @property battingAverage - Batting average
 * @property runningSpeed - Running speed (0-100 scale)
 * @property battedBallProfile - Batted ball data
 */
export interface RunProductionStats {
  runs: number;
  rbi: number;
  games: number;
  plateAppearances: number;
  runsPerGame: number;
  rbiPerGame: number;
  onBasePercentage: number;
  sluggingPct: number;
  battingAverage: number;
  runningSpeed?: number; // 0-100 scale
  battedBallProfile?: {
    flyBallPct: number;
    lineDrivePct: number;
    groundBallPct: number;
    hardHitPct: number;
  };
}

/**
 * Career run production metrics and trends
 * 
 * @property careerRuns - Total career runs
 * @property careerRBI - Total career RBIs
 * @property careerGames - Career games played
 * @property careerRunsPerGame - Career runs per game
 * @property careerRBIPerGame - Career RBIs per game
 * @property bestSeasonRuns - Highest season runs
 * @property bestSeasonRBI - Highest season RBIs
 * @property recentTrend - Direction of recent trend
 * @property seasonToSeasonVariance - Consistency rating (0-1)
 */
export interface CareerRunProductionProfile {
  careerRuns: number;
  careerRBI: number;
  careerGames: number;
  careerRunsPerGame: number;
  careerRBIPerGame: number;
  bestSeasonRuns: number;
  bestSeasonRBI: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  seasonToSeasonVariance: number; // 0-1 scale, how consistent are the player's run production numbers
}

/**
 * Team offensive context for runs and RBIs
 * 
 * @property runsPerGame - Team's runs per game
 * @property teamOffensiveRating - Team's offensive rating (0-100)
 * @property lineupStrength - Lineup strength by section
 * @property runnersOnBaseFrequency - Frequency of runners on base
 */
export interface TeamOffensiveContext {
  runsPerGame: number;
  teamOffensiveRating: number; // 0-100 scale
  lineupStrength: {
    overall: number; // 0-100 scale
    topOfOrder: number; // 0-100 scale
    bottomOfOrder: number; // 0-100 scale
  };
  runnersOnBaseFrequency: number; // Estimated % of time runners are on base
}

/**
 * Lineup position and batting order context
 * 
 * @property lineupPosition - Position in lineup (1-9)
 * @property battingOrder - Section of batting order
 * @property hittersBehind - Number of hitters behind
 * @property hittersAhead - Number of hitters ahead
 * @property expectedRunOpportunities - Expected run opportunities
 * @property expectedRbiOpportunities - Expected RBI opportunities
 */
export interface LineupContext {
  lineupPosition: number | null;
  battingOrder: string | null; // "top" | "middle" | "bottom"
  hittersBehind: number; // Number of hitters behind in lineup
  hittersAhead: number; // Number of hitters ahead in lineup
  expectedRunOpportunities: number; // Estimated times runner will be on base ahead of batter
  expectedRbiOpportunities: number; // Estimated times runner will be on base for batter to drive in
}

/**
 * Analysis of a pitcher's propensity to allow runs
 * 
 * @property gamesStarted - Games started
 * @property inningsPitched - Innings pitched
 * @property earnedRuns - Earned runs allowed
 * @property runsAllowed - Total runs allowed
 * @property era - Earned run average
 * @property runsPer9 - Runs allowed per 9 innings
 * @property whip - Walks plus hits per inning pitched
 * @property runScoringOpportunityRate - Rate creating run opportunities
 * @property runAllowanceRating - Rating of run allowance (0-10)
 */
export interface PitcherRunAllowance {
  gamesStarted: number;
  inningsPitched: number;
  earnedRuns: number;
  runsAllowed: number;
  era: number; // Earned Run Average
  runsPer9: number;
  whip: number; // Walks + Hits per Inning Pitched
  runScoringOpportunityRate: number; // Rate of creating run scoring opportunities
  runAllowanceRating: number; // 0-10 scale where 5 is average
}

/**
 * Expected runs for a batter in a game
 * 
 * @property expectedRuns - Projected runs
 * @property confidenceScore - Confidence score (0-100)
 * @property factors - Factors affecting run production
 */
export interface ExpectedRuns {
  expectedRuns: number;
  confidenceScore: number; // 0-100
  factors: {
    playerBaseline: number;
    lineupPosition: number;
    teamOffense: number;
    pitcherQuality: number;
    ballpark: number;
    gameContext: number;
  };
}

/**
 * Expected RBIs for a batter in a game
 * 
 * @property expectedRBIs - Projected RBIs
 * @property confidenceScore - Confidence score (0-100)
 * @property factors - Factors affecting RBI production
 */
export interface ExpectedRBIs {
  expectedRBIs: number;
  confidenceScore: number; // 0-100
  factors: {
    playerBaseline: number;
    lineupPosition: number;
    teamOffense: number;
    pitcherQuality: number;
    ballpark: number;
    battingSkill: number;
    gameContext: number;
  };
}

/**
 * Overall run production projection
 * 
 * @property runs - Runs projection
 * @property rbis - RBIs projection
 * @property total - Total projection
 */
export interface RunProductionAnalysis {
  runs: {
    expected: number;
    points: number;
    confidence: number;
  };
  rbis: {
    expected: number;
    points: number;
    confidence: number;
  };
  total: {
    expected: number;
    points: number;
    confidence: number;
  };
}

/**
 * Comprehensive batter analysis for DFS as used in the implementation
 * 
 * @property batterId - MLB player ID
 * @property name - Player's full name
 * @property team - Team abbreviation
 * @property opponent - Opponent team name
 * @property opposingPitcher - Details about opposing pitcher
 * @property gameId - MLB game ID
 * @property position - Primary position
 * @property venue - Venue name
 * @property stats - Season and statistics by year
 * @property matchup - Matchup data with probable pitcher
 * @property projections - DFS projections
 * @property lineupPosition - Position in batting order
 * @property factors - Environmental factors
 * @property draftKings - DraftKings data
 */
export interface BatterAnalysis {
  batterId: number;
  name: string;
  team: string;
  opponent: string;
  opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
  position: string;
  gameId: number;
  venue: string;
  stats: {
    seasonStats: {
      "2024": SeasonStats;
      "2025": SeasonStats;
    };
    quality: BatterQualityMetrics;
  };
  matchup: {
    advantageScore: number;
    platoonAdvantage: boolean;
    historicalStats: {
      atBats: number;
      hits: number;
      avg: number;
      homeRuns: number;
      ops: number;
    };
  };
  projections: {
    homeRunProbability: number;
    stolenBaseProbability: number;
    expectedHits: {
      total: number;
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      confidence: number;
    };
    dfsProjection: {
      expectedPoints: number;
      upside: number;
      floor: number;
      breakdown: {
        hits: number;
        singles: number;
        doubles: number;
        triples: number;
        homeRuns: number;
        runs: number;
        rbi: number;
        stolenBases: number;
        walks: number;
      };
    };
  };
  lineupPosition?: number;
  factors: {
    weather: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
      temperatureFactor: number;
      windFactor: number;
      overallFactor: number;
      byHitType: {
        singles: number;
        doubles: number;
        triples: number;
        homeRuns: number;
      };
    };
    ballpark: {
      overall: number;
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      runs: number;
    };
    platoon: boolean;
    career: any;
  };
  draftKings: {
    draftKingsId: number | null;
    salary: number | null;
    positions: string[];
    avgPointsPerGame: number;
  };
}

/**
 * Batter quality metrics
 */
export interface BatterQualityMetrics {
  battedBallQuality?: number; // 0-1 scale
  power?: number; // 0-1 scale 
  contactRate?: number; // 0-1 scale
  plateApproach?: number; // 0-1 scale
  speed?: number; // 0-1 scale
  consistency?: number; // 0-100 scale
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
  total?: number;
  confidence?: number;
}

/**
 * Detailed batter projections
 */
export interface BatterProjections {
  expected: HitProjection;
  upside: HitProjection;
  floor: HitProjection;
  confidence: number; // 0-100
  homeRunProbability?: number;
  stolenBaseProbability?: number;
}

/**
 * Detailed hit projection for all hit types 
 */
export interface DetailedHitProjection {
  expectedHits: number;
  byType: {
    singles: { expected: number; points: number };
    doubles: { expected: number; points: number };
    triples: { expected: number; points: number };
    homeRuns: { expected: number; points: number };
  };
  confidence: number;
  totalHitPoints?: number; // Used in hits.ts
  atBats?: number; // Used in hits.ts
  [key: string]: any; // Allow additional properties for hits.ts
}

/**
 * Detailed hit projections by category including factors
 */
export interface DetailedHitProjections {
  total: number;
  byType: {
    singles: { expected: number; points: number };
    doubles: { expected: number; points: number };
    triples: { expected: number; points: number };
    homeRuns: { expected: number; points: number };
  };
  confidence: number;
  factors: {
    weather: any;
    ballpark: any;
    career: any;
  };
}

/**
 * Expected runs projection for a batter
 * 
 * @property expected - Expected runs value
 * @property ceiling - High-end projection
 * @property floor - Low-end projection
 * @property runFactors - Factors affecting the projection (renamed to avoid conflict)
 * @property confidence - Confidence score (0-100)
 */
export interface ExpectedRuns {
  expected: number;
  ceiling: number;
  floor: number;
  runFactors: {
    playerSkill: number; // 0-10 scale
    lineupContext: number; // 0-10 scale
    opposingPitcher: number; // 0-10 scale
    ballparkFactor: number; // 0-10 scale
  };
  confidence: number; // 0-100
}

/**
 * Expected RBIs projection for a batter
 * 
 * @property expected - Expected RBI value
 * @property ceiling - High-end projection
 * @property floor - Low-end projection
 * @property rbiFactors - Factors affecting the projection (renamed to avoid conflict)
 * @property confidence - Confidence score (0-100)
 */
export interface ExpectedRBIs {
  expected: number;
  ceiling: number;
  floor: number;
  rbiFactors: {
    playerSkill: number; // 0-10 scale
    lineupContext: number; // 0-10 scale
    opposingPitcher: number; // 0-10 scale
    ballparkFactor: number; // 0-10 scale
  };
  confidence: number; // 0-100
}

/**
 * Pitcher's tendency to allow runs
 * 
 * @property runsAllowedPerGame - Average runs allowed per game
 * @property earnedRunAverage - ERA
 * @property baseRunners - Average baserunners allowed per inning
 * @property scoringInningPercentage - % of innings where runs are scored
 */
export interface PitcherRunAllowance {
  runsAllowedPerGame: number;
  earnedRunAverage: number;
  baseRunners: number; // Average per inning
  scoringInningPercentage: number;
}

/**
 * Statistical projections for a batter
 * 
 * @property runs - Projected runs scored
 * @property rbi - Projected RBIs
 * @property expectedPoints - Expected DFS points
 * @property hitProjections - Detailed hit projections by type
 * @property upside - Ceiling projection for points
 * @property floor - Floor projection for points
 */
export interface Projections {
  runs: number;
  rbi: number;
  expectedPoints: number;
  hitProjections: {
    total: number;
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    confidence: number;
  };
  upside: number;
  floor: number;
}

/**
 * @deprecated Use BatterSeasonStats from '../player/batter'
 * 
 * This interface is maintained only for backward compatibility.
 * All new code should use BatterSeasonStats from '../player/batter'.
 * This will be removed in a future version.
 */
import { BatterSeasonStats } from '../player/batter';
export type SeasonStats = BatterSeasonStats;

/**
 * Batter game information
 */
export interface BatterInfo {
  id: number;
  name?: string;
  position: string;
  lineupPosition: number;
  isHome: boolean;
  opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
}

/**
 * Game data information
 */
export interface GameInfo {
  gameId: number;
  venue: {
    id: number;
    name: string;
  };
  homeTeam: {
    name: string;
  };
  awayTeam: {
    name: string;
  };
  environment?: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballpark?: {
    overall: number;
    types: {
      homeRuns: number;
      runs: number;
    };
  };
  lineups: {
    homeCatcher?: { id: number };
    awayCatcher?: { id: number };
  };
  pitchers: {
    away: {
      id: number;
      name: string;
      throwsHand: string;
    };
    home: {
      id: number;
      name: string;
      throwsHand: string;
    };
  };
}

/**
 * DraftKings player information
 */
export interface DKPlayer {
  id: number;
  name: string;
  position: string;
  salary: number;
  avgPointsPerGame: number;
  team?: string;
  lineupPosition?: number;
}