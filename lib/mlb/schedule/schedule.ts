import { withCache, DEFAULT_CACHE_TTL, markAsApiSource } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { MLBScheduleResponse } from "../core/types";

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
 * Get MLB schedule with caching
 */
export const getSchedule = withCache(
  fetchSchedule,
  "schedule",
  DEFAULT_CACHE_TTL.schedule
);

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
  const schedule = await getSchedule({ date });

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

/**
 * Get team statistics
 */
export async function getTeamStats(
  teamId: number,
  season: number = new Date().getFullYear()
): Promise<any> {
  try {
    // First try to get team info to validate the team ID
    const teamInfo = await makeMLBApiRequest<any>(
      `/teams/${teamId}?season=${season}`
    );

    if (!teamInfo || !teamInfo.teams || teamInfo.teams.length === 0) {
      console.error(`Invalid team ID ${teamId} for season ${season}`);
      return null;
    }

    // Now get the stats
    const response = await makeMLBApiRequest<any>(
      `/teams/${teamId}/stats?season=${season}&group=hitting,pitching&sportId=1&stats=yearByYear`
    );

    // Log raw response for debugging
    console.log(
      `Raw team stats API response for team ${teamId} (${teamInfo.teams[0].name}), season ${season}:`,
      JSON.stringify(response, null, 2)
    );

    if (!response.stats?.[0]?.splits) {
      console.log(
        `No team stats found for team ${teamId} (${teamInfo.teams[0].name}), season ${season}`
      );
      return null;
    }

    // Find the stats for the requested season
    const seasonStats = response.stats
      .map((group: any) => ({
        group: group.group,
        stats: group.splits.find(
          (split: any) => split.season === season.toString()
        )?.stat,
      }))
      .filter((stat: any) => stat.stats);

    if (seasonStats.length === 0) {
      console.log(`No stats found for season ${season}`);
      return null;
    }

    return markAsApiSource(
      transformTeamStats(
        { stats: seasonStats },
        teamId,
        season.toString(),
        teamInfo.teams[0].name
      )
    );
  } catch (error) {
    console.error(`Error fetching team stats for ID ${teamId}:`, error);
    return null;
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
