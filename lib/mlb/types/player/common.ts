/**
 * MLB Common Player Type Definitions
 *
 * This file contains type definitions common to all MLB players (both batters and pitchers).
 */

/**
 * Base player type with common fields
 *
 * @property playerId - MLB player ID
 * @property name - Player's full name
 * @property team - Team abbreviation/name
 * @property teamId - MLB team ID
 * @property position - Player's primary position
 * @property handedness - Throws/bats handedness (L/R/S)
 */
export interface BasePlayer {
  playerId: number;
  name: string;
  team: string;
  teamId: number;
  position: string;
  handedness: string;
}

/**
 * Common stats structure that applies to both pitchers and batters
 *
 * @property gamesPlayed - Number of games played
 * @property sourceSeason - Season the stats are from
 * @property sourceType - Type of stats (actual/projected/etc)
 */
export interface BaseStats {
  gamesPlayed: number | null;
  sourceSeason?: string;
  sourceType?: "actual" | "projected" | "combined";
}

/**
 * DraftKings player entry
 *
 * @property mlbId - MLB player ID
 * @property id - DraftKings player ID
 * @property name - Player name as listed in DraftKings
 * @property position - Position in DraftKings
 * @property salary - DraftKings salary
 * @property avgPointsPerGame - Average DFS points per game
 * @property team - Team abbreviation
 */
export interface DraftKingsPlayer {
  mlbId: number;
  id: number;
  name: string;
  position: string;
  salary: number;
  avgPointsPerGame: number;
  team: string;
}

/**
 * DraftKings information for a player
 *
 * @property draftKingsId - DraftKings player ID
 * @property salary - DraftKings salary
 * @property positions - Eligible positions
 * @property avgPointsPerGame - Average DFS points per game
 */
export interface DraftKingsInfo {
  draftKingsId: number | null;
  salary: number | null;
  positions: string[];
  avgPointsPerGame: number;
}

/**
 * Player search result format
 *
 * @property id - MLB player ID
 * @property fullName - Player's full name
 * @property team - Current team
 * @property position - Primary position
 * @property handedness - Throws/bats handedness
 * @property lastSeason - Last season with stats
 * @property active - Whether player is active
 */
export interface PlayerSearchResult {
  id: number;
  fullName: string;
  team?: string;
  position: string;
  handedness?: string;
  lastSeason?: string;
  active: boolean;
}

/**
 * Catcher's defensive metrics related to stolen bases
 *
 * @property playerId - MLB player ID
 * @property fullName - Player's full name
 * @property caughtStealingPercentage - Rate of caught stealing
 * @property stolenBasesAllowed - Number of stolen bases allowed
 * @property caughtStealing - Number of runners caught stealing
 * @property attemptsPer9 - Steal attempts per 9 innings
 * @property popTime - Time from catching to release in seconds
 * @property armStrength - MPH on throws
 * @property defensiveRating - Overall rating of defense vs stolen bases
 * @property teamRank - Rank among MLB catchers
 * @property runs_saved_vs_running - Advanced stat: runs saved vs average
 * @property sourceTimestamp - When the data was retrieved
 */
export interface CatcherDefenseMetrics {
  playerId: number;
  fullName: string;
  caughtStealingPercentage: number;
  stolenBasesAllowed: number;
  caughtStealing: number;
  attemptsPer9: number;
  popTime?: number; // Time from catching to release in seconds
  armStrength?: number; // MPH on throws
  defensiveRating: number; // Overall 0-100 rating of defense vs stolen bases
  teamRank?: number; // Rank among MLB catchers
  runs_saved_vs_running?: number; // Advanced stat: runs saved vs average
  sourceTimestamp?: Date;
}

/**
 * Battery (pitcher+catcher) vulnerability to stolen bases
 *
 * @property vulnerability - Rating from 1-10 (higher = easier to steal)
 * @property catcherFactor - How much the catcher influences vulnerability
 * @property pitcherFactor - How much the pitcher influences vulnerability
 * @property catcherMetrics - Detailed catcher metrics
 */
export interface BatteryVulnerability {
  vulnerability: number; // Scale 1-10 where 5 is league average
  catcherFactor: number; // How much the catcher influences vulnerability (0-1)
  pitcherFactor: number; // How much the pitcher influences vulnerability (0-1)
  catcherMetrics: CatcherDefenseMetrics | null;
}

/**
 * Interface for player stolen base stats for a season
 * 
 * @property playerId - MLB player ID
 * @property season - The season for these stats
 * @property stolenBases - Number of stolen bases
 * @property caughtStealing - Number of times caught stealing
 * @property stolenBaseAttempts - Total attempts (SB + CS)
 * @property stolenBaseSuccess - Success rate
 * @property stolenBasePercentage - Success rate as percentage
 * @property gamesStolenBase - Number of games with at least one SB
 * @property attemptsPerGame - Steal attempts per game
 * @property successPerGame - Successful steals per game
 * @property greenLightScore - Measure of player's freedom to steal (0-100)
 * @property opportunityRate - How often player gets to first base
 * @property sprintSpeed - Player's sprint speed in feet/second
 */
export interface PlayerSBSeasonStats {
  playerId: number;
  season: string;
  stolenBases: number;
  caughtStealing: number;
  stolenBaseAttempts: number;
  stolenBaseSuccess: number;
  stolenBasePercentage: number;
  gamesStolenBase: number;
  attemptsPerGame: number;
  successPerGame: number;
  greenLightScore: number;
  opportunityRate: number;
  sprintSpeed?: number;
}
