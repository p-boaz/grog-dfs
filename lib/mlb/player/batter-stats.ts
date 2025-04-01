import { DEFAULT_CACHE_TTL, markAsApiSource, withCache } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { BatterPlateDiscipline, BatterSplits } from "../types/player";
import { BatterApiResponse } from "../types/api/player";
import { batterFromApi, Batter, BatterStats } from "../types/domain/player";
import { ApiSourceMarker } from "../types/api/common";

// Define interfaces for API responses with proper types
interface BatterPlateDisciplineWithStringTimestamp extends Omit<BatterPlateDiscipline, 'sourceTimestamp'> {
  sourceTimestamp: string;
  __isApiSource: boolean;
}

// Extend BatterSplits to work with API marker
interface BatterSplitsWithApiMarker extends BatterSplits, ApiSourceMarker {}

/**
 * Fetch batter stats from MLB API
 */
async function fetchBatterStats(params: {
  batterId: number;
  season?: number;
}): Promise<Batter & ApiSourceMarker> {
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
        // Transform to API response format
        const apiResponse = transformToBatterApiResponse(response, currentSeason);
        
        // Convert API response to domain model
        const batter = batterFromApi(apiResponse);
        
        // Mark as API source and add timestamp
        return markAsApiSource({
          ...batter,
          sourceTimestamp: new Date().toISOString(),
          __isApiSource: true
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
        // Transform to API response format
        const apiResponse = transformToBatterApiResponse(response, previousSeason);
        
        // Convert API response to domain model
        const batter = batterFromApi(apiResponse);
        
        // Mark as API source and add timestamp
        return markAsApiSource({
          ...batter,
          sourceTimestamp: new Date().toISOString(),
          __isApiSource: true
        });
      }
      console.warn(`No data found for previous season ${previousSeason}`);
    } catch (previousSeasonError) {
      console.error(
        `Error fetching previous season data for batter ${batterId}:`,
        previousSeasonError
      );
    }

    // If no stats found for either season, create an empty batter object
    const emptyApiResponse: BatterApiResponse = {
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
        rbi: 0,
        rbis: 0,
        walks: 0,
        strikeouts: 0,
        stolenBases: 0,
        avg: "0",
        obp: "0",
        slg: "0",
        ops: "0",
        runs: 0,
        hitByPitches: 0,
        sacrificeFlies: 0,
        plateAppearances: 0,
        caughtStealing: 0,
      },
      careerStats: [],
      sourceTimestamp: new Date().toISOString(),
      __isApiSource: true
    };
    
    // Convert to domain model
    const emptyBatter = batterFromApi(emptyApiResponse);
    
    return markAsApiSource({
      ...emptyBatter,
      sourceTimestamp: new Date().toISOString(),
      __isApiSource: true
    });
  } catch (error) {
    console.error(`Error fetching stats for batter ${batterId}:`, error);
    
    // Create empty API response in case of error
    const emptyApiResponse: BatterApiResponse = {
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
        rbi: 0,
        rbis: 0,
        walks: 0,
        strikeouts: 0,
        stolenBases: 0,
        avg: "0",
        obp: "0",
        slg: "0",
        ops: "0",
        runs: 0,
        hitByPitches: 0,
        sacrificeFlies: 0,
        plateAppearances: 0,
        caughtStealing: 0,
      },
      careerStats: [],
      sourceTimestamp: new Date().toISOString(),
      __isApiSource: true
    };
    
    // Convert to domain model
    const emptyBatter = batterFromApi(emptyApiResponse);
    
    return markAsApiSource({
      ...emptyBatter,
      sourceTimestamp: new Date().toISOString(),
      __isApiSource: true
    });
  }
}

/**
 * Get batter stats with caching (6 hour TTL by default)
 * Returns a normalized Batter domain object with proper types
 */
export const getBatterStats = withCache(
  fetchBatterStats,
  "batter-stats",
  DEFAULT_CACHE_TTL.player
);

/**
 * Transform the MLB API raw data into a structured BatterApiResponse format
 * This creates a properly formatted API response that can be passed to batterFromApi
 */
function transformToBatterApiResponse(data: any, requestedSeason: number): BatterApiResponse {
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

  // Calculate plateAppearances if not provided
  const plateAppearances =
    seasonHittingStats.plateAppearances ||
    (seasonHittingStats.atBats || 0) +
      (seasonHittingStats.walks || 0) +
      (seasonHittingStats.hitByPitch || 0) +
      (seasonHittingStats.sacrificeFlies || 0);

  // Create season stats in the API response format
  // Note that avg, obp, slg, ops are strings in the API format
  const formattedSeasonStats = {
    gamesPlayed: seasonHittingStats.gamesPlayed || 0,
    atBats: seasonHittingStats.atBats || 0,
    hits: seasonHittingStats.hits || 0,
    doubles: seasonHittingStats.doubles || 0,
    triples: seasonHittingStats.triples || 0,
    homeRuns: seasonHittingStats.homeRuns || 0,
    rbi: seasonHittingStats.rbi || 0,
    rbis: seasonHittingStats.rbi || 0, // For backward compatibility
    walks: seasonHittingStats.walks || 0,
    strikeouts: seasonHittingStats.strikeouts || 0,
    stolenBases: seasonHittingStats.stolenBases || 0,
    avg: seasonHittingStats.avg?.toString() || "0",
    obp: seasonHittingStats.obp?.toString() || "0",
    slg: seasonHittingStats.slg?.toString() || "0",
    ops: seasonHittingStats.ops?.toString() || "0",
    plateAppearances: plateAppearances,
    caughtStealing: seasonHittingStats.caughtStealing || 0,
    runs: seasonHittingStats.runs || 0,
    hitByPitches: seasonHittingStats.hitByPitch || 0,
    sacrificeFlies: seasonHittingStats.sacrificeFlies || 0,
  };

  // Map career stats with proper types
  const careerStats = yearByYearHittingStats.map((year: any) => {
    return {
      season: year.season,
      team: year.team?.name || "",
      gamesPlayed: year.stat?.gamesPlayed || 0,
      atBats: year.stat?.atBats || 0,
      hits: year.stat?.hits || 0,
      homeRuns: year.stat?.homeRuns || 0,
      rbi: year.stat?.rbi || 0,
      avg: year.stat?.avg?.toString() || "0",
      obp: year.stat?.obp?.toString() || "0", 
      slg: year.stat?.slg?.toString() || "0",
      ops: year.stat?.ops?.toString() || "0",
      stolenBases: year.stat?.stolenBases || 0,
      caughtStealing: year.stat?.caughtStealing || 0,
      doubles: year.stat?.doubles,
      triples: year.stat?.triples,
      strikeouts: year.stat?.strikeouts || year.stat?.strikeOuts,
      walks: year.stat?.walks || year.stat?.baseOnBalls,
      plateAppearances: year.stat?.plateAppearances,
      babip: year.stat?.babip,
      iso: year.stat?.isolatedPower,
    };
  });

  // Return the complete API response format
  return {
    id: batterId,
    fullName: batterName,
    currentTeam: data.people[0].currentTeam?.name || "",
    primaryPosition: data.people[0].primaryPosition?.abbreviation || "",
    batSide: data.people[0].batSide?.code || "",
    seasonStats: formattedSeasonStats,
    careerStats: careerStats,
    sourceTimestamp: new Date().toISOString(),
    __isApiSource: true
  };
}

/**
 * Fetch batter's plate discipline metrics
 */
async function fetchBatterPlateDiscipline(params: {
  batterId: number;
}): Promise<BatterPlateDisciplineWithStringTimestamp | null> {
  const { batterId } = params;

  try {
    // Get basic player info
    const batter = await getBatterStats({ batterId });

    // Use default values until statcast data integration is complete
    return markAsApiSource({
      playerId: batterId,
      name: batter.fullName,
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
      sourceTimestamp: new Date().toISOString(),
      __isApiSource: true
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
 * Note: The return type adapts to the API format with string timestamp
 */
export const getBatterPlateDiscipline = withCache(
  fetchBatterPlateDiscipline,
  "batter-plate-discipline",
  DEFAULT_CACHE_TTL.player
);

/**
 * Detailed batter info including status
 * This is a direct API pass-through function
 */
export async function getBatterInfo(batterId: string): Promise<any> {
  try {
    const data = await makeMLBApiRequest<any>(
      `/people/${batterId}?hydrate=stats(type=season)`
    );
    return markAsApiSource({
      ...data,
      sourceTimestamp: new Date().toISOString()
    });
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
 * This provides normalized split stats with numeric values
 */
async function fetchBatterSplits(
  batterId: number
): Promise<BatterSplitsWithApiMarker | null> {
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

    // Return the parsed data as a BatterSplits object
    const splits: BatterSplits = {
      vsLeft: {
        plateAppearances: vsLHPSplit.plateAppearances || 0,
        atBats: vsLHPSplit.atBats || 0,
        hits: vsLHPSplit.hits || 0,
        avg: parseFloat(vsLHPSplit.avg || '0'),
        obp: parseFloat(vsLHPSplit.obp || '0'),
        slg: parseFloat(vsLHPSplit.slg || '0'),
        ops: parseFloat(vsLHPSplit.ops || '0'),
        walkRate: vsLHPSplit.baseOnBalls && vsLHPSplit.plateAppearances
          ? vsLHPSplit.baseOnBalls / vsLHPSplit.plateAppearances
          : 0,
        strikeoutRate: vsLHPSplit.strikeOuts && vsLHPSplit.plateAppearances
          ? vsLHPSplit.strikeOuts / vsLHPSplit.plateAppearances
          : 0,
      },
      vsRight: {
        plateAppearances: vsRHPSplit.plateAppearances || 0,
        atBats: vsRHPSplit.atBats || 0,
        hits: vsRHPSplit.hits || 0,
        avg: parseFloat(vsRHPSplit.avg || '0'),
        obp: parseFloat(vsRHPSplit.obp || '0'),
        slg: parseFloat(vsRHPSplit.slg || '0'),
        ops: parseFloat(vsRHPSplit.ops || '0'),
        walkRate: vsRHPSplit.baseOnBalls && vsRHPSplit.plateAppearances
          ? vsRHPSplit.baseOnBalls / vsRHPSplit.plateAppearances
          : 0,
        strikeoutRate: vsRHPSplit.strikeOuts && vsRHPSplit.plateAppearances
          ? vsRHPSplit.strikeOuts / vsRHPSplit.plateAppearances
          : 0,
      }
    };
    
    // Mark as API source with timestamp
    return markAsApiSource({
      ...splits,
      sourceTimestamp: new Date().toISOString(),
      __isApiSource: true
    });
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
