/**
 * MLB Game Domain Types
 * 
 * These types build on the raw API types to provide a more structured
 * and validated representation of game data for the application.
 */

import { GameEnvironmentApiResponse, GameFeedApiResponse, GamePlays, 
         ScheduleApiResponse } from '../api/game';

/**
 * Game status values
 */
export enum GameStatus {
  SCHEDULED = "Scheduled",
  PREGAME = "Pre-Game",
  WARMUP = "Warmup",
  LIVE = "Live",
  IN_PROGRESS = "In Progress",
  DELAYED = "Delayed",
  POSTPONED = "Postponed",
  SUSPENDED = "Suspended",
  FINAL = "Final",
  CANCELLED = "Cancelled",
  UNKNOWN = "Unknown"
}

/**
 * Standardized game information
 */
export interface Game {
  id: number;            // MLB Game ID
  date: string;          // ISO date (YYYY-MM-DD)
  startTime: string;     // ISO datetime
  status: GameStatus;    // Game status
  venue: {
    id: number;
    name: string;
  };
  teams: {
    away: {
      id: number;
      name: string;
      abbreviation?: string;
      score?: number;
      record?: { wins: number; losses: number; };
    };
    home: {
      id: number;
      name: string;
      abbreviation?: string;
      score?: number;
      record?: { wins: number; losses: number; };
    };
  };
  probablePitchers?: {
    away?: { id: number; name: string; };
    home?: { id: number; name: string; };
  };
  weather?: GameEnvironment;
  isComplete: boolean;
}

/**
 * Game environment information
 */
export interface GameEnvironment {
  temperature: number;   // Temperature in Fahrenheit
  windSpeed: number;     // Wind speed in mph
  windDirection: string; // Wind direction description
  precipitation: boolean;// Precipitation expected/occurring
  isOutdoor: boolean;    // Whether venue is outdoors
  venue: {
    id: number;
    name: string;
  };
  roof: {
    hasRoof: boolean;    // Whether venue has a roof
    status?: string;     // Roof status if present (open/closed)
  };
}

/**
 * Ballpark factors affecting game play
 */
export interface BallparkFactors {
  overall: number;       // Overall park factor (1.0 is neutral)
  types: {
    homeRuns: number;    // Home run factor
    singles: number;     // Singles factor
    doubles: number;     // Doubles factor
    triples: number;     // Triples factor
    runs: number;        // Runs factor
  };
  handedness: {
    rHB: number;         // Right-handed batter factor
    lHB: number;         // Left-handed batter factor
  };
}

/**
 * Detailed game box score information
 */
export interface GameBoxScore {
  id: number;
  status: GameStatus;
  inning: number;
  isTopInning: boolean;
  outs: number;
  homeScore: number;
  awayScore: number;
  innings: {
    num: number;
    home: number;
    away: number;
  }[];
  homeStats: {
    runs: number;
    hits: number;
    errors: number;
    leftOnBase: number;
  };
  awayStats: {
    runs: number;
    hits: number;
    errors: number;
    leftOnBase: number;
  };
}

/**
 * Convert a raw schedule API response to a list of normalized Game objects
 */
export function gamesFromSchedule(schedule: ScheduleApiResponse): Game[] {
  if (!schedule.dates || schedule.dates.length === 0) {
    return [];
  }
  
  // Process all dates in the schedule
  return schedule.dates.flatMap(date => {
    return date.games.map(game => {
      
      // Determine game status
      let status = GameStatus.UNKNOWN;
      
      if (game.status) {
        const abstractState = game.status.abstractGameState;
        const detailedState = game.status.detailedState;
        
        if (abstractState === 'Final') {
          status = GameStatus.FINAL;
        } else if (abstractState === 'Live') {
          status = GameStatus.LIVE;
        } else if (abstractState === 'Preview') {
          if (detailedState === 'Scheduled') {
            status = GameStatus.SCHEDULED;
          } else if (detailedState === 'Pre-Game') {
            status = GameStatus.PREGAME;
          } else if (detailedState === 'Warmup') {
            status = GameStatus.WARMUP;
          } else if (detailedState === 'Delayed') {
            status = GameStatus.DELAYED;
          } else if (detailedState === 'Postponed') {
            status = GameStatus.POSTPONED;
          }
        }
      }
      
      return {
        id: game.gamePk,
        date: date.date,
        startTime: game.gameDate,
        status,
        venue: {
          id: game.venue?.id,
          name: game.venue?.name,
        },
        teams: {
          away: {
            id: game.teams.away.team.id,
            name: game.teams.away.team.name,
            score: game.teams.away.score,
            record: game.teams.away.leagueRecord ? {
              wins: game.teams.away.leagueRecord.wins,
              losses: game.teams.away.leagueRecord.losses,
            } : undefined,
          },
          home: {
            id: game.teams.home.team.id,
            name: game.teams.home.team.name,
            score: game.teams.home.score,
            record: game.teams.home.leagueRecord ? {
              wins: game.teams.home.leagueRecord.wins,
              losses: game.teams.home.leagueRecord.losses,
            } : undefined,
          },
        },
        probablePitchers: {
          away: game.teams.away?.probablePitcher ? {
            id: game.teams.away.probablePitcher.id,
            name: game.teams.away.probablePitcher.fullName,
          } : undefined,
          home: game.teams.home?.probablePitcher ? {
            id: game.teams.home.probablePitcher.id,
            name: game.teams.home.probablePitcher.fullName,
          } : undefined,
        } as {
          away?: { id: number; name: string };
          home?: { id: number; name: string };
        },
        isComplete: status === GameStatus.FINAL,
      };
    });
  });
}

/**
 * Convert a raw game environment API response to a normalized GameEnvironment object
 */
export function environmentFromApi(env: GameEnvironmentApiResponse): GameEnvironment {
  return {
    temperature: env.temperature,
    windSpeed: env.windSpeed,
    windDirection: env.windDirection,
    precipitation: env.precipitation,
    isOutdoor: env.isOutdoor,
    venue: {
      id: env.venueId,
      name: env.venueName,
    },
    roof: {
      hasRoof: env.hasRoof,
    },
  };
}

/**
 * Convert a raw game feed API response to a normalized GameBoxScore object
 */
export function boxScoreFromGameFeed(feed: GameFeedApiResponse): GameBoxScore {
  // Get game status
  let status = GameStatus.UNKNOWN;
  const gameData = feed.gameData;
  
  // Status might be in gameData.game.status or gameData.status
  const gameStatus = gameData?.game?.status || gameData?.status;
  
  if (gameStatus) {
    const abstractState = gameStatus.abstractGameState;
    const detailedState = gameStatus.detailedState;
    
    if (abstractState === 'Final') {
      status = GameStatus.FINAL;
    } else if (abstractState === 'Live') {
      status = GameStatus.LIVE;
    } else if (abstractState === 'Preview') {
      if (detailedState === 'Scheduled') {
        status = GameStatus.SCHEDULED;
      } else if (detailedState === 'Pre-Game') {
        status = GameStatus.PREGAME;
      } else if (detailedState === 'Warmup') {
        status = GameStatus.WARMUP;
      }
    }
  }
  
  // Get linescore for inning details
  const linescore = feed.liveData?.linescore;
  const innings = linescore?.innings || [];
  
  // Format innings data
  const inningsData = innings.map(inning => ({
    num: inning.num,
    home: inning.home?.runs || 0,
    away: inning.away?.runs || 0,
  }));
  
  return {
    id: feed.gamePk,
    status,
    inning: linescore?.currentInning || 0,
    isTopInning: linescore?.isTopInning || false,
    outs: linescore?.outs || 0,
    homeScore: linescore?.teams?.home?.runs || 0,
    awayScore: linescore?.teams?.away?.runs || 0,
    innings: inningsData,
    homeStats: {
      runs: linescore?.teams?.home?.runs || 0,
      hits: linescore?.teams?.home?.hits || 0,
      errors: linescore?.teams?.home?.errors || 0,
      leftOnBase: linescore?.teams?.home?.leftOnBase || 0,
    },
    awayStats: {
      runs: linescore?.teams?.away?.runs || 0,
      hits: linescore?.teams?.away?.hits || 0,
      errors: linescore?.teams?.away?.errors || 0,
      leftOnBase: linescore?.teams?.away?.leftOnBase || 0,
    },
  };
}

/**
 * Type guard to check if an object is a valid Game
 */
export function isGame(obj: any): obj is Game {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.date === 'string' &&
    typeof obj.teams === 'object' &&
    typeof obj.teams.home === 'object' &&
    typeof obj.teams.away === 'object';
}

/**
 * Type guard to check if an object is a valid GameEnvironment
 */
export function isGameEnvironment(obj: any): obj is GameEnvironment {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.temperature === 'number' &&
    typeof obj.windSpeed === 'number' &&
    typeof obj.isOutdoor === 'boolean' &&
    typeof obj.venue === 'object';
}