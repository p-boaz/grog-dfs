/**
 * MLB Pitcher Type Definitions
 *
 * This file contains type definitions specific to MLB pitchers.
 */

/**
 * Pitcher's ability to hold runners and control the running game
 *
 * @property pickoffMoves - Pickoff move quality (1-10 scale)
 * @property slideStepTime - Time to plate with slide step (seconds)
 * @property timeToPlate - Regular delivery time (seconds)
 * @property stolenBaseAllowedRate - SB allowed per 9 innings
 * @property holdRating - Rating of ability to hold runners (1-10)
 */
export interface PitcherHoldMetrics {
  pickoffMoves: number; // 1-10 scale
  slideStepTime: number; // Time to plate with slide step in seconds
  timeToPlate: number; // Regular delivery time in seconds
  stolenBaseAllowedRate: number; // SB allowed per 9 innings
  holdRating: number; // 1-10 scale of ability to hold runners
}

/**
 * Pitcher's performance stats for a specific season
 *
 * @property gamesPlayed - Total games played/appeared in
 * @property gamesStarted - Games where pitcher was the starter
 * @property inningsPitched - Total innings pitched
 * @property wins - Wins credited to the pitcher
 * @property losses - Losses credited to the pitcher
 * @property era - Earned run average
 * @property whip - Walks plus hits per inning pitched
 * @property strikeouts - Total strikeouts
 * @property walks - Total walks issued
 * @property saves - Total saves recorded
 * @property homeRunsAllowed - Home runs allowed
 * @property hitBatsmen - Hit batters
 * @property hits - Total hits allowed
 */
export interface PitcherSeasonStats {
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: number;
  wins: number;
  losses: number;
  era: number;
  whip: number;
  strikeouts: number;
  walks: number;
  saves: number;
  homeRunsAllowed?: number;
  hitBatsmen: number;
  hits: number;
}

/**
 * Pitcher's performance stats for a specific season
 * with team context
 */
export interface PitcherCareerStatsSeason extends PitcherSeasonStats {
  season: string;
  team: string;
}

/**
 * Comprehensive pitcher data including stats by season
 *
 * @property id - MLB player ID
 * @property fullName - Pitcher's full name
 * @property currentTeam - Current team name
 * @property primaryPosition - Position code
 * @property pitchHand - Throwing hand (L/R)
 * @property seasonStats - Season stats indexed by year
 * @property careerStats - Career stats by season
 * @property sourceTimestamp - When the data was retrieved
 */
export interface PitcherStats {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  pitchHand: string;
  seasonStats: {
    [season: string]: PitcherSeasonStats;
  };
  careerStats: PitcherCareerStatsSeason[];
  sourceTimestamp?: Date;
}

/**
 * Pitcher's pitch mix data and effectiveness metrics
 *
 * @property playerId - MLB player ID
 * @property name - Pitcher's name
 * @property pitches - Percentage usage of each pitch type
 * @property averageVelocity - Average velocity by pitch type
 * @property effectiveness - Effectiveness rating by pitch type
 * @property controlMetrics - Control and command metrics
 * @property velocityTrends - Velocity trends over time
 */
export interface PitcherPitchMixData {
  playerId: number;
  name: string;
  pitches: {
    fastball: number; // percentage
    slider: number;
    curve: number;
    changeup: number;
    sinker: number;
    cutter: number;
    other: number;
  };
  averageVelocity: {
    fastball?: number;
    slider?: number;
    curve?: number;
    changeup?: number;
    sinker?: number;
    cutter?: number;
  };
  effectiveness: {
    fastball?: number; // scale 0-100
    slider?: number;
    curve?: number;
    changeup?: number;
    sinker?: number;
    cutter?: number;
  };
  controlMetrics: {
    zonePercentage: number;
    firstPitchStrikePercent: number;
    swingingStrikePercent: number;
    chaseRate: number;
  };
  velocityTrends?: {
    recentGames: {
      date: string;
      avgVelocity: number;
      change: number;
    }[];
    seasonAvg: number;
    recent15DayAvg: number;
    velocityChange: number;
  };
  sourceTimestamp?: Date;
}

/**
 * Pitcher's home run vulnerability metrics
 *
 * @property gamesStarted - Games started
 * @property inningsPitched - Innings pitched
 * @property homeRunsAllowed - Home runs allowed
 * @property hrPer9 - Home runs per 9 innings
 * @property flyBallPct - Percentage of batted balls that are fly balls
 * @property hrPerFlyBall - Home runs per fly ball
 * @property homeRunVulnerability - Overall HR vulnerability rating (0-10)
 */
export interface PitcherHomeRunVulnerability {
  gamesStarted: number;
  inningsPitched: number;
  homeRunsAllowed: number;
  hrPer9: number;
  flyBallPct?: number;
  hrPerFlyBall?: number;
  homeRunVulnerability: number; // 0-10 scale where 5 is average
}

/**
 * Pitcher's expected performance metrics
 *
 * @property expectedInnings - Projected innings pitched
 * @property expectedStrikeouts - Projected strikeouts
 * @property winProbability - Probability of recording a win
 * @property qualityStartProbability - Probability of recording a quality start
 * @property projectedDFSPoints - Expected DFS points
 */
export interface PitcherProjections {
  expectedInnings: number;
  expectedStrikeouts: number;
  winProbability: number;
  qualityStartProbability?: number;
  projectedDFSPoints: number;
}
