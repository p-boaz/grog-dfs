/**
 * MLB Event Analysis Type Definitions
 *
 * This file contains type definitions for special event analysis (home runs, stolen bases, etc.).
 */

/**
 * Home run analysis for a batter
 * 
 * @property expectedHomeRuns - Projected home runs
 * @property homeRunProbability - Probability of hitting at least one HR
 * @property multipleHRProbability - Probability of hitting multiple HRs
 * @property factors - Factors affecting HR probability
 * @property confidence - Confidence score (0-100)
 */
export interface HomeRunAnalysis {
  expectedHomeRuns: number;
  homeRunProbability: number; // 0-1
  multipleHRProbability: number; // 0-1
  factors: {
    batterPower: number; // 0-10 scale
    pitcherVulnerability: number; // 0-10 scale
    ballparkFactor: number; // 0-10 scale
    weatherFactor: number; // 0-10 scale
    recentForm: number; // 0-10 scale
  };
  confidence: number; // 0-100
}

/**
 * Stolen base analysis for a batter
 * 
 * @property expectedSteals - Projected stolen bases
 * @property stealAttemptProbability - Probability of attempting a steal
 * @property stealSuccessProbability - Probability of success if attempted
 * @property factors - Factors affecting steal probability
 * @property confidence - Confidence score (0-100)
 */
export interface StolenBaseAnalysis {
  expectedSteals: number;
  stealAttemptProbability: number; // 0-1
  stealSuccessProbability: number; // 0-1
  factors: {
    batterSpeed: number; // 0-10 scale
    batterTendency: number; // 0-10 scale
    catcherDefense: number; // 0-10 scale
    pitcherHoldRate: number; // 0-10 scale
    gameScriptFactor: number; // 0-10 scale
  };
  confidence: number; // 0-100
}

/**
 * Hit analysis for a batter
 * 
 * @property expectedHits - Projected hits
 * @property hitTypes - Distribution by hit type
 * @property factors - Factors affecting hit probability
 * @property confidence - Confidence score (0-100)
 */
export interface HitAnalysis {
  expectedHits: number;
  hitTypes: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
  factors: {
    batterContact: number; // 0-10 scale
    pitcherQuality: number; // 0-10 scale
    ballparkFactor: number; // 0-10 scale
    weatherFactor: number; // 0-10 scale
    defenseQuality: number; // 0-10 scale
  };
  confidence: number; // 0-100
}

/**
 * Rare events analysis for a pitcher
 * 
 * @property expectedRareEventPoints - Expected DFS points from rare events
 * @property eventProbabilities - Probabilities of each rare event
 * @property confidenceScore - Confidence score (0-100)
 * @property riskRewardRating - Risk-reward rating (0-10)
 */
export interface RareEventAnalysis {
  expectedRareEventPoints: number;
  confidenceScore: number; // 0-100
  eventProbabilities: {
    completeGame: number; // 0-100, percentage
    qualityStart: number; // 0-100, percentage
    shutout: number; // 0-100, percentage
    noHitter: number; // 0-100, percentage
    perfectGame: number; // 0-100, percentage
  };
  riskRewardRating: number; // 0-10 scale
}