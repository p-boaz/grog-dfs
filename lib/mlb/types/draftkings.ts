/**
 * DraftKings Type Definitions
 *
 * This file contains types related to DraftKings data, salaries, and player mappings.
 */

/**
 * DraftKings player entry from CSV file
 * 
 * @property Position - DraftKings position
 * @property Name - Player name
 * @property Name_and_ID - Name with DraftKings ID
 * @property ID - DraftKings player ID
 * @property Roster_Position - Roster slot
 * @property Salary - DraftKings salary
 * @property Game_Info - Game description (e.g., "HOU@BOS")
 * @property TeamAbbrev - Team abbreviation
 * @property AvgPointsPerGame - Average DFS points per game
 */
export interface DraftKingsCSVEntry {
  Position: string;
  Name: string;
  Name_and_ID: string;
  ID: string;
  Roster_Position: string;
  Salary: string;
  Game_Info: string;
  TeamAbbrev: string;
  AvgPointsPerGame: string;
}

/**
 * Processed DraftKings player data
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
 * DraftKings player mapping entry
 * Mapping between DraftKings names and MLB IDs
 */
export interface DraftKingsMapping {
  dkName: string;
  mlbId: number;
  mlbName: string;
  team: string;
}

/**
 * DraftKings information attached to a player
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
 * DraftKings scoring rules for MLB
 */
export interface DraftKingsScoringRules {
  hitter: {
    single: number;
    double: number;
    triple: number;
    homeRun: number;
    rbi: number;
    run: number;
    baseOnBalls: number;
    hitByPitch: number;
    stolenBase: number;
  };
  pitcher: {
    inningPitched: number;
    strikeout: number;
    win: number;
    earnedRunAllowed: number;
    hitAgainst: number;
    baseOnBallsAgainst: number;
    hitBatsman: number;
    completeGame: number;
    completeGameShutout: number;
    noHitter: number;
  };
}