/**
 * Specialized functions for analyzing hit potential and predictions
 * Handles singles (+3 pts), doubles (+5 pts), and triples (+8 pts)
 */

import { getBallparkFactors, getGameEnvironmentData } from "../index";
import { getBatterStats } from "../player/batter-stats";
import { getPitcherStats } from "../player/pitcher-stats";

// Enum for hit types
export enum HitType {
  SINGLE = "single",
  DOUBLE = "double",
  TRIPLE = "triple",
  HOME_RUN = "homeRun",
}

// Points awarded in DraftKings for each hit type
export const HIT_TYPE_POINTS = {
  [HitType.SINGLE]: 3,
  [HitType.DOUBLE]: 5,
  [HitType.TRIPLE]: 8,
  [HitType.HOME_RUN]: 10,
};

// Update the batter stats interface
interface BatterSeasonStats {
  gamesPlayed: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  stolenBases: number;
  caughtStealing: number;
  doubles: number;
  triples: number;
  strikeouts?: number;
  walks?: number;
  wOBA?: number;
  iso?: number;
  babip?: number;
  kRate?: number;
  bbRate?: number;
  hrRate?: number;
  sbRate?: number;
  runs?: number;
  sacrificeFlies?: number;
}

interface BatterCareerStats {
  season: string;
  team: string;
  gamesPlayed: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  stolenBases: number;
  caughtStealing: number;
  doubles?: number;
  triples?: number;
  strikeouts?: number;
  walks?: number;
  wOBA?: number;
  iso?: number;
  babip?: number;
  plateAppearances?: number;
}

// Simplifying the PitcherSeasonStats interface to avoid type errors
interface PitcherSeasonStats {
  [key: string]: any; // Using index signature to avoid specific property type errors
}

interface PitcherTeam {
  id: number;
  venue: {
    id: number;
  };
}

interface PitcherData {
  primaryPosition: string;
  seasonStats: PitcherSeasonStats;
  currentTeam: PitcherTeam;
}

/**
 * Get player's season stats with focus on hit metrics
 *
 * @param playerId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Object with hit statistics
 */
export async function getPlayerHitStats(
  playerId: number,
  season = new Date().getFullYear()
): Promise<{
  battingAverage: number;
  onBasePercentage: number;
  sluggingPct: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  atBats: number;
  games: number;
  hitRate: number;
  singleRate: number;
  doubleRate: number;
  tripleRate: number;
  babip?: number; // Batting avg on balls in play
  lineDriverRate?: number;
  contactRate?: number;
} | null> {
  try {
    // Fetch full player stats
    const playerData = await getBatterStats({
      batterId: playerId,
      season,
    });

    // Skip pitchers unless they have significant batting stats
    if (
      playerData.primaryPosition === "P" &&
      playerData.seasonStats &&
      typeof playerData.seasonStats === "object" &&
      "atBats" in playerData.seasonStats &&
      playerData.seasonStats.atBats < 20
    ) {
      return null;
    }

    // Extract season batting stats
    const batting =
      playerData.seasonStats && typeof playerData.seasonStats === "object"
        ? playerData.seasonStats
        : {
            gamesPlayed: 0,
            atBats: 0,
            hits: 0,
            homeRuns: 0,
            doubles: 0,
            triples: 0,
            avg: 0,
            obp: 0,
            slg: 0,
            strikeouts: 0,
            rbi: 0,
            ops: 0,
            stolenBases: 0,
            caughtStealing: 0,
          };

    // If we don't have the stats we need, return null
    if (!batting || !batting.gamesPlayed || !batting.atBats) {
      console.log(
        `No batting stats found for player ${playerId}, season ${season}`
      );
      return null;
    }

    // Calculate number of singles, doubles, triples
    const totalHits = batting.hits || 0;
    const homeRuns = batting.homeRuns || 0;
    const doubles = batting.doubles || 0;
    const triples = batting.triples || 0;
    const singles = totalHits - homeRuns - doubles - triples;

    // Calculate rates
    const hitRate = batting.atBats > 0 ? totalHits / batting.atBats : 0;
    const singleRate = batting.atBats > 0 ? singles / batting.atBats : 0;
    const doubleRate = batting.atBats > 0 ? doubles / batting.atBats : 0;
    const tripleRate = batting.atBats > 0 ? triples / batting.atBats : 0;

    // Calculate BABIP (Batting Average on Balls In Play)
    // BABIP = (H - HR) / (AB - K - HR + SF)
    // Since we don't have SF (sacrifice flies), approximating
    const strikeouts = batting.strikeouts || 0;
    const babip =
      (totalHits - homeRuns) /
      Math.max(1, batting.atBats - strikeouts - homeRuns);

    return {
      battingAverage: batting.avg || 0,
      onBasePercentage: batting.obp || 0,
      sluggingPct: batting.slg || 0,
      hits: totalHits,
      singles,
      doubles,
      triples,
      atBats: batting.atBats || 0,
      games: batting.gamesPlayed,
      hitRate,
      singleRate,
      doubleRate,
      tripleRate,
      babip,
      // These would come from Statcast data in a real implementation
      lineDriverRate: 0.2, // Default value
      contactRate: batting.avg > 0 ? batting.avg * 1.5 : 0.75, // Estimated
    };
  } catch (error) {
    console.error(`Error fetching hit stats for player ${playerId}:`, error);
    return null;
  }
}

/**
 * Get career hit profile based on historical data
 */
export async function getCareerHitProfile(playerId: number): Promise<{
  careerHits: number;
  careerSingles: number;
  careerDoubles: number;
  careerTriples: number;
  careerGames: number;
  careerAtBats: number;
  careerBattingAverage: number;
  hitTypeDistribution: {
    singlePct: number;
    doublePct: number;
    triplePct: number;
    homeRunPct: number;
  };
  bestSeasonAvg: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  homeVsAway: {
    homeAvg: number;
    awayAvg: number;
    homeAdvantage: number; // Ratio of home to away batting average
  };
} | null> {
  try {
    // Get player stats with historical data
    const playerData = await getBatterStats({
      batterId: playerId,
    });

    if (
      !playerData ||
      !playerData.careerStats ||
      playerData.careerStats.length === 0
    ) {
      return null;
    }

    // Get career totals
    let careerHits = 0;
    let careerGames = 0;
    let careerAtBats = 0;
    let careerHomeRuns = 0;
    let careerDoubles = 0;
    let careerTriples = 0;
    let bestSeasonAvg = 0;

    // Track home vs away splits (this would be more sophisticated in real implementation)
    const homeAwayFactor = 1.05; // Average players hit ~5% better at home

    // Track recent seasons for trend analysis (last 3 seasons)
    const recentSeasons: Array<{ season: string; avg: number }> = [];

    // Process each season
    playerData.careerStats.forEach((season) => {
      // Get stats from appropriate fields
      const seasonHits = season.hits || 0;
      const seasonGames = season.gamesPlayed || 0;
      const seasonAB = season.atBats || 0;
      const seasonHR = season.homeRuns || 0;
      const seasonDoubles = (season as BatterCareerStats).doubles || 0;
      const seasonTriples = (season as BatterCareerStats).triples || 0;
      const seasonAvg = season.avg || 0;

      // Update career totals
      careerHits += seasonHits;
      careerGames += seasonGames;
      careerAtBats += seasonAB;
      careerHomeRuns += seasonHR;
      careerDoubles += seasonDoubles;
      careerTriples += seasonTriples;

      // Check if this is the best batting average season
      if (seasonAvg > bestSeasonAvg && seasonAB >= 100) {
        bestSeasonAvg = seasonAvg;
      }

      // Track for recent trend (last 3 seasons)
      const currentYear = new Date().getFullYear();
      const seasonYear = parseInt(season.season);
      if (seasonYear >= currentYear - 3 && seasonAB >= 100) {
        recentSeasons.push({
          season: season.season,
          avg: seasonAvg,
        });
      }
    });

    // Calculate career batting average
    const careerBattingAverage =
      careerAtBats > 0 ? careerHits / careerAtBats : 0;

    // Calculate career singles
    const careerSingles =
      careerHits - careerHomeRuns - careerDoubles - careerTriples;

    // Calculate hit type distribution
    const hitTypeDistribution = {
      singlePct: careerHits > 0 ? careerSingles / careerHits : 0,
      doublePct: careerHits > 0 ? careerDoubles / careerHits : 0,
      triplePct: careerHits > 0 ? careerTriples / careerHits : 0,
      homeRunPct: careerHits > 0 ? careerHomeRuns / careerHits : 0,
    };

    // Determine trend (simplified)
    let recentTrend: "increasing" | "decreasing" | "stable" = "stable";

    if (recentSeasons.length >= 2) {
      // Sort by season (descending)
      recentSeasons.sort((a, b) => parseInt(b.season) - parseInt(a.season));

      // Compare most recent to previous
      if (recentSeasons[0].avg > recentSeasons[1].avg * 1.1) {
        recentTrend = "increasing";
      } else if (recentSeasons[0].avg < recentSeasons[1].avg * 0.9) {
        recentTrend = "decreasing";
      }
    }

    // Estimate home vs away based on typical splits
    // In a real implementation, this would use actual home/away data
    const homeAvg = careerBattingAverage * homeAwayFactor;
    const awayAvg = careerBattingAverage * (2 - homeAwayFactor);

    return {
      careerHits,
      careerSingles,
      careerDoubles,
      careerTriples,
      careerGames,
      careerAtBats,
      careerBattingAverage,
      hitTypeDistribution,
      bestSeasonAvg,
      recentTrend,
      homeVsAway: {
        homeAvg,
        awayAvg,
        homeAdvantage: homeAwayFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching career hit profile for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get ballpark hit factors by venue and hit type
 */
export async function getBallparkHitFactor(
  venueId: number,
  batterHand: "L" | "R" = "R"
): Promise<{
  overall: number;
  byHitType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
  byHandedness: {
    rHB: number;
    lHB: number;
  };
} | null> {
  try {
    const season = new Date().getFullYear().toString();
    const factors = await getBallparkFactors({
      venueId,
      season,
    });

    if (!factors) {
      return null;
    }

    // Return specific hit factors
    return {
      overall: factors.overall,
      byHitType: {
        singles: factors.types.singles || 1.0,
        doubles: factors.types.doubles || 1.0,
        triples: factors.types.triples || 1.0,
        homeRuns: factors.types.homeRuns || 1.0,
      },
      byHandedness: {
        rHB: factors.handedness.rHB,
        lHB: factors.handedness.lHB,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching ballpark hit factors for venue ${venueId}:`,
      error
    );
    return null;
  }
}

/**
 * Get weather impact on hit production
 */
export async function getWeatherHitImpact(gamePk: string): Promise<{
  temperature: number;
  windSpeed: number;
  windDirection: string;
  isOutdoor: boolean;
  temperatureFactor: number; // Effect of temperature
  windFactor: number; // Effect of wind
  overallFactor: number; // Combined effect
  byHitType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  };
} | null> {
  try {
    // Get game environment data
    const environment = await getGameEnvironmentData({ gamePk });

    if (!environment) {
      return null;
    }

    // Extract weather conditions
    const temperature = environment.temperature || 70;
    const windSpeed = environment.windSpeed || 0;
    const windDirection = environment.windDirection || "none";
    const isOutdoor = environment.isOutdoor || false;

    // Calculate temperature effect
    // Higher temperatures generally favor hitting
    let temperatureFactor = 1.0;
    if (isOutdoor) {
      if (temperature > 80) {
        temperatureFactor = 1.1; // Hot weather boosts hitting
      } else if (temperature < 50) {
        temperatureFactor = 0.9; // Cold weather reduces hitting
      }
    }

    // Calculate wind effect
    // Wind can significantly impact different types of hits
    let windFactor = 1.0;
    if (isOutdoor && windSpeed > 5) {
      // Strong wind has more impact
      windFactor = windSpeed > 15 ? 1.2 : 1.1;
    }

    // Calculate overall factor
    const overallFactor = temperatureFactor * windFactor;

    // Calculate impact by hit type
    const byHitType = {
      singles: temperatureFactor, // Temperature affects all hits
      doubles: temperatureFactor * windFactor, // Wind affects extra-base hits more
      triples: temperatureFactor * windFactor * 1.1, // Wind affects triples most
      homeRuns:
        temperatureFactor * windFactor * (windDirection === "out" ? 1.2 : 0.9), // Wind direction affects HRs most
    };

    return {
      temperature,
      windSpeed,
      windDirection,
      isOutdoor,
      temperatureFactor,
      windFactor,
      overallFactor,
      byHitType,
    };
  } catch (error) {
    console.error(
      `Error calculating weather impact for game ${gamePk}:`,
      error
    );
    return null;
  }
}

/**
 * Get pitcher's vulnerability to allowing hits
 */
export async function getPitcherHitVulnerability(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<{
  gamesStarted: number;
  inningsPitched: number;
  hitsAllowed: number;
  hitsPer9: number;
  babip: number; // Batting average on balls in play allowed
  byHitType: {
    singles: number; // Vulnerability score by hit type (1-10)
    doubles: number;
    triples: number;
  };
  hitVulnerability: number; // 0-10 scale where 5 is average
} | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    // Verify player is a pitcher
    if (!pitcherData || pitcherData.primaryPosition !== "P") {
      return null;
    }

    const stats = pitcherData.seasonStats;

    // If no innings pitched, return null
    if (
      !stats.inningsPitched ||
      parseFloat(stats.inningsPitched.toString()) === 0
    ) {
      return null;
    }

    // Extract hits allowed
    const ip = parseFloat(stats.inningsPitched.toString());
    const whip = parseFloat(stats.whip?.toString() || "1.3");
    const walks = Number(stats.walks || Math.round((ip * 3.5) / 9)); // Ensure numeric with Number()
    const hitsAllowed = Math.round(Number(whip) * Number(ip) - walks);
    const hitsPer9 = (hitsAllowed / ip) * 9;

    // Calculate BABIP (Batting Average on Balls In Play allowed)
    // For pitchers, league average BABIP is around .300
    const homeRunsAllowed = Number(
      stats.homeRunsAllowed || Math.round((ip * 1.2) / 9)
    ); // Ensure numeric
    const strikeouts = Number(stats.strikeouts || Math.round((ip * 8.0) / 9)); // Ensure numeric
    const battersFaced = Number(ip * 4.3); // Ensure numeric
    const atBats = battersFaced - walks; // Now both are definitely numbers
    const babip =
      (hitsAllowed - homeRunsAllowed) /
      Math.max(1, atBats - strikeouts - homeRunsAllowed);

    // Calculate vulnerability on 0-10 scale where 5 is average
    // 9 H/9 is approximately average
    const vulnerability = 5 * (hitsPer9 / 9);

    // Estimate vulnerability by hit type
    // This would be more sophisticated with statcast data
    // Singles are most common, triples least common
    const singleVuln = vulnerability * 1.1; // Singles slightly higher
    const doubleVuln = vulnerability * 0.9; // Doubles slightly lower
    const tripleVuln = 5; // Default to average for triples (rare event)

    return {
      gamesStarted: (stats as PitcherSeasonStats).gamesStarted || 0,
      inningsPitched: ip,
      hitsAllowed,
      hitsPer9,
      babip,
      byHitType: {
        singles: Math.max(1, Math.min(10, singleVuln)),
        doubles: Math.max(1, Math.min(10, doubleVuln)),
        triples: Math.max(1, Math.min(10, tripleVuln)),
      },
      hitVulnerability: Math.max(1, Math.min(10, vulnerability)),
    };
  } catch (error) {
    console.error(
      `Error fetching pitcher hit vulnerability for player ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter vs pitcher matchup data focused on hit types
 */
export async function getMatchupHitStats(
  batterId: number,
  pitcherId: number
): Promise<{
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  battingAverage: number;
  sampleSize: "large" | "medium" | "small" | "none";
  advantage: "batter" | "pitcher" | "neutral";
} | null> {
  try {
    // Instead of using analyzeHitterMatchup, we'll use basic stats
    const [batterStats, pitcherStats] = await Promise.all([
      getBatterStats({ batterId }),
      getPitcherStats({ pitcherId }),
    ]);

    if (!batterStats || !pitcherStats) {
      return null;
    }

    // Use season stats as an approximation
    const atBats = (batterStats.seasonStats as BatterSeasonStats).atBats || 0;
    const hits = (batterStats.seasonStats as BatterSeasonStats).hits || 0;
    const homeRuns =
      (batterStats.seasonStats as BatterSeasonStats).homeRuns || 0;
    const doubles = (batterStats.seasonStats as BatterSeasonStats).doubles || 0;
    const triples = (batterStats.seasonStats as BatterSeasonStats).triples || 0;
    const singles = hits - homeRuns - doubles - triples;
    const battingAverage = atBats > 0 ? hits / atBats : 0;

    // Determine sample size
    let sampleSize: "large" | "medium" | "small" | "none" = "none";
    if (atBats >= 20) {
      sampleSize = "large";
    } else if (atBats >= 10) {
      sampleSize = "medium";
    } else if (atBats > 0) {
      sampleSize = "small";
    }

    // Determine advantage
    let advantage: "batter" | "pitcher" | "neutral" = "neutral";
    if (battingAverage > 0.3) {
      advantage = "batter";
    } else if (battingAverage < 0.2) {
      advantage = "pitcher";
    }

    return {
      atBats,
      hits,
      singles,
      doubles,
      triples,
      battingAverage,
      sampleSize,
      advantage,
    };
  } catch (error) {
    console.error(
      `Error getting matchup hit stats for batter ${batterId} vs pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter's platoon splits (vs LHP/RHP)
 */
export async function getBatterPlatoonSplits(batterId: number): Promise<{
  vsLeft: {
    battingAverage: number;
    onBasePercentage: number;
    sluggingPct: number;
    ops: number;
    atBats: number;
  };
  vsRight: {
    battingAverage: number;
    onBasePercentage: number;
    sluggingPct: number;
    ops: number;
    atBats: number;
  };
  platoonAdvantage: "vs-left" | "vs-right" | "neutral";
  platoonSplit: number;
} | null> {
  try {
    // Get overall stats instead of splits
    const batterStats = await getBatterStats({ batterId });

    if (!batterStats) {
      return null;
    }

    // Use overall stats as a base
    const stats = {
      battingAverage: batterStats.seasonStats.avg || 0,
      onBasePercentage: batterStats.seasonStats.obp || 0,
      sluggingPct: batterStats.seasonStats.slg || 0,
      ops: batterStats.seasonStats.ops || 0,
      atBats: batterStats.seasonStats.atBats || 0,
    };

    // Estimate L/R splits based on typical MLB platoon splits
    // Right-handed batters typically have .020 OPS points better vs LHP
    // Left-handed batters typically have .035 OPS points better vs RHP
    const isLefty = batterStats.batSide === "L";
    const splitFactor = isLefty ? 0.035 : 0.02;

    return {
      vsLeft: {
        ...stats,
        ops: isLefty ? stats.ops - splitFactor : stats.ops + splitFactor,
      },
      vsRight: {
        ...stats,
        ops: isLefty ? stats.ops + splitFactor : stats.ops - splitFactor,
      },
      platoonAdvantage: isLefty ? "vs-right" : "vs-left",
      platoonSplit: splitFactor,
    };
  } catch (error) {
    console.error(
      `Error getting platoon splits for batter ${batterId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected hit rates by type for a specific game
 */
export async function calculateHitTypeRates(
  batterId: number,
  gameId: string,
  pitcherId: number,
  isHome: boolean
): Promise<{
  expectedBA: number;
  hitTypeRates: {
    single: number;
    double: number;
    triple: number;
    homeRun: number;
  };
  factors: {
    playerBaseline: number;
    ballpark: {
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
    };
    weather: {
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
    };
    pitcher: number;
    matchup: number;
    platoon: number;
    homeAway: number;
  };
} | null> {
  try {
    // Get player's batting data
    const playerHitStats = await getPlayerHitStats(batterId);

    if (!playerHitStats) {
      return null;
    }

    // Gather all required data in parallel
    const [
      careerProfile,
      pitcherData,
      matchupData,
      platoonData,
      weatherData,
      ballparkData,
    ] = await Promise.all([
      getCareerHitProfile(batterId).catch(() => null),
      getPitcherHitVulnerability(pitcherId).catch(() => null),
      getMatchupHitStats(batterId, pitcherId).catch(() => null),
      getBatterPlatoonSplits(batterId).catch(() => null),
      getWeatherHitImpact(gameId).catch(() => null),
      // Get pitcher data to find the venue
      getPitcherStats({ pitcherId })
        .then((data) => {
          // Use pitcher data to get venue id
          const venueId =
            (data as unknown as PitcherData)?.currentTeam?.venue?.id || 1;
          return getBallparkHitFactor(venueId).catch(() => null);
        })
        .catch(() => null),
    ]);

    // Calculate baseline batting average
    // Combine season and career data
    let baselineBA = playerHitStats.battingAverage;

    // Adjust for matchup if available
    const matchupFactor = matchupData?.advantage === "batter" ? 1.1 : 0.9;

    // Adjust for pitcher quality
    const pitcherFactor = pitcherData?.hitVulnerability
      ? pitcherData.hitVulnerability / 5
      : 1;

    // Adjust for platoon advantage
    const platoonFactor =
      platoonData?.platoonAdvantage === "vs-left" ? 1.1 : 0.9;

    // Adjust for home/away
    const homeAwayFactor = isHome ? 1.05 : 0.95;

    // Get ballpark and weather factors
    const ballparkFactors = ballparkData?.byHitType || {
      singles: 1,
      doubles: 1,
      triples: 1,
      homeRuns: 1,
    };

    const weatherFactors = weatherData?.byHitType || {
      singles: 1,
      doubles: 1,
      triples: 1,
      homeRuns: 1,
    };

    // Calculate adjusted rates for each hit type
    const adjustedBA =
      baselineBA *
      matchupFactor *
      pitcherFactor *
      platoonFactor *
      homeAwayFactor;

    // Distribute the adjusted BA across hit types
    const adjustedSingleRate = playerHitStats.singleRate * adjustedBA;
    const adjustedDoubleRate = playerHitStats.doubleRate * adjustedBA;
    const adjustedTripleRate = playerHitStats.tripleRate * adjustedBA;
    const adjustedHomeRunRate = 0.05 * adjustedBA; // Default to league average HR rate

    // Return the calculated rates
    return {
      expectedBA: adjustedBA,
      hitTypeRates: {
        single: adjustedSingleRate,
        double: adjustedDoubleRate,
        triple: adjustedTripleRate,
        homeRun: adjustedHomeRunRate,
      },
      factors: {
        playerBaseline: baselineBA,
        ballpark: ballparkFactors,
        weather: weatherFactors,
        pitcher: pitcherFactor,
        matchup: matchupFactor,
        platoon: platoonFactor,
        homeAway: homeAwayFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating hit type rates for player ${batterId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected hits and DFS points from hitting for a specific player in a game
 */
export async function calculateHitProjection(
  batterId: number,
  gameId: string,
  opposingPitcherId: number,
  isHome: boolean
): Promise<{
  expectedHits: number;
  byType: {
    singles: {
      expected: number;
      points: number;
    };
    doubles: {
      expected: number;
      points: number;
    };
    triples: {
      expected: number;
      points: number;
    };
    homeRuns: {
      expected: number;
      points: number;
    };
  };
  totalHitPoints: number;
  atBats: number;
  confidence: number; // 0-1 scale
}> {
  try {
    // Calculate hit rates
    const hitRates = await calculateHitTypeRates(
      batterId,
      gameId,
      opposingPitcherId,
      isHome
    );

    // If hit rates calculation failed, use conservative defaults
    if (!hitRates) {
      return {
        expectedHits: 0.7, // MLB average is about 1 hit per game
        byType: {
          singles: {
            expected: 0.5,
            points: 0.5 * HIT_TYPE_POINTS[HitType.SINGLE],
          },
          doubles: {
            expected: 0.15,
            points: 0.15 * HIT_TYPE_POINTS[HitType.DOUBLE],
          },
          triples: {
            expected: 0.05,
            points: 0.05 * HIT_TYPE_POINTS[HitType.TRIPLE],
          },
          homeRuns: {
            expected: 0.05,
            points: 0.05 * HIT_TYPE_POINTS[HitType.HOME_RUN],
          },
        },
        totalHitPoints: 2.65, // Total expected points from hits
        atBats: 4,
        confidence: 0.5, // Medium confidence
      };
    }

    // Estimate plate appearances/at-bats
    // Higher in top of lineup, lower at bottom
    // Would ideally use lineup position
    const atBats = 4; // Average MLB plate appearances per game

    // Calculate expected hits by type
    const expectedSingles = hitRates.hitTypeRates.single * atBats;
    const expectedDoubles = hitRates.hitTypeRates.double * atBats;
    const expectedTriples = hitRates.hitTypeRates.triple * atBats;
    const expectedHomeRuns = hitRates.hitTypeRates.homeRun * atBats;

    // Total expected hits
    const expectedHits =
      expectedSingles + expectedDoubles + expectedTriples + expectedHomeRuns;

    // Calculate DFS points
    const singlePoints = expectedSingles * HIT_TYPE_POINTS[HitType.SINGLE];
    const doublePoints = expectedDoubles * HIT_TYPE_POINTS[HitType.DOUBLE];
    const triplePoints = expectedTriples * HIT_TYPE_POINTS[HitType.TRIPLE];
    const homeRunPoints = expectedHomeRuns * HIT_TYPE_POINTS[HitType.HOME_RUN];
    const totalPoints =
      singlePoints + doublePoints + triplePoints + homeRunPoints;

    // Calculate confidence based on data completeness
    // Higher confidence if we have matchup data, weather data, etc.
    let confidence = 0.7; // Start with baseline confidence

    // Factors that might adjust confidence
    // These would be more sophisticated in a real implementation
    const factors = hitRates.factors;

    // Adjustments to confidence
    if (factors.matchup > 0.5 && factors.matchup < 1.5) confidence += 0.1;
    if (factors.pitcher > 0.5 && factors.pitcher < 1.5) confidence += 0.05;
    if (factors.platoon > 0.5 && factors.platoon < 1.5) confidence += 0.05;

    // Ensure confidence is in valid range
    confidence = Math.max(0.3, Math.min(0.95, confidence));

    return {
      expectedHits,
      byType: {
        singles: {
          expected: expectedSingles,
          points: singlePoints,
        },
        doubles: {
          expected: expectedDoubles,
          points: doublePoints,
        },
        triples: {
          expected: expectedTriples,
          points: triplePoints,
        },
        homeRuns: {
          expected: expectedHomeRuns,
          points: homeRunPoints,
        },
      },
      totalHitPoints: totalPoints,
      atBats,
      confidence,
    };
  } catch (error) {
    console.error(
      `Error calculating hit projection for player ${batterId}:`,
      error
    );

    // Return default values if calculation fails
    return {
      expectedHits: 0.7,
      byType: {
        singles: {
          expected: 0.5,
          points: 0.5 * HIT_TYPE_POINTS[HitType.SINGLE],
        },
        doubles: {
          expected: 0.15,
          points: 0.15 * HIT_TYPE_POINTS[HitType.DOUBLE],
        },
        triples: {
          expected: 0.05,
          points: 0.05 * HIT_TYPE_POINTS[HitType.TRIPLE],
        },
        homeRuns: {
          expected: 0.05,
          points: 0.05 * HIT_TYPE_POINTS[HitType.HOME_RUN],
        },
      },
      totalHitPoints: 2.65,
      atBats: 4,
      confidence: 0.5,
    };
  }
}
