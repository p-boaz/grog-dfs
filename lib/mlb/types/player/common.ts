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
  sourceType?: 'actual' | 'projected' | 'combined';
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