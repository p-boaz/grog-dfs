/**
 * MLB Game API Type Definitions
 *
 * These types represent the raw responses from MLB API endpoints
 * for game data, including game feeds, schedules, and environments.
 */

import { ApiSourceMarker, GameDate, MLBApiResponse } from "./common";

/**
 * Schedule API response
 */
export interface ScheduleApiResponse extends MLBApiResponse {
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  dates: GameDate[];
}

/**
 * Game feed API response (v1.1)
 */
export interface GameFeedApiResponse extends MLBApiResponse, ApiSourceMarker {
  gamePk: number;
  link: string;
  metaData: GameMetaData;
  gameData: GameData;
  liveData: LiveData;
}

/**
 * Game metadata from feed
 */
export interface GameMetaData {
  timeStamp: string;
  wait: number;
  gameEvents: string[];
  logicalEvents: string[];
}

/**
 * Game data section from feed
 */
export interface GameData {
  game: {
    pk: number;
    type: string;
    doubleHeader: string;
    id: string;
    gamedayType: string;
    tiebreaker: string;
    gameNumber: number;
    season: string;
    seasonDisplay: string;
  };
  datetime: GameDateTime;
  status: GameDetailedStatus;
  teams: GameTeams;
  venue: GameVenue;
  weather: GameWeather;
  probablePitchers: {
    home?: { id: number; fullName: string; link: string };
    away?: { id: number; fullName: string; link: string };
  };
  players: Record<string, GamePlayer>;
}

/**
 * Game date/time information
 */
export interface GameDateTime {
  dateTime: string;
  originalDate: string;
  dayNight: string;
  time: string;
  ampm: string;
}

/**
 * Detailed game status
 */
export interface GameDetailedStatus {
  abstractGameState: string;
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD: boolean;
  abstractGameCode: string;
}

/**
 * Game teams information
 */
export interface GameTeams {
  away: GameTeam;
  home: GameTeam;
}

/**
 * Game team details
 */
export interface GameTeam {
  id: number;
  name: string;
  link: string;
  season: number;
  venue: {
    id: number;
    name: string;
    link: string;
  };
  teamStats: {
    batting: Record<string, any>;
    pitching: Record<string, any>;
  };
  record: {
    gamesPlayed: number;
    wildCardGamesBack: string;
    leagueGamesBack: string;
    divisionGamesBack: string;
    leagueRecord: {
      wins: number;
      losses: number;
      pct: string;
    };
  };
}

/**
 * Game venue information
 */
export interface GameVenue {
  id: number;
  name: string;
  link: string;
  location: {
    address1: string;
    city: string;
    state: string;
    stateAbbrev: string;
    postalCode: string;
    defaultCoordinates: {
      latitude: number;
      longitude: number;
    };
    country: string;
    timeZone: {
      id: string;
      offset: number;
      tz: string;
    };
  };
  fieldInfo: {
    capacity: number;
    turfType: string;
    roofType: string;
    leftLine: number;
    leftCenter: number;
    center: number;
    rightCenter: number;
    rightLine: number;
  };
}

/**
 * Game weather information
 */
export interface GameWeather {
  condition: string;
  temp: string;
  wind: string;
}

/**
 * Player information in game context
 */
export interface GamePlayer {
  id: number;
  fullName: string;
  link: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentAge: number;
  birthCity: string;
  birthStateProvince: string;
  birthCountry: string;
  height: string;
  weight: number;
  active: boolean;
  primaryPosition: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  useName: string;
  middleName: string;
  boxscoreName: string;
  gender: string;
  isPlayer: boolean;
  isVerified: boolean;
  draftYear: number;
  mlbDebutDate: string;
  batSide: { code: string; description: string };
  pitchHand: { code: string; description: string };
  nameFirstLast: string;
  nameSlug: string;
  firstLastName: string;
  lastFirstName: string;
  lastInitName: string;
  initLastName: string;
  fullFMLName: string;
  fullLFMName: string;
  strikeZoneTop: number;
  strikeZoneBottom: number;
}

/**
 * Live data section from game feed
 */
export interface LiveData {
  plays: GamePlays;
  linescore: GameLinescore;
  boxscore: GameBoxscore;
  decisions?: {
    winner?: { id: number; fullName: string; link: string };
    loser?: { id: number; fullName: string; link: string };
    save?: { id: number; fullName: string; link: string };
  };
}

/**
 * Game plays information
 */
export interface GamePlays {
  allPlays: any[];
  currentPlay: any;
  scoringPlays: number[];
  playsByInning: any[];
}

/**
 * Game linescore information
 */
export interface GameLinescore {
  currentInning: number;
  currentInningOrdinal: string;
  inningState: string;
  inningHalf: string;
  isTopInning: boolean;
  scheduledInnings: number;
  innings: any[];
  teams: {
    home: { runs: number; hits: number; errors: number; leftOnBase: number };
    away: { runs: number; hits: number; errors: number; leftOnBase: number };
  };
  defense: any;
  offense: any;
  balls: number;
  strikes: number;
  outs: number;
}

/**
 * Game boxscore information
 */
export interface GameBoxscore {
  teams: {
    home: GameBoxscoreTeam;
    away: GameBoxscoreTeam;
  };
  officials: any[];
  info: any[];
  pitchingNotes: any[];
}

/**
 * Team boxscore information
 */
export interface GameBoxscoreTeam {
  team: { id: number; name: string; link: string };
  teamStats: {
    batting: Record<string, any>;
    pitching: Record<string, any>;
  };
  players: Record<
    string,
    {
      person: { id: number; fullName: string; link: string };
      jerseyNumber: string;
      position: {
        code: string;
        name: string;
        type: string;
        abbreviation: string;
      };
      status: { code: string; description: string };
      parentTeamId: number;
      batterStats?: Record<string, any>;
      pitcherStats?: Record<string, any>;
    }
  >;
  batters: number[];
  pitchers: number[];
  bench: number[];
  bullpen: number[];
  battingOrder: number[];
  info: Record<string, any>;
  note: string[];
}

/**
 * Game environment data from weather API
 */
export interface GameEnvironmentApiResponse extends ApiSourceMarker {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: boolean;
  isOutdoor: boolean;
  venueId: number;
  venueName: string;
  hasRoof: boolean;
}
