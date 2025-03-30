/**
 * Specialized functions for analyzing home run potential and predictions
 */

import { getBatterStats } from "../player/batter-stats";
import { getPitcherStats } from "../player/pitcher-stats";
import { getGameEnvironmentData, getBallparkFactors } from "../index";

/**
 * Get player's season stats with focus on home run metrics
 *
 * @param playerId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Object with home run statistics
 */
export async function getPlayerHomeRunStats(
  playerId: number,
  season = new Date().getFullYear()
): Promise<{
  battingAverage: number;
  homeRuns: number;
  atBats: number;
  games: number;
  homeRunRate: number;
  sluggingPct: number;
  iso: number; // Isolated power (SLG - AVG)
  flyBallRate?: number;
  hrPerFlyBall?: number;
  pullPct?: number;
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
      playerData.seasonStats.atBats < 20
    ) {
      return null;
    }

    // Extract season batting stats
    const batting = playerData.seasonStats;

    // If we don't have the stats we need, return null
    if (!batting || !batting.gamesPlayed || !batting.atBats) {
      console.log(
        `No batting stats found for player ${playerId}, season ${season}`
      );
      return null;
    }

    // Calculate rates
    const homeRunRate =
      batting.atBats > 0 ? batting.homeRuns / batting.atBats : 0;
    const perGameRate =
      batting.gamesPlayed > 0 ? batting.homeRuns / batting.gamesPlayed : 0;

    // Calculate isolated power (SLG - AVG)
    const iso = batting.slg - batting.avg;

    return {
      battingAverage: batting.avg || 0,
      homeRuns: batting.homeRuns || 0,
      atBats: batting.atBats || 0,
      games: batting.gamesPlayed,
      homeRunRate,
      sluggingPct: batting.slg || 0,
      iso,
      // These would come from Statcast data in a real implementation
      flyBallRate: 0.35, // Default value
      hrPerFlyBall: homeRunRate / 0.35, // Estimated
      pullPct: 0.4, // Default value
    };
  } catch (error) {
    console.error(
      `Error fetching home run stats for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get career home run profile based on historical data
 */
export async function getCareerHomeRunProfile(playerId: number): Promise<{
  careerHomeRuns: number;
  careerGames: number;
  careerAtBats: number;
  careerRate: number; // HR per game
  careerHrPerAB: number; // HR per at bat
  bestSeasonHR: number;
  bestSeasonHrRate: number; // Best HR per game in any season
  recentTrend: "increasing" | "decreasing" | "stable";
  homeVsAway: {
    homeHrRate: number;
    awayHrRate: number;
    homeFieldAdvantage: number; // Ratio of home to away HR rates
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
    let careerHomeRuns = 0;
    let careerGames = 0;
    let careerAtBats = 0;
    let bestSeasonHR = 0;
    let bestSeasonHrRate = 0;

    // Track home vs away splits (this would be more sophisticated in real implementation)
    const homeAwayFactor = 1.15; // Average players hit ~15% more HRs at home

    // Track recent seasons for trend analysis (last 3 seasons)
    const recentSeasons: Array<{ season: string; hrRate: number }> = [];

    // Process each season
    playerData.careerStats.forEach((season) => {
      // Get HR from appropriate field
      const seasonHR = season.homeRuns || 0;
      const seasonGames = season.gamesPlayed || 0;
      const seasonAB = season.atBats || 0;

      // Update career totals
      careerHomeRuns += seasonHR;
      careerGames += seasonGames;
      careerAtBats += seasonAB;

      // Check if this is the best HR season
      const seasonRate = seasonGames > 0 ? seasonHR / seasonGames : 0;
      if (seasonHR > bestSeasonHR) {
        bestSeasonHR = seasonHR;
      }

      if (seasonRate > bestSeasonHrRate && seasonGames >= 20) {
        bestSeasonHrRate = seasonRate;
      }

      // Track for recent trend (last 3 seasons)
      const currentYear = new Date().getFullYear();
      const seasonYear = parseInt(season.season);
      if (seasonYear >= currentYear - 3 && seasonGames >= 20) {
        recentSeasons.push({
          season: season.season,
          hrRate: seasonRate,
        });
      }
    });

    // Calculate career rates
    const careerRate = careerGames > 0 ? careerHomeRuns / careerGames : 0;
    const careerHrPerAB = careerAtBats > 0 ? careerHomeRuns / careerAtBats : 0;

    // Determine trend (simplified)
    let recentTrend: "increasing" | "decreasing" | "stable" = "stable";

    if (recentSeasons.length >= 2) {
      // Sort by season (descending)
      recentSeasons.sort((a, b) => parseInt(b.season) - parseInt(a.season));

      // Compare most recent to previous
      if (recentSeasons[0].hrRate > recentSeasons[1].hrRate * 1.2) {
        recentTrend = "increasing";
      } else if (recentSeasons[0].hrRate < recentSeasons[1].hrRate * 0.8) {
        recentTrend = "decreasing";
      }
    }

    // Estimate home vs away based on typical splits
    // In a real implementation, this would use actual home/away data
    const homeHrRate = careerRate * homeAwayFactor;
    const awayHrRate = careerRate * (2 - homeAwayFactor);

    return {
      careerHomeRuns,
      careerGames,
      careerAtBats,
      careerRate,
      careerHrPerAB,
      bestSeasonHR,
      bestSeasonHrRate,
      recentTrend,
      homeVsAway: {
        homeHrRate,
        awayHrRate,
        homeFieldAdvantage: homeAwayFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching career home run profile for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get ballpark home run factors by venue and handedness
 */
export async function getBallparkHomeRunFactor(
  venueId: number,
  batterHand: "L" | "R" = "R"
): Promise<{
  overall: number;
  homeRunFactor: number;
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

    // Return specific home run factors
    return {
      overall: factors.overall,
      homeRunFactor: factors.types.homeRuns,
      byHandedness: {
        rHB: factors.handedness.rHB,
        lHB: factors.handedness.lHB,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching ballpark home run factors for venue ${venueId}:`,
      error
    );
    return null;
  }
}

/**
 * Get weather impact on home run potential
 */
export async function getWeatherHomeRunImpact(gamePk: string): Promise<{
  temperature: number;
  windSpeed: number;
  windDirection: string;
  isOutdoor: boolean;
  temperatureFactor: number; // Effect of temperature
  windFactor: number; // Effect of wind
  overallFactor: number; // Combined effect
} | null> {
  try {
    const gameEnvironment = await getGameEnvironmentData({
      gamePk,
    });

    if (!gameEnvironment) {
      return null;
    }

    // If indoor, factors are neutral
    if (!gameEnvironment.isOutdoor) {
      return {
        temperature: gameEnvironment.temperature,
        windSpeed: gameEnvironment.windSpeed,
        windDirection: gameEnvironment.windDirection,
        isOutdoor: false,
        temperatureFactor: 1.0,
        windFactor: 1.0,
        overallFactor: 1.0,
      };
    }

    // Calculate temperature factor (warmer = more HRs)
    // ~1% increase per 10°F above 70°F
    const tempBaseline = 70;
    const tempFactor =
      gameEnvironment.temperature > tempBaseline
        ? 1 + ((gameEnvironment.temperature - tempBaseline) / 10) * 0.01
        : 1 - ((tempBaseline - gameEnvironment.temperature) / 10) * 0.01;

    // Calculate wind factor
    let windFactor = 1.0;
    const windSpeed = gameEnvironment.windSpeed;

    // Analyze wind direction's effect on HRs
    // This is a simplified model - real model would account for stadium orientation
    if (windSpeed >= 5) {
      const windDir = gameEnvironment.windDirection.toLowerCase();

      if (windDir.includes("out") || windDir.includes("to center")) {
        // Blowing out - increases HRs
        windFactor = 1 + windSpeed / 20;
      } else if (windDir.includes("in") || windDir.includes("from center")) {
        // Blowing in - decreases HRs
        windFactor = 1 - windSpeed / 25;
      } else if (windDir.includes("cross")) {
        // Crosswind - minimal effect
        windFactor = 1;
      }
    }

    // Calculate overall factor (clamped to reasonable ranges)
    let overallFactor = tempFactor * windFactor;
    overallFactor = Math.max(0.7, Math.min(1.3, overallFactor));

    return {
      temperature: gameEnvironment.temperature,
      windSpeed: gameEnvironment.windSpeed,
      windDirection: gameEnvironment.windDirection,
      isOutdoor: true,
      temperatureFactor: tempFactor,
      windFactor: windFactor,
      overallFactor: overallFactor,
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
 * Get pitcher's vulnerability to home runs
 */
export async function getPitcherHomeRunVulnerability(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<{
  gamesStarted: number;
  inningsPitched: number;
  homeRunsAllowed: number;
  hrPer9: number;
  flyBallPct?: number;
  hrPerFlyBall?: number;
  homeRunVulnerability: number; // 0-10 scale where 5 is average
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

    // Extract HR allowed (not directly provided in the basic stats)
    // In a real implementation, this would use actual HR allowed data
    // Approximating using typical MLB ratios
    const ip = parseFloat(stats.inningsPitched.toString());
    const era = stats.era || 4.5;

    // Rough estimate: ~10-15% of earned runs come from HRs
    // Average MLB HR/9 is around 1.2-1.3
    const estimatedHrPer9 = (parseFloat(stats.era.toString()) / 4.5) * 1.25;
    const homeRunsAllowed = Math.round((estimatedHrPer9 * ip) / 9);

    // Calculate vulnerability on 0-10 scale where 5 is average
    // 1.25 HR/9 is approximately average
    const vulnerability = 5 * (estimatedHrPer9 / 1.25);

    return {
      gamesStarted:
        typeof stats.gamesPlayed === "number" ? stats.gamesPlayed : 0,
      inningsPitched: ip,
      homeRunsAllowed,
      hrPer9: estimatedHrPer9,
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
 * Estimate home run probability for a player in a specific game
 * This function integrates all the individual components to create a comprehensive projection
 */
export async function estimateHomeRunProbability(
  playerId: number,
  gameId: string,
  venueId: number,
  isHome: boolean,
  opposingPitcherId: number,
  season = new Date().getFullYear()
): Promise<{
  baseHrRate: number;
  adjustedHrRate: number;
  gameHrProbability: number;
  expectedHrValue: number; // DK points value (HR = 10 points)
  factors: {
    playerBaseline: number;
    playerTrend: number;
    ballpark: number;
    weather: number;
    pitcher: number;
    homeAway: number;
  };
}> {
  try {
    // Get all relevant data in parallel
    const [
      seasonStats,
      careerProfile,
      ballparkFactor,
      weatherImpact,
      pitcherVulnerability,
    ] = await Promise.all([
      getPlayerHomeRunStats(playerId, season).catch(() => null),
      getCareerHomeRunProfile(playerId).catch(() => null),
      getBallparkHomeRunFactor(venueId).catch(() => null),
      getWeatherHomeRunImpact(gameId).catch(() => null),
      getPitcherHomeRunVulnerability(opposingPitcherId, season).catch(
        () => null
      ),
    ]);

    // Default values if any data source fails
    const hrRate = seasonStats?.homeRunRate || 0.025; // Default to MLB average (~25 HR per 1000 AB)
    const careerHrRate = careerProfile?.careerHrPerAB || hrRate;

    // Base values - this is our starting point
    const baseHrRate = (hrRate + careerHrRate) / 2;

    // Calculate factor adjustments
    const playerTrendFactor = careerProfile
      ? careerProfile.recentTrend === "increasing"
        ? 1.1
        : careerProfile.recentTrend === "decreasing"
        ? 0.9
        : 1.0
      : 1.0;

    const parkFactor = ballparkFactor?.homeRunFactor || 1.0;

    const weatherFactor = weatherImpact?.overallFactor || 1.0;

    const pitcherFactor = pitcherVulnerability
      ? pitcherVulnerability.homeRunVulnerability / 5.0
      : 1.0;

    const homeAwayFactor = isHome
      ? careerProfile?.homeVsAway.homeFieldAdvantage || 1.15
      : 1.0 / (careerProfile?.homeVsAway.homeFieldAdvantage || 1.15);

    // Combine all factors
    const combinedFactor =
      playerTrendFactor *
      parkFactor *
      weatherFactor *
      pitcherFactor *
      homeAwayFactor;

    // Calculate adjusted HR rate (per at-bat)
    // Apply a dampening factor to avoid extreme values
    const rawAdjustedRate = baseHrRate * combinedFactor;
    const adjustedHrRate = (rawAdjustedRate + baseHrRate) / 2;

    // Calculate game HR probability
    // Average player gets ~4 at-bats per game
    const atBatsPerGame = 4;
    const gameHrProbability = 1 - Math.pow(1 - adjustedHrRate, atBatsPerGame);

    // Calculate expected DFS points value (Home Run = 10 points in DK)
    const expectedHrValue = gameHrProbability * 10;

    return {
      baseHrRate,
      adjustedHrRate,
      gameHrProbability,
      expectedHrValue,
      factors: {
        playerBaseline: baseHrRate,
        playerTrend: playerTrendFactor,
        ballpark: parkFactor,
        weather: weatherFactor,
        pitcher: pitcherFactor,
        homeAway: homeAwayFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error estimating home run probability for player ${playerId}:`,
      error
    );

    // Return conservative default values if calculation fails
    return {
      baseHrRate: 0.025,
      adjustedHrRate: 0.025,
      gameHrProbability: 0.1,
      expectedHrValue: 1.0,
      factors: {
        playerBaseline: 1.0,
        playerTrend: 1.0,
        ballpark: 1.0,
        weather: 1.0,
        pitcher: 1.0,
        homeAway: 1.0,
      },
    };
  }
}
