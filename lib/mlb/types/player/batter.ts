/**
 * MLB Batter Type Definitions
 *
 * This file contains type definitions specific to MLB batters.
 */

/**
 * Player's stolen base statistics for a single season
 * 
 * @property battingAverage - Player's batting average for the season
 * @property stolenBases - Total number of successful stolen bases
 * @property stolenBaseAttempts - Total number of stolen base attempts
 * @property caughtStealing - Number of times caught stealing
 * @property gamesPlayed - Total games played in the season
 * @property stolenBaseRate - Stolen bases per game (SB/games)
 * @property stolenBaseSuccess - Success rate of stolen base attempts (SB/attempts)
 */
export interface PlayerSBSeasonStats {
  battingAverage: number;
  stolenBases: number;
  stolenBaseAttempts: number;
  caughtStealing: number;
  gamesPlayed: number;
  stolenBaseRate: number; // SB per game
  stolenBaseSuccess: number; // Success rate (0-1)
}

/**
 * Player's career stolen base profile
 * 
 * @property careerStolenBases - Total stolen bases over career
 * @property careerGames - Total career games played
 * @property careerRate - Career stolen bases per game
 * @property bestSeasonSB - Most stolen bases in a single season
 * @property bestSeasonRate - Best stolen base rate in a single season
 * @property recentTrend - Direction of recent stealing activity
 */
export interface PlayerSBCareerProfile {
  careerStolenBases: number;
  careerGames: number;
  careerRate: number; // Career SB per game
  bestSeasonSB: number; // Most SB in a single season
  bestSeasonRate: number; // Best SB per game in a season
  recentTrend: "increasing" | "decreasing" | "stable";
}

/**
 * Stolen base opportunity projection
 * 
 * @property expectedAttempts - Projected number of steal attempts per game
 * @property successProbability - Likelihood of successful stolen base
 * @property projectedSB - Expected stolen bases per game
 * @property factors - Component factors affecting the projection
 */
export interface StolenBaseProjection {
  expectedAttempts: number; // Expected SB attempts per game
  successProbability: number; // Probability of success (0-1)
  projectedSB: number; // Expected SB per game
  factors: {
    playerBaseline: number;
    careerTrend: number;
    catcherImpact: number;
    pitcherImpact: number;
    situationalAdjustment: number;
  };
}

/**
 * Context for stolen base situation
 * 
 * @property isHome - Whether batter's team is home team
 * @property scoreMargin - Run differential (positive = ahead, negative = behind)
 * @property inning - Current inning
 * @property isCloseGame - Whether game is within 2 runs
 */
export interface StolenBaseContext {
  isHome?: boolean;
  scoreMargin?: number; // positive = ahead, negative = behind
  inning?: number;
  isCloseGame?: boolean;
}

/**
 * Batter season statistics 
 * 
 * @property gamesPlayed - Games played in the season
 * @property atBats - Number of at bats
 * @property hits - Total hits
 * @property homeRuns - Home runs hit
 * @property rbis - Runs batted in
 * @property stolenBases - Stolen bases
 * @property avg - Batting average
 * @property obp - On-base percentage
 * @property slg - Slugging percentage
 * @property ops - On-base plus slugging
 */
export interface BatterSeasonStats {
  gamesPlayed: number | null;
  atBats?: number | null;
  hits?: number | null;
  doubles?: number | null;
  triples?: number | null;
  homeRuns?: number | null;
  rbis?: number | null;
  walks?: number | null;
  strikeouts?: number | null;
  stolenBases?: number | null;
  avg?: number | null;
  obp?: number | null;
  slg?: number | null;
  ops?: number | null;
}

/**
 * Comprehensive batter information
 * 
 * @property batterId - MLB player ID for batter
 * @property name - Full player name
 * @property team - Team abbreviation
 * @property teamId - Team ID
 * @property position - Defensive position
 * @property handedness - Batting hand (L/R/S)
 * @property stats - Statistics by season
 */
export interface MLBBatter {
  batterId: number;
  name: string;
  team: string;
  teamId: number;
  position: string;
  handedness: string;
  stats: {
    seasons: Record<string, BatterSeasonStats>;
  };
}