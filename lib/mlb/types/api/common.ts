/**
 * Common API type definitions
 * 
 * These types are used across multiple API endpoints and represent
 * the base structures returned directly from the MLB API.
 */

/**
 * Base API response marker
 * All API responses should include this property
 */
export interface ApiSourceMarker {
  __isApiSource: boolean;
  sourceTimestamp: string;
}

/**
 * Generic MLB API response with copyright notice
 */
export interface MLBApiResponse {
  copyright: string;
}

/**
 * ID reference to an MLB entity (team, player, venue, etc.)
 */
export interface MLBEntityReference {
  id: number;
  link?: string;
  name?: string;
}

/**
 * Common player reference
 */
export interface PlayerReference {
  id: number;
  fullName: string;
  link?: string;
}

/**
 * Team reference
 */
export interface TeamReference {
  id: number;
  name: string;
  link?: string;
  abbreviation?: string;
}

/**
 * Venue reference
 */
export interface VenueReference {
  id: number;
  name: string;
  link?: string;
}

/**
 * Base player position information
 */
export interface PlayerPosition {
  code: string;
  name: string;
  type: string;
  abbreviation: string;
}

/**
 * Game date information
 */
export interface GameDate {
  date: string;           // ISO date string YYYY-MM-DD
  totalItems: number;     // Total number of items on date
  totalEvents: number;    // Total number of events on date
  totalGames: number;     // Total number of games on date
  totalGamesInProgress: number; // Total number of active games
  games: GameSummary[];   // List of games on date
}

/**
 * Game summary information from schedule endpoint
 */
export interface GameSummary {
  gamePk: number;
  link: string;
  gameType: string;
  season: string;
  gameDate: string;      // ISO datetime string
  status: GameStatus;
  teams: {
    away: TeamGameInfo;
    home: TeamGameInfo;
  };
  venue: VenueReference;
  content: {
    link: string;
  };
}

/**
 * Game status information
 */
export interface GameStatus {
  abstractGameState: string;  // "Live", "Preview", "Final"
  codedGameState: string;     // Numeric code
  detailedState: string;      // Detailed text description
  statusCode: string;         // Status code
  startTimeTBD: boolean;      // Whether start time is to be determined
}

/**
 * Team game information including record
 */
export interface TeamGameInfo {
  score?: number;             // Team score (may be absent in preview)
  team: TeamReference;        // Team reference
  leagueRecord?: {            // Team record
    wins: number;
    losses: number;
    pct: string;             // Winning percentage as string (e.g. ".500")
  };
  splitSquad?: boolean;       // Whether team is fielding a split squad
  seriesNumber?: number;      // Series number
  probablePitcher?: {         // Probable pitcher info
    id: number;
    fullName: string;
    link?: string;
  };
}

/**
 * Handedness information (batting or pitching)
 */
export interface Handedness {
  code: string;               // "R", "L", or "S"
  description: string;        // "Right", "Left", or "Switch"
}