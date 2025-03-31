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
 * Enum for hit types
 */
export enum HitType {
  SINGLE = "single",
  DOUBLE = "double",
  TRIPLE = "triple",
  HOME_RUN = "homeRun",
}

/**
 * Points awarded in DraftKings for each hit type
 */
export const HIT_TYPE_POINTS = {
  [HitType.SINGLE]: 3,
  [HitType.DOUBLE]: 5,
  [HitType.TRIPLE]: 8,
  [HitType.HOME_RUN]: 10,
};

/**
 * Player's hit statistics for a specific game or season
 */
export interface PlayerHitStats {
  battingAverage: number;
  onBasePercentage: number;
  sluggingPct: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  atBats: number;
  games: number;
  hitRate: number;
  singleRate: number;
  doubleRate: number;
  tripleRate: number;
  babip?: number; // Batting avg on balls in play
  lineDriverRate?: number;
  contactRate?: number;
}

/**
 * Career hit profile based on historical data
 */
export interface CareerHitProfile {
  careerHits: number;
  careerSingles: number;
  careerDoubles: number;
  careerTriples: number;
  careerGames: number;
  careerAtBats: number;
  careerBattingAverage: number;
  hitTypeDistribution: {
    singlePct: number;
    doublePct: number;
    triplePct: number;
    homeRunPct: number;
  };
  bestSeasonAvg: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  homeVsAway: {
    homeAvg: number;
    awayAvg: number;
    homeAdvantage: number; // Ratio of home to away batting average
  };
}

/**
 * Ballpark hit factors by venue and hit type
 */
export interface BallparkHitFactor {
  overall: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  runFactor: number;
  rbiFactor: number;
  byHitType?: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
  byHandedness?: {
    rHB: number;
    lHB: number;
  };
}

/**
 * Weather impact on hit production
 */
export interface WeatherHitImpact {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  isOutdoor: boolean;
  temperatureFactor: number; // Effect of temperature
  windFactor: number; // Effect of wind
  overallFactor: number; // Combined effect
  byHitType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
}

/**
 * Pitcher's vulnerability to allowing hits
 */
export interface PitcherHitVulnerability {
  gamesStarted: number;
  inningsPitched: number;
  hitsAllowed: number;
  hitsPer9: number;
  babip: number; // Batting average on balls in play allowed
  byHitType: {
    singles: number; // Vulnerability score by hit type (1-10)
    doubles: number;
    triples: number;
  };
  hitVulnerability: number; // 0-10 scale where 5 is average
}

/**
 * Batter vs pitcher matchup data focused on hit types
 */
export interface MatchupHitStats {
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  battingAverage: number;
  sampleSize: "large" | "medium" | "small" | "none";
  advantage: "batter" | "pitcher" | "neutral";
}

/**
 * Batter's platoon splits (vs LHP/RHP)
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
  platoonAdvantage: "vs-left" | "vs-right" | "neutral";
  platoonSplit: number;
}

/**
 * Expected hit rates by type for a specific game
 */
export interface HitTypeRates {
  expectedBA: number;
  hitTypeRates: {
    single: number;
    double: number;
    triple: number;
    homeRun: number;
  };
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
 * Expected hits and DFS points from hitting for a specific player in a game
 */
export interface DetailedHitProjection {
  expectedHits: number;
  byType: {
    singles: {
      expected: number;
      points: number;
    };
    doubles: {
      expected: number;
      points: number;
    };
    triples: {
      expected: number;
      points: number;
    };
    homeRuns: {
      expected: number;
      points: number;
    };
  };
  totalHitPoints: number;
  atBats: number;
  confidence: number; // 0-1 scale
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
  confidence: number; // Added alias for aggregateScoring.ts compatibility
  eventProbabilities: {
    completeGame: number; // 0-100, percentage
    qualityStart: number; // 0-100, percentage
    shutout: number; // 0-100, percentage
    noHitter: number; // 0-100, percentage
    perfectGame: number; // 0-100, percentage
  };
  riskRewardRating: number; // 0-10 scale
}