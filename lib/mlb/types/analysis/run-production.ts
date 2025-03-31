/**
 * Run production analysis type definitions
 */

/**
 * Career run production metrics and trends
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
  seasonToSeasonVariance: number;
}

/**
 * Team offensive context and scoring potential
 */
export interface TeamOffensiveContext {
  runsPerGame: number;
  teamOffensiveRating: number;
  lineupStrength: {
    overall: number;
    topOfOrder: number;
    bottomOfOrder: number;
  };
  runnersOnBaseFrequency: number;
}

/**
 * Ballpark factors affecting run production
 */
export interface BallparkHitFactor {
  overall: number;
  types: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    runs: number;
  };
  dimensions: {
    leftField: number;
    centerField: number;
    rightField: number;
  };
}

/**
 * Lineup context for run production
 */
export interface LineupContext {
  position: number;
  isTopOfOrder: boolean;
  isBottomOfOrder: boolean;
  runnersOnBaseFrequency: number;
  rbiOpportunities: number;
  runScoringOpportunities: number;
}

/**
 * Pitcher's run allowance metrics
 */
export interface PitcherRunAllowance {
  runsAllowedPerGame: number;
  earnedRunAverage: number;
  runPreventionRating: number;
  qualityStartPercentage: number;
  runScoringVulnerability: {
    early: number;
    middle: number;
    late: number;
  };
}

/**
 * Expected runs projection
 */
export interface ExpectedRuns {
  expected: number;
  ceiling: number;
  floor: number;
  runFactors: {
    playerSkill: number;
    lineupContext: number;
    opposingPitcher: number;
    ballparkFactor: number;
  };
  confidence: number;
}

/**
 * Expected RBIs projection
 */
export interface ExpectedRBIs {
  expected: number;
  ceiling: number;
  floor: number;
  rbiFactors: {
    playerSkill: number;
    lineupContext: number;
    opposingPitcher: number;
    ballparkFactor: number;
  };
  confidence: number;
}

/**
 * Run production points projection - specific interface for DFS scoring
 */
export interface RunProductionPoints {
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
