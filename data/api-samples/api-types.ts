/**
 * MLB API Response Types
 * 
 * Auto-generated from actual API responses
 * Generated on: 3/31/2025, 4:21:41 PM
 */

/**
 * Response type for endpoint: game/feed/717465
 */
export interface GameFeed717465Response {
  copyright: string;
  gamePk: number;
  link: string;
  metaData: Record<string, any>;
  gameData: Record<string, any>;
  liveData: Record<string, any>;
  sourceTimestamp: string;
  __isApiSource: boolean;
}

/**
 * Response type for endpoint: player/batter/665742
 */
export interface PlayerBatter665742Response {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  batSide: string;
  seasonStats: Record<string, any>;
  careerStats: Array<Record<string, any>>;
  sourceTimestamp: string;
  __isApiSource: boolean;
}

/**
 * Response type for endpoint: player/pitcher/592789
 */
export interface PlayerPitcher592789Response {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  pitchHand: string;
  seasonStats: Record<string, any>;
  careerStats: Array<Record<string, any>>;
  sourceTimestamp: string;
  __isApiSource: boolean;
}

/**
 * Response type for endpoint: schedule/today
 */
export interface ScheduleTodayResponse {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  dates: Array<Record<string, any>>;
}

/**
 * Response type for endpoint: weather/game/717465
 */
export interface WeatherGame717465Response {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: boolean;
  isOutdoor: boolean;
  venueId: number;
  venueName: string;
  hasRoof: boolean;
  sourceTimestamp: string;
  __isApiSource: boolean;
}

