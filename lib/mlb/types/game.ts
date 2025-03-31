/**
 * MLB Game Type Definitions
 *
 * This file contains game-related type definitions including schedules and feeds.
 */

// Importing from core and re-exporting the same type name causes conflicts
// Use custom name to avoid TeamStats naming conflict
import { TeamStats as CoreTeamStats } from "./core";
import { BallparkFactors } from "./environment/ballpark";

/**
 * Raw weather data from MLB API
 */
export interface MLBWeatherData {
  condition: string;
  temp: string; // MLB API returns temperature as string
  wind: string;
  sourceTimestamp?: Date;
}

/**
 * Processed weather information with parsed values
 */
export interface DetailedWeatherInfo {
  temperature: number;
  condition: string;
  wind: {
    speed: number;
    direction: string;
    isCalm: boolean;
  };
  isOutdoor: boolean;
  isPrecipitation: boolean;
}

/**
 * Game feed response from MLB API
 */
export interface GameFeedResponse {
  gamePk: number;
  gameData?: {
    status?: {
      abstractGameState?: string;
      detailedState?: string;
      codedGameState?: string;
    };
    teams?: {
      away?: {
        team?: {
          id: number;
          name: string;
        };
      };
      home?: {
        team?: {
          id: number;
          name: string;
        };
      };
    };
    weather?: {
      temp?: number;
      wind?: string;
      humidity?: number;
      pressure?: number;
      condition?: string;
    };
    venue?: {
      id?: number;
      name?: string;
      roofType?: string;
      roofStatus?: string;
    };
  };
  liveData?: {
    plays?: any;
    boxscore?: any;
    linescore?: any;
  };
  sourceTimestamp?: Date;
}

/**
 * Box score response from MLB API
 */
export interface GameBoxScoreResponse {
  teams: {
    away: {
      team: { name: string };
      teamStats?: any;
      players?: Record<string, any>;
    };
    home: {
      team: { name: string };
      teamStats?: any;
      players?: Record<string, any>;
    };
  };
  officials?: Array<any>;
  info?: Array<any>;
  pitchingNotes?: Array<any>;
}

/**
 * Game schedule information
 */
export interface GameSchedule {
  gamePk: number;
  gameDate: string; // UTC timestamp of game start time
  officialDate?: string; // Official MLB game date (may differ from gameDate due to timezone)
  teams: {
    away?: {
      team?: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
    home?: {
      team?: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
  };
  venue: {
    id?: number;
    name?: string;
  };
  status: {
    abstractGameState?: string;
    detailedState?: string;
    statusCode?: string;
  };
}

/**
 * MLB Schedule API response
 */
export interface MLBScheduleResponse {
  dates: Array<{
    date: string;
    games: Array<{
      gamePk: number;
      gameDate: string;
      status: {
        abstractGameState?: string;
        detailedState?: string;
        statusCode?: string;
      };
      teams: {
        away: {
          team: {
            id: number;
            name: string;
          };
          probablePitcher?: {
            id: number;
            fullName: string;
          };
        };
        home: {
          team: {
            id: number;
            name: string;
          };
          probablePitcher?: {
            id: number;
            fullName: string;
          };
        };
      };
      venue: {
        id: number;
        name: string;
      };
    }>;
  }>;
}

/**
 * Player's game-specific statistics
 */
export interface PlayerGameStats {
  gamePk: number;
  date: string;
  batting?: {
    hits: number;
    atBats: number;
    runs: number;
    rbi: number;
    homeRuns: number;
    strikeouts: number;
    walks: number;
    stolenBases: number;
  };
  pitching?: {
    inningsPitched: number;
    hits: number;
    runs: number;
    earnedRuns: number;
    walks: number;
    strikeouts: number;
    homeRuns: number;
    pitchCount: number;
  };
}

/**
 * Game environment data including weather and venue
 */
export interface GameEnvironmentData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: boolean;
  isOutdoor: boolean;
  humidityPercent?: number;
  pressureMb?: number;
  venueId?: number;
  venueName?: string;
  hasRoof?: boolean;
  roofStatus?: string;
  // Metadata for source tracking
  sourceTimestamp?: Date;
}

/**
 * Probable lineup information for a game
 */
export interface ProbableLineup {
  away: number[];
  home: number[];
  awayBatters?: Array<{
    id: number;
    fullName: string;
    position: string;
  }>;
  homeBatters?: Array<{
    id: number;
    fullName: string;
    position: string;
  }>;
  confirmed?: boolean;
  confidence?: number; // 0-100 confidence score for predicted lineups
  sourceTimestamp?: Date;
}

/**
 * Comprehensive game data for MLB API
 */
export interface MLBGame {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState?: string;
    detailedState?: string;
    statusCode?: string;
  };
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
  };
  venue: {
    id: number;
    name: string;
  };
  lineups?: {
    away: number[];
    home: number[];
    awayBatters?: Array<{
      id: number;
      fullName: string;
      position: string;
    }>;
    homeBatters?: Array<{
      id: number;
      fullName: string;
      position: string;
    }>;
  };
  pitchers?: {
    away?: {
      id: number;
      fullName: string;
      throwsHand?: string;
    };
    home?: {
      id: number;
      fullName: string;
      throwsHand?: string;
    };
  };
  environment?: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  teamStats?: {
    home: CoreTeamStats;
    away: CoreTeamStats;
  };
}

/**
 * Daily MLB data for DFS analysis
 */
export interface DailyMLBData {
  date: string;
  games: Array<{
    gameId: number;
    gameTime: string;
    status: {
      abstractGameState?: string;
      detailedState?: string;
      statusCode?: string;
    };
    homeTeam: {
      id: number;
      name: string;
    };
    awayTeam: {
      id: number;
      name: string;
    };
    venue: {
      id: number;
      name: string;
    };
    lineups?: {
      away: number[];
      home: number[];
      awayBatters?: Array<{
        id: number;
        fullName: string;
        position: string;
      }>;
      homeBatters?: Array<{
        id: number;
        fullName: string;
        position: string;
      }>;
    };
    pitchers?: {
      away?: {
        id: number;
        fullName: string;
        throwsHand?: string;
      };
      home?: {
        id: number;
        fullName: string;
        throwsHand?: string;
      };
    };
    environment?: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
    };
    teamStats: {
      home: TeamStats;
      away: TeamStats;
    };
    ballpark: BallparkFactors;
  }>;
  count: number;
  collectTimestamp: Date;
  seasons: string[];
}

/**
 * Team statistics for offensive performance
 */
export interface TeamStats {
  hits: number;
  walks: number;
  hitByPitch: number;
  plateAppearances: number;
  runsPerGame: number;
  rbisPerGame: number;
  sluggingPct: number;
  onBasePct: number;
  battingAvg: number;
  ops: number;
  woba: number;
  wrc: number;
  sourceTimestamp?: Date;
}
