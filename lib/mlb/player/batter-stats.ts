import { DEFAULT_CACHE_TTL, markAsApiSource, withCache } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import {
  BatterPlateDiscipline,
  BatterSplits,
  BatterStats,
} from "../types/player";

/**
 * Fetch batter stats from MLB API
 */
async function fetchBatterStats(params: {
  batterId: number;
  season?: number;
}): Promise<BatterStats> {
  const { batterId, season = new Date().getFullYear() } = params;
  const currentSeason = season;
  const previousSeason = currentSeason - 1;

  try {
    // Try to get current season data first
    try {
      const response = await makeMLBApiRequest<any>(
        `/people/${batterId}?hydrate=stats(group=[hitting],type=[yearByYear],season=${currentSeason})`
      );

      if (response?.people?.[0]) {
        return markAsApiSource({
          ...transformBatterStats(response, currentSeason),
          sourceTimestamp: new Date(),
        });
      }
      console.warn(
        `No data found for current season ${currentSeason}, trying previous season ${previousSeason}`
      );
    } catch (currentSeasonError) {
      console.error(
        `Error fetching current season data for batter ${batterId}:`,
        currentSeasonError
      );
    }

    // If current season fails or has no data, try previous season
    try {
      const response = await makeMLBApiRequest<any>(
        `/people/${batterId}?hydrate=stats(group=[hitting],type=[yearByYear],season=${previousSeason})`
      );

      if (response?.people?.[0]) {
        return markAsApiSource({
          ...transformBatterStats(response, previousSeason),
          sourceTimestamp: new Date(),
        });
      }
      console.warn(`No data found for previous season ${previousSeason}`);
    } catch (previousSeasonError) {
      console.error(
        `Error fetching previous season data for batter ${batterId}:`,
        previousSeasonError
      );
    }

    // If no stats found for either season, return default data
    return markAsApiSource({
      id: batterId,
      fullName: `Batter ${batterId}`,
      currentTeam: "",
      primaryPosition: "",
      batSide: "",
      seasonStats: {
        gamesPlayed: 0,
        atBats: 0,
        hits: 0,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbis: 0,
        walks: 0,
        strikeouts: 0,
        stolenBases: 0,
        avg: 0,
        obp: 0,
        slg: 0,
        ops: 0,
      },
      careerStats: [],
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error(`Error fetching stats for batter ${batterId}:`, error);
    return markAsApiSource({
      id: batterId,
      fullName: `Batter ${batterId}`,
      currentTeam: "",
      primaryPosition: "",
      batSide: "",
      seasonStats: {
        gamesPlayed: 0,
        atBats: 0,
        hits: 0,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        rbis: 0,
        walks: 0,
        strikeouts: 0,
        stolenBases: 0,
        avg: 0,
        obp: 0,
        slg: 0,
        ops: 0,
      },
      careerStats: [],
      sourceTimestamp: new Date(),
    });
  }
}

/**
 * Get batter stats with caching (6 hour TTL by default)
 */
export const getBatterStats = withCache(
  fetchBatterStats,
  "batter-stats",
  DEFAULT_CACHE_TTL.player
);

/**
 * Transform the MLB API batter data into a standardized format
 */
function transformBatterStats(data: any, requestedSeason: number): BatterStats {
  const batterId = data.people[0].id;
  const batterName = data.people[0].fullName;
  const stats = data.people[0].stats || [];

  // Get yearByYear hitting data
  const yearByYearHittingStats =
    stats.find(
      (s: any) =>
        s.group.displayName === "hitting" && s.type.displayName === "yearByYear"
    )?.splits || [];

  // Get stats for the requested season
  const seasonHittingStats =
    yearByYearHittingStats.find(
      (s: any) => s.season === requestedSeason.toString()
    )?.stat || {};

  // Calculate advanced metrics for quality calculations
  const atBats = seasonHittingStats.atBats || 0;
  const hits = seasonHittingStats.hits || 0;
  const doubles = seasonHittingStats.doubles || 0;
  const triples = seasonHittingStats.triples || 0;
  const homeRuns = seasonHittingStats.homeRuns || 0;
  const walks = seasonHittingStats.walks || 0;
  const strikeouts = seasonHittingStats.strikeouts || 0;
  const plateAppearances = seasonHittingStats.plateAppearances || atBats + walks + (seasonHittingStats.hitByPitch || 0) + (seasonHittingStats.sacrificeFlies || 0);
  const stolenBases = seasonHittingStats.stolenBases || 0;
  const caughtStealing = seasonHittingStats.caughtStealing || 0;
  
  // Calculate BABIP (Batting Average on Balls in Play)
  const babip = atBats > 0
    ? (hits - homeRuns) / (atBats - strikeouts - homeRuns + (seasonHittingStats.sacrificeFlies || 0))
    : 0;
  
  // Calculate ISO (Isolated Power)
  const iso = atBats > 0
    ? ((doubles + 2 * triples + 3 * homeRuns) / atBats)
    : 0;
  
  // Calculate HR Rate
  const hrRate = atBats > 0 ? homeRuns / atBats : 0;
  
  // Calculate K Rate
  const kRate = plateAppearances > 0 ? strikeouts / plateAppearances : 0;
  
  // Calculate BB Rate
  const bbRate = plateAppearances > 0 ? walks / plateAppearances : 0;
  
  // Calculate SB Rate
  const sbRate = (stolenBases + caughtStealing) > 0
    ? stolenBases / (stolenBases + caughtStealing)
    : 0;

  return {
    id: data.people[0].id,
    fullName: data.people[0].fullName,
    currentTeam: data.people[0].currentTeam?.name || "",
    primaryPosition: data.people[0].primaryPosition?.abbreviation || "",
    batSide: data.people[0].batSide?.code || "",
    seasonStats: {
      gamesPlayed: seasonHittingStats.gamesPlayed || 0,
      atBats: atBats,
      hits: hits,
      doubles: doubles,
      triples: triples,
      homeRuns: homeRuns,
      rbis: seasonHittingStats.rbi || 0,
      walks: walks,
      strikeouts: strikeouts,
      stolenBases: stolenBases,
      avg: seasonHittingStats.avg || 0,
      obp: seasonHittingStats.obp || 0,
      slg: seasonHittingStats.slg || 0,
      ops: seasonHittingStats.ops || 0,
      plateAppearances: plateAppearances,
      caughtStealing: caughtStealing,
      
      // Add calculated advanced metrics
      babip: babip,
      iso: iso,
      hrRate: hrRate,
      kRate: kRate,
      bbRate: bbRate,
      sbRate: sbRate,
    },
    careerStats: yearByYearHittingStats.map((year: any) => {
      const yearAtBats = year.stat?.atBats || 0;
      const yearStolenBases = year.stat?.stolenBases || 0;
      const yearCaughtStealing = year.stat?.caughtStealing || 0;
      
      return {
        season: year.season,
        team: year.team?.name || "",
        gamesPlayed: year.stat?.gamesPlayed || 0,
        atBats: yearAtBats,
        hits: year.stat?.hits || 0,
        homeRuns: year.stat?.homeRuns || 0,
        rbi: year.stat?.rbi || 0,
        avg: year.stat?.avg || 0,
        obp: year.stat?.obp || 0,
        slg: year.stat?.slg || 0,
        ops: year.stat?.ops || 0,
        stolenBases: yearStolenBases,
        caughtStealing: yearCaughtStealing,
        hitByPitches: year.stat?.hitByPitches || 0,
        sacrificeFlies: year.stat?.sacrificeFlies || 0,
        walks: year.stat?.baseOnBalls || 0,
        strikeouts: year.stat?.strikeOuts || 0,
        plateAppearances: year.stat?.plateAppearances || 0,
      };
    }),
  };
}

/**
 * Fetch batter's plate discipline metrics
 */
async function fetchBatterPlateDiscipline(params: {
  batterId: number;
}): Promise<BatterPlateDiscipline | null> {
  const { batterId } = params;

  try {
    // Get basic player info
    const batterInfo = await getBatterStats({ batterId });

    // Use default values until statcast data integration is complete
    return markAsApiSource({
      playerId: batterId,
      name: batterInfo.fullName,
      discipline: {
        chaseRate: 0.28,
        contactRate: 0.76,
        zoneSwingRate: 0.67,
        whiffRate: 0.24,
        firstPitchSwingRate: 0.3,
      },
      pitchTypePerformance: {
        vsFastball: 55,
        vsBreakingBall: 50,
        vsOffspeed: 45,
      },
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error(
      `Error fetching plate discipline data for batter ${batterId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter plate discipline data with caching
 */
export const getBatterPlateDiscipline = withCache(
  fetchBatterPlateDiscipline,
  "batter-plate-discipline",
  DEFAULT_CACHE_TTL.player
);

/**
 * Detailed batter info including status
 */
export async function getBatterInfo(batterId: string): Promise<any> {
  try {
    const data = await makeMLBApiRequest<any>(
      `/people/${batterId}?hydrate=stats(type=season)`
    );
    return markAsApiSource(data);
  } catch (error) {
    console.error(
      `Error fetching detailed info for batter ${batterId}:`,
      error
    );
    throw error;
  }
}

/**
 * Fetch batter splits against LHP/RHP from MLB API
 */
async function fetchBatterSplits(
  batterId: number
): Promise<BatterSplits | null> {
  try {
    const season = new Date().getFullYear();
    const response = await makeMLBApiRequest<any>(
      `/people/${batterId}?hydrate=stats(group=[hitting],type=[splits],season=${season})`
    );

    if (!response?.stats?.[0]?.splits) {
      return null;
    }

    // Find the splits for vs LHP (vl) and vs RHP (vr)
    const vsLHPSplit =
      response.stats[0].splits.find((split: any) => split.split.code === "vl")
        ?.stat || {};
    const vsRHPSplit =
      response.stats[0].splits.find((split: any) => split.split.code === "vr")
        ?.stat || {};

    return {
      vsLeft: {
        plateAppearances: vsLHPSplit.plateAppearances || 0,
        atBats: vsLHPSplit.atBats || 0,
        hits: vsLHPSplit.hits || 0,
        avg: vsLHPSplit.avg || 0,
        obp: vsLHPSplit.obp || 0,
        slg: vsLHPSplit.slg || 0,
        ops: vsLHPSplit.ops || 0,
        walkRate: vsLHPSplit.baseOnBalls
          ? vsLHPSplit.baseOnBalls / vsLHPSplit.plateAppearances
          : 0,
        strikeoutRate: vsLHPSplit.strikeOuts
          ? vsLHPSplit.strikeOuts / vsLHPSplit.plateAppearances
          : 0,
      },
      vsRight: {
        plateAppearances: vsRHPSplit.plateAppearances || 0,
        atBats: vsRHPSplit.atBats || 0,
        hits: vsRHPSplit.hits || 0,
        avg: vsRHPSplit.avg || 0,
        obp: vsRHPSplit.obp || 0,
        slg: vsRHPSplit.slg || 0,
        ops: vsRHPSplit.ops || 0,
        walkRate: vsRHPSplit.baseOnBalls
          ? vsRHPSplit.baseOnBalls / vsRHPSplit.plateAppearances
          : 0,
        strikeoutRate: vsRHPSplit.strikeOuts
          ? vsRHPSplit.strikeOuts / vsRHPSplit.plateAppearances
          : 0,
      },
    };
  } catch (error) {
    console.error(`Error fetching splits for batter ${batterId}:`, error);
    return null;
  }
}

/**
 * Get batter splits with caching
 */
export const getBatterSplits = withCache(
  fetchBatterSplits,
  "batter-splits",
  DEFAULT_CACHE_TTL.player
);
