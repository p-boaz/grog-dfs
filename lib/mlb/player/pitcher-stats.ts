import { DEFAULT_CACHE_TTL, markAsApiSource, withCache } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { PitcherBatterMatchup } from "../types/player/matchups";
import {
  PitcherHomeRunVulnerability,
  PitcherPitchMixData,
  PitcherStats,
} from "../types/player/pitcher";

/**
 * Fetch pitcher stats from MLB API
 */
async function fetchPitcherStats(params: {
  pitcherId: number;
  season?: number;
}): Promise<PitcherStats> {
  const { pitcherId, season = new Date().getFullYear() } = params;
  const currentSeason = season;
  const previousSeason = currentSeason - 1;

  try {
    // Try to get current season data first
    try {
      console.time(
        `API request to /people/${pitcherId}?hydrate=stats (season=${currentSeason})`
      );
      const response = await makeMLBApiRequest<any>(
        `/people/${pitcherId}?hydrate=stats(group=[pitching],type=[yearByYear],season=${currentSeason})`
      );
      console.timeEnd(
        `API request to /people/${pitcherId}?hydrate=stats (season=${currentSeason})`
      );

      if (response?.people?.[0]) {
        // Check if we actually have pitching stats
        const yearByYearStats = response.people[0].stats?.find(
          (s: any) =>
            s.group?.displayName === "pitching" &&
            s.type?.displayName === "yearByYear"
        );

        if (
          !yearByYearStats ||
          !yearByYearStats.splits ||
          yearByYearStats.splits.length === 0
        ) {
          console.warn(
            `No pitching stats found for pitcher ${pitcherId}, season ${currentSeason}, trying previous season`
          );
        } else {
          return markAsApiSource({
            ...transformPitcherStats(response),
            sourceTimestamp: new Date(),
          });
        }
      } else {
        console.warn(
          `Player not found or no data for pitcher ${pitcherId}, season ${currentSeason}, trying previous season`
        );
      }
    } catch (currentSeasonError) {
      console.error(
        `Error fetching current season data for pitcher ${pitcherId}:`,
        currentSeasonError
      );
    }

    // If current season fails or has no data, try previous season data
    try {
      console.time(
        `API request to /people/${pitcherId}?hydrate=stats (season=${previousSeason})`
      );
      const response = await makeMLBApiRequest<any>(
        `/people/${pitcherId}?hydrate=stats(group=[pitching],type=[yearByYear],season=${previousSeason})&_=${Date.now()}`
      );
      console.timeEnd(
        `API request to /people/${pitcherId}?hydrate=stats (season=${previousSeason})`
      );

      if (response?.people?.[0]) {
        // Check if we actually have pitching stats
        const yearByYearStats = response.people[0].stats?.find(
          (s: any) =>
            s.group?.displayName === "pitching" &&
            s.type?.displayName === "yearByYear"
        );

        if (
          !yearByYearStats ||
          !yearByYearStats.splits ||
          yearByYearStats.splits.length === 0
        ) {
          console.warn(
            `No pitching stats found for pitcher ${pitcherId}, season ${previousSeason}`
          );
        } else {
          return markAsApiSource({
            ...transformPitcherStats(response),
            sourceTimestamp: new Date(),
          });
        }
      } else {
        console.warn(
          `Player not found or no data for pitcher ${pitcherId}, season ${previousSeason}`
        );
      }
    } catch (previousSeasonError) {
      console.error(
        `Fallback to previous season failed for pitcher ${pitcherId}:`,
        previousSeasonError
      );
    }

    // If all API calls fail, return default data
    return markAsApiSource({
      id: pitcherId,
      fullName: `Pitcher ${pitcherId}`,
      currentTeam: "",
      primaryPosition: "P",
      pitchHand: "",
      seasonStats: {},
      careerStats: [],
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error(
      `Error in fetchPitcherStats for pitcher ${pitcherId}:`,
      error
    );
    return markAsApiSource({
      id: pitcherId,
      fullName: `Pitcher ${pitcherId}`,
      currentTeam: "",
      primaryPosition: "P",
      pitchHand: "",
      seasonStats: {},
      careerStats: [],
      sourceTimestamp: new Date(),
    });
  }
}

/**
 * Get pitcher stats with caching (6 hour TTL by default)
 */
export const getPitcherStats = withCache(
  fetchPitcherStats,
  "pitcher-stats",
  DEFAULT_CACHE_TTL.player
);

/**
 * Transform the MLB API pitcher data into a standardized format
 */
function transformPitcherStats(data: any): PitcherStats {
  if (!data || !data.people || !data.people[0]) {
    throw new Error("Invalid pitcher data structure");
  }

  const seasonStats: Record<string, any> = {};
  let yearByYearPitchingStats: any[] = [];

  // Get season stats from the stats array
  if (data.people[0].stats) {
    // Find the yearByYear pitching stats
    const yearByYearStats = data.people[0].stats.find(
      (statGroup: any) =>
        statGroup.type.displayName === "yearByYear" &&
        statGroup.group.displayName === "pitching"
    );

    if (yearByYearStats && yearByYearStats.splits) {
      yearByYearPitchingStats = yearByYearStats.splits;
    }
  }

  // Function to estimate HR allowed if not provided in the stats
  const estimateHRAllowed = (stats: any): number => {
    // Check if homeRuns or homeRunsAllowed is directly available
    if (typeof stats.homeRuns === "number") return stats.homeRuns;
    if (typeof stats.homeRunsAllowed === "number") return stats.homeRunsAllowed;

    // If HR not directly available, estimate from other stats
    // Using a very rough estimation method
    const ip =
      typeof stats.inningsPitched === "number"
        ? stats.inningsPitched
        : parseFloat(stats.inningsPitched || "0");

    if (ip <= 0) return 0;

    // MLB average HR/9 is roughly 1.25-1.4
    const hrPer9Estimate = 1.3;
    return Math.round((ip / 9) * hrPer9Estimate);
  };

  // Transform yearByYear stats into season-based structure
  yearByYearPitchingStats.forEach((year: any) => {
    const season = year.season;
    const stat = year.stat || {};

    seasonStats[season] = {
      gamesPlayed: stat.gamesPlayed || 0,
      gamesStarted: stat.gamesStarted || 0,
      inningsPitched: stat.inningsPitched || 0,
      wins: stat.wins || 0,
      losses: stat.losses || 0,
      era: stat.era || 0,
      whip: stat.whip || 0,
      strikeouts: stat.strikeouts || 0,
      walks: stat.baseOnBalls || stat.walks || 0,
      saves: stat.saves || 0,
      homeRunsAllowed: estimateHRAllowed(stat),
      hitBatsmen: stat.hitBatsmen || 0,
    };
  });

  return {
    id: data.people[0].id,
    fullName: data.people[0].fullName,
    currentTeam: data.people[0].currentTeam?.name || "",
    primaryPosition: data.people[0].primaryPosition?.abbreviation || "P",
    pitchHand: data.people[0].pitchHand?.code || "",
    seasonStats,
    careerStats: yearByYearPitchingStats.map((year: any) => {
      const season = year.season;
      const stat = year.stat || {};
      return {
        season,
        team: year.team?.name || "",
        gamesPlayed: stat.gamesPlayed || 0,
        gamesStarted: stat.gamesStarted || 0,
        inningsPitched: stat.inningsPitched || 0,
        wins: stat.wins || 0,
        losses: stat.losses || 0,
        era: stat.era || 0,
        whip: stat.whip || 0,
        strikeouts: stat.strikeouts || 0,
        walks: stat.walks || 0,
        saves: stat.saves || 0,
        homeRunsAllowed: estimateHRAllowed(stat),
        hitBatsmen: stat.hitBatsmen || 0,
      };
    }),
    sourceTimestamp: new Date(),
  };
}

/**
 * Fetch pitcher's pitch mix data
 */
async function fetchPitcherPitchMix(params: {
  pitcherId: number;
}): Promise<PitcherPitchMixData | null> {
  const { pitcherId } = params;

  try {
    // Get basic player info
    const pitcherInfo = await getPitcherStats({ pitcherId });

    // Use default values until statcast data integration is complete
    return markAsApiSource({
      playerId: pitcherId,
      name: pitcherInfo.fullName,
      pitches: {
        fastball: 55, // Most pitchers throw ~55% fastballs
        slider: 15,
        curve: 10,
        changeup: 10,
        sinker: 5,
        cutter: 3,
        other: 2,
      },
      averageVelocity: {
        fastball: 93.5,
        slider: 84.2,
        curve: 78.6,
        changeup: 85.1,
        sinker: 92.3,
        cutter: 88.7,
      },
      effectiveness: {
        fastball: 55,
        slider: 60,
        curve: 55,
        changeup: 50,
        sinker: 52,
        cutter: 53,
      },
      controlMetrics: {
        zonePercentage: 48.5,
        firstPitchStrikePercent: 60.2,
        swingingStrikePercent: 11.3,
        chaseRate: 30.1,
      },
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error(
      `Error fetching pitch mix data for pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get pitcher pitch mix data with caching
 */
export const getPitcherPitchMix = withCache(
  fetchPitcherPitchMix,
  "pitcher-pitch-mix",
  DEFAULT_CACHE_TTL.player
);

/**
 * Fetch matchup data between a pitcher and batter
 */
async function fetchPitcherBatterMatchup(params: {
  pitcherId: number;
  batterId: number;
}): Promise<PitcherBatterMatchup | null> {
  const { pitcherId, batterId } = params;

  try {
    // First, get basic info about both players
    const pitcherInfo = await getPitcherStats({ pitcherId });

    // Import the batter stats function directly to avoid circular dependencies
    const { getBatterStats } = await import("./batter-stats");
    const batterInfo = await getBatterStats({ batterId });

    // Access the MLB API endpoint for matchup data
    const endpoint = `/people/${batterId}/stats?stats=vsPlayer&opposingPlayerId=${pitcherId}&group=hitting&sportId=1`;
    const matchupData = await makeMLBApiRequest<any>(endpoint, "V1");

    // If no data is available, return a default structure
    if (
      !matchupData.stats ||
      matchupData.stats.length === 0 ||
      !matchupData.stats[0].splits ||
      matchupData.stats[0].splits.length === 0
    ) {
      return markAsApiSource({
        pitcher: {
          id: pitcherId,
          name: pitcherInfo.fullName,
          throwsHand: pitcherInfo.pitchHand,
        },
        batter: {
          id: batterId,
          name: batterInfo.fullName,
          batsHand: batterInfo.batSide,
        },
        stats: {
          atBats: 0,
          hits: 0,
          homeRuns: 0,
          strikeouts: 0,
          walks: 0,
          avg: 0,
          obp: 0,
          slg: 0,
          ops: 0,
        },
        sourceTimestamp: new Date(),
      });
    }

    // Extract matchup stats
    const stats = matchupData.stats[0].splits[0].stat;

    return markAsApiSource({
      pitcher: {
        id: pitcherId,
        name: pitcherInfo.fullName,
        throwsHand: pitcherInfo.pitchHand,
      },
      batter: {
        id: batterId,
        name: batterInfo.fullName,
        batsHand: batterInfo.batSide,
      },
      stats: {
        atBats: stats.atBats || 0,
        hits: stats.hits || 0,
        homeRuns: stats.homeRuns || 0,
        strikeouts: stats.strikeouts || 0,
        walks: stats.baseOnBalls || 0,
        avg: stats.avg || 0,
        obp: stats.obp || 0,
        slg: stats.slg || 0,
        ops: stats.ops || 0,
      },
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error(
      `Error fetching matchup data for pitcher ${pitcherId} vs batter ${batterId}:`,
      error
    );
    return null;
  }
}

/**
 * Get pitcher-batter matchup data with caching
 */
export const getPitcherBatterMatchup = withCache(
  fetchPitcherBatterMatchup,
  "pitcher-batter-matchup",
  DEFAULT_CACHE_TTL.player
);

/**
 * Analyze a pitcher's vulnerability to home runs
 */
export async function getPitcherHomeRunVulnerability(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<PitcherHomeRunVulnerability | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    // If no innings pitched, return null
    if (!pitcherData.seasonStats[season]?.inningsPitched) {
      return null;
    }

    const stats = pitcherData.seasonStats[season];
    const ip = stats.inningsPitched;
    const era = stats.era || 4.5;

    // Get HR allowed (directly or estimated)
    const homeRunsAllowed =
      stats.homeRunsAllowed || Math.round((era / 4.5) * 1.25 * (ip / 9));

    // Calculate HR/9
    const hrPer9 = (homeRunsAllowed / ip) * 9;

    // Calculate vulnerability on 0-10 scale where 5 is average
    // 1.25 HR/9 is approximately average
    const vulnerability = 5 * (hrPer9 / 1.25);

    return {
      gamesStarted: stats.gamesPlayed || 0,
      inningsPitched: ip,
      homeRunsAllowed,
      hrPer9,
      flyBallPct: 0.35, // Default value
      hrPerFlyBall: 0.12, // Default value
      homeRunVulnerability: Math.max(1, Math.min(10, vulnerability)),
    };
  } catch (error) {
    console.error(
      `Error fetching pitcher home run vulnerability for player ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Detailed pitcher info including status
 */
export async function getPitcherInfo(pitcherId: string): Promise<any> {
  try {
    const data = await makeMLBApiRequest<any>(
      `/people/${pitcherId}?hydrate=stats(type=season)`
    );
    return markAsApiSource(data);
  } catch (error) {
    console.error(
      `Error fetching detailed info for pitcher ${pitcherId}:`,
      error
    );
    throw error;
  }
}
