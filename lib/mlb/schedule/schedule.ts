import { markAsApiSource } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import type { BallparkFactors, MLBScheduleResponse } from "../core/types";

/**
 * Fetch MLB schedule data for a specific date
 * Raw fetch function for caching
 */
async function fetchSchedule(params: {
  date: string;
}): Promise<MLBScheduleResponse> {
  const { date } = params;
  const data = await makeMLBApiRequest<MLBScheduleResponse>(
    `/schedule?sportId=1&date=${date}&hydrate=probablePitcher(note)`,
    "V1"
  );

  // Don't throw an error if there are no games, just return the empty schedule
  // This allows for dates with no scheduled games
  if (!data.dates?.[0]?.games) {
    console.log(`No games found for date: ${date}`);
  }

  return markAsApiSource(data);
}

/**
 * Get MLB schedule for a given date
 */
export async function getSchedule(date: string): Promise<MLBScheduleResponse> {
  try {
    const response = await makeMLBApiRequest<MLBScheduleResponse>(
      `/schedule/games?sportId=1&date=${date}&hydrate=team,venue,probablePitcher`
    );

    return response;
  } catch (error) {
    console.warn(`Failed to get schedule for date ${date}:`, error);
    return {
      dates: [],
    };
  }
}

/**
 * Find a specific game by date and team IDs
 * @param params Object containing date and team IDs to match
 * @returns Specific game or null if not found
 */
export async function findGameByTeams({
  date,
  homeTeamId,
  awayTeamId,
}: {
  date: string;
  homeTeamId?: number;
  awayTeamId?: number;
}): Promise<any> {
  // Get schedule for this date
  const schedule = await getSchedule(date);

  if (
    !schedule.dates ||
    schedule.dates.length === 0 ||
    !schedule.dates[0].games
  ) {
    return null;
  }

  // Find game matching the team criteria
  const games = schedule.dates[0].games;

  // If both home and away teams specified, match exactly
  if (homeTeamId && awayTeamId) {
    return (
      games.find(
        (g: any) =>
          g.teams.home.team.id === homeTeamId &&
          g.teams.away.team.id === awayTeamId
      ) || null
    );
  }

  // If only one team specified, find game where it's either home or away
  if (homeTeamId) {
    return games.find((g: any) => g.teams.home.team.id === homeTeamId) || null;
  }

  if (awayTeamId) {
    return games.find((g: any) => g.teams.away.team.id === awayTeamId) || null;
  }

  return null;
}

/**
 * Fetch team roster and player status updates
 * @param params Object containing teamId
 */
export async function getTeamRoster(params: { teamId: string }): Promise<any> {
  const { teamId } = params;

  // Ensure teamId is a string and validate it's a number
  if (!teamId || isNaN(Number(teamId))) {
    throw new Error(`Invalid team ID: ${teamId}`);
  }

  const data = await makeMLBApiRequest<any>(
    `/teams/${teamId}/roster?hydrate=person(stats(type=season))`,
    "V1"
  );
  return markAsApiSource(data);
}

interface MLBTeamStatsResponse {
  stats: Array<{
    splits: Array<{
      stat: Record<string, any>;
    }>;
  }>;
}

interface TeamStats {
  hitting: Record<string, any>;
  pitching: Record<string, any>;
  name?: string;
}

/**
 * Get team statistics
 */
export async function getTeamStats(
  teamId: number,
  season: number
): Promise<TeamStats> {
  try {
    const response = await makeMLBApiRequest<MLBTeamStatsResponse>(
      `/teams/${teamId}/stats?season=${season}&group=hitting,pitching&sportId=1&stats=season`
    );

    // Get team details to include name
    const teamDetails = await makeMLBApiRequest<any>(
      `/teams/${teamId}?season=${season}`
    );

    const teamName = teamDetails?.teams?.[0]?.name || `Team ${teamId}`;

    return {
      hitting: response.stats[0]?.splits[0]?.stat || {},
      pitching: response.stats[1]?.splits[0]?.stat || {},
      name: teamName,
    };
  } catch (error) {
    console.warn(
      `Failed to get team stats for team ${teamId}, season ${season}:`,
      error
    );
    return {
      hitting: {},
      pitching: {},
      name: `Team ${teamId}`,
    };
  }
}

function transformTeamStats(
  data: any,
  teamId: number,
  season: string,
  teamName: string
): any {
  const hittingStats =
    data.stats.find((s: any) => s.group === "hitting")?.stats || {};
  const pitchingStats =
    data.stats.find((s: any) => s.group === "pitching")?.stats || {};

  return {
    id: teamId,
    name: teamName,
    season,
    stats: {
      gamesPlayed: hittingStats.gamesPlayed || 0,
      wins: pitchingStats.wins || 0,
      losses: pitchingStats.losses || 0,
      runsScored: hittingStats.runs || 0,
      runsAllowed: pitchingStats.runs || 0,
      avg: hittingStats.avg || ".000",
      obp: hittingStats.obp || ".000",
      slg: hittingStats.slg || ".000",
      ops: hittingStats.ops || ".000",
      era: pitchingStats.era || "0.00",
      whip: pitchingStats.whip || "0.00",
      strikeouts: pitchingStats.strikeOuts || 0,
      strikeoutRate:
        ((pitchingStats.strikeOuts || 0) /
          (pitchingStats.inningsPitched || 1)) *
        9,
    },
  };
}

/**
 * Get ballpark factors for a venue
 */
export async function getBallparkFactors(
  venueId: number
): Promise<BallparkFactors> {
  try {
    // For now, return default factors
    return {
      overall: 1,
      handedness: {
        rHB: 1,
        lHB: 1,
      },
      types: {
        singles: 1,
        doubles: 1,
        triples: 1,
        homeRuns: 1,
        runs: 1,
      },
      venueId,
    };
  } catch (error) {
    console.warn(`Failed to get ballpark factors for venue ${venueId}:`, error);
    return {
      overall: 1,
      handedness: {
        rHB: 1,
        lHB: 1,
      },
      types: {
        singles: 1,
        doubles: 1,
        triples: 1,
        homeRuns: 1,
        runs: 1,
      },
      venueId,
    };
  }
}
