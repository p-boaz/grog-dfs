/**
 * Specialized functions for analyzing home run potential and predictions
 */

import { getBallparkFactors, getGameEnvironmentData } from "../../index";
import {
  estimateBarrelRate,
  estimateExitVelocity,
  getEnhancedBatterData,
} from "../../services/batter-data-service";
import { getEnhancedPitcherData } from "../../services/pitcher-data-service";
import { HomeRunAnalysis } from "../../types/analysis/events";
import { PitcherHomeRunVulnerability } from "../../types/player/pitcher";

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
  barrelRate?: number;
  exitVelocity?: number;
  sweetSpotPct?: number;
  hardHitPct?: number;
} | null> {
  try {
    // Fetch enhanced player data including Statcast metrics
    const playerData = await getEnhancedBatterData(playerId, season);

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

    // Get quality metrics from Statcast or estimate if not available
    const barrelRate =
      playerData.qualityMetrics?.barrelRate || estimateBarrelRate(batting);
    const exitVelocity =
      playerData.qualityMetrics?.exitVelocity || estimateExitVelocity(batting);
    const sweetSpotPct = playerData.qualityMetrics?.sweetSpotRate;
    const hardHitPct = playerData.qualityMetrics?.hardHitRate;

    // Default fly ball rate if not available (can be estimated from statcast in a real implementation)
    const flyBallRate = 0.35; // Default value
    const hrPerFlyBall = homeRunRate / flyBallRate; // Estimated
    const pullPct = 0.4; // Default value

    return {
      battingAverage: batting.avg || 0,
      homeRuns: batting.homeRuns || 0,
      atBats: batting.atBats || 0,
      games: batting.gamesPlayed,
      homeRunRate,
      sluggingPct: batting.slg || 0,
      iso,
      flyBallRate,
      hrPerFlyBall,
      pullPct,
      barrelRate,
      exitVelocity,
      sweetSpotPct,
      hardHitPct,
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
    // Get enhanced player data with Statcast metrics
    const playerData = await getEnhancedBatterData(playerId);

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
 * Get pitcher's susceptibility to home runs
 */
export async function getPitcherHomeRunVulnerability(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<
  | (PitcherHomeRunVulnerability & {
      vsLHB?: number;
      vsRHB?: number;
      parkFactor?: number;
      hardHitPercent?: number;
      barrelRate?: number;
    })
  | null
> {
  try {
    // Fetch enhanced pitcher data including Statcast metrics
    const pitcherData = await getEnhancedPitcherData(pitcherId, season);

    if (!pitcherData) {
      return null;
    }

    const stats = pitcherData.seasonStats;
    const homeRunsAllowed = stats.homeRunsAllowed || 0;
    const inningsPitched = stats.inningsPitched || 0;

    // Calculate HR/9
    const hrPer9 =
      inningsPitched > 0 ? (homeRunsAllowed / inningsPitched) * 9 : 0;

    // Get advanced metrics from Statcast if available
    const hardHitPercent = pitcherData.resultMetrics?.hardHitPercent;
    const barrelRate = pitcherData.resultMetrics?.barrelRate;

    // League average HR/9 is ~1.3
    // Scale from 1-10 where 5 is average
    // Higher number means more vulnerable to HRs
    let vulnerability = 5;

    if (inningsPitched >= 20) {
      // Adjust based on HR/9
      if (hrPer9 > 2.0) vulnerability += 3;
      else if (hrPer9 > 1.6) vulnerability += 2;
      else if (hrPer9 > 1.3) vulnerability += 1;
      else if (hrPer9 < 1.0) vulnerability -= 1;
      else if (hrPer9 < 0.7) vulnerability -= 2;
      else if (hrPer9 < 0.4) vulnerability -= 3;
    }

    // Adjust further based on Statcast metrics if available
    if (hardHitPercent !== undefined) {
      // League average hard hit % ~38%
      if (hardHitPercent > 45) vulnerability += 1;
      else if (hardHitPercent < 30) vulnerability -= 1;
    }

    // Ensure result is within 1-10 scale
    vulnerability = Math.max(1, Math.min(10, vulnerability));

    return {
      gamesStarted: pitcherData.seasonStats.gamesStarted || 0,
      homeRunsAllowed,
      inningsPitched,
      hrPer9,
      flyBallPct: 0.35, // Default value
      hrPerFlyBall:
        inningsPitched > 0 ? homeRunsAllowed / (inningsPitched * 0.35) : 0, // Estimated
      homeRunVulnerability: vulnerability,
      hardHitPercent,
      barrelRate,
    };
  } catch (error) {
    console.error(
      `Error fetching home run vulnerability for pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Estimate home run probability for a batter against a specific pitcher
 * with park and weather factors
 */
export async function estimateHomeRunProbability(
  batterId: number,
  pitcherId: number,
  ballparkId: number,
  isHome: boolean,
  weatherConditions?:
    | number
    | {
        temperature?: number;
        windSpeed?: number;
        windDirection?: string;
        isOutdoor?: boolean;
      }
): Promise<
  Omit<HomeRunAnalysis, "multipleHRProbability"> & {
    probability: number; // 0-1 scale
    confidence: number; // 1-10 scale
    factors: {
      batterProfile: number; // Weight: how much batter metrics influenced the result
      pitcherVulnerability: number; // Weight: how much pitcher metrics influenced the result
      ballpark: number; // Weight: how much park factors influenced the result
      weather: number; // Weight: how much weather influenced the result
      platoonAdvantage: number; // Weight: how much handedness matchup influenced the result
    };
    expectedValue: number; // Expected fantasy points from HRs
  }
> {
  try {
    // Fetch all data in parallel
    const [batterStats, pitcherVuln, batterProfile] = await Promise.all([
      getPlayerHomeRunStats(batterId),
      getPitcherHomeRunVulnerability(pitcherId),
      getCareerHomeRunProfile(batterId),
    ]);

    // Get ballpark and environment data
    const ballparkFactors = await getBallparkFactors({
      venueId: ballparkId,
      season: new Date().getFullYear().toString(),
    });

    // Get environment data if not provided
    const gameEnvironment =
      weatherConditions ||
      (await getGameEnvironmentData({
        gamePk: ballparkId.toString(),
      }));

    // Base probability from player's HR rate
    // Typical MLB average is ~3% per plate appearance
    let baseProbability = 0.03;

    // Factors with default neutral values
    let batterFactor = 1.0;
    let pitcherFactor = 1.0;
    let parkFactor = 1.0;
    let weatherFactor = 1.0;
    let platoonFactor = 1.0;

    // Factor weights (sum to 1.0)
    const weights = {
      batterProfile: 0.4,
      pitcherVulnerability: 0.25,
      ballpark: 0.2,
      weather: 0.1,
      platoonAdvantage: 0.05,
    };

    let confidence = 5; // Default mid-level confidence

    // Adjust based on batter stats
    if (batterStats) {
      // Use barrel rate from Statcast as key predictor if available
      if (batterStats.barrelRate) {
        // League average barrel rate is ~6-7%
        batterFactor = batterStats.barrelRate / 0.065;
        confidence += 1; // Increase confidence with Statcast data
      } else {
        // Fallback to HR rate
        batterFactor =
          batterStats.homeRunRate > 0 ? batterStats.homeRunRate / 0.03 : 1.0;
      }

      // Adjust for hard hit % if available
      if (batterStats.hardHitPct) {
        batterFactor *= (batterStats.hardHitPct / 38) * 0.5 + 0.5; // Weighted adjustment
      }

      // Use raw HR rate as base probability if available
      if (batterStats.homeRunRate > 0) {
        baseProbability = batterStats.homeRunRate;
      }
    }

    // Adjust based on pitcher vulnerability
    if (pitcherVuln) {
      // Higher vulnerability means more HR probability
      pitcherFactor = pitcherVuln.homeRunVulnerability / 5.0;

      // If Statcast hard hit % is available, incorporate that
      if (pitcherVuln.hardHitPercent) {
        pitcherFactor *= (pitcherVuln.hardHitPercent / 38) * 0.3 + 0.7; // Weighted adjustment
      }
    }

    // Adjust for ballpark
    if (
      ballparkFactors &&
      ballparkFactors.types &&
      ballparkFactors.types.homeRuns
    ) {
      parkFactor = ballparkFactors.types.homeRuns;
    }

    // Adjust for weather if available and outdoors
    if (
      gameEnvironment &&
      typeof gameEnvironment !== "number" &&
      gameEnvironment.isOutdoor
    ) {
      // Temperature effect on HR
      if (typeof gameEnvironment !== "number" && gameEnvironment.temperature) {
        if (
          typeof gameEnvironment !== "number" &&
          gameEnvironment.temperature > 85
        )
          weatherFactor += 0.2;
        else if (
          typeof gameEnvironment !== "number" &&
          gameEnvironment.temperature > 75
        )
          weatherFactor += 0.1;
        else if (
          typeof gameEnvironment !== "number" &&
          gameEnvironment.temperature < 50
        )
          weatherFactor -= 0.1;
        else if (
          typeof gameEnvironment !== "number" &&
          gameEnvironment.temperature < 40
        )
          weatherFactor -= 0.2;
      }

      // Wind effect
      if (
        typeof gameEnvironment !== "number" &&
        gameEnvironment.windSpeed &&
        gameEnvironment.windDirection
      ) {
        const windSpeed =
          typeof gameEnvironment !== "number" ? gameEnvironment.windSpeed : 0;
        const windDir =
          typeof gameEnvironment !== "number" && gameEnvironment.windDirection
            ? gameEnvironment.windDirection.toLowerCase()
            : "";

        if (windSpeed > 10) {
          if (windDir.includes("out") || windDir.includes("center")) {
            weatherFactor += 0.2; // Out to center field
          } else if (windDir.includes("in")) {
            weatherFactor -= 0.2; // Blowing in
          }
        }
      }
    }

    // Adjust for home/away (if batter career profile available)
    if (batterProfile) {
      if (isHome) {
        // Use home vs. away factor from profile
        platoonFactor = batterProfile.homeVsAway.homeFieldAdvantage;
      }
    }

    // Calculate weighted probability
    const finalProbability =
      baseProbability *
      (batterFactor * weights.batterProfile +
        pitcherFactor * weights.pitcherVulnerability +
        parkFactor * weights.ballpark +
        weatherFactor * weights.weather +
        platoonFactor * weights.platoonAdvantage);

    // Cap probability at reasonable levels
    const cappedProbability = Math.max(0.001, Math.min(0.3, finalProbability));

    // Expected fantasy points (DK gives 10 pts per HR)
    const expectedValue = cappedProbability * 10;

    return {
      probability: cappedProbability,
      homeRunProbability: cappedProbability,
      expectedHomeRuns: cappedProbability, // Expected HR per game
      confidence,
      factors: {
        batterProfile: batterFactor,
        pitcherVulnerability: pitcherFactor,
        ballpark: parkFactor,
        weather: weatherFactor,
        platoonAdvantage: platoonFactor,
        batterPower: batterFactor * 5,
        // We're mapping custom properties to the standard interface
        // pitcherVulnerability is already defined above
        ballparkFactor: parkFactor * 5,
        weatherFactor: weatherFactor * 5,
        recentForm: platoonFactor * 5,
      },
      expectedValue,
    };
  } catch (error) {
    console.error(
      `Error estimating home run probability for batter ${batterId} vs pitcher ${pitcherId}:`,
      error
    );

    // Return conservative default values
    return {
      probability: 0.03, // League average
      homeRunProbability: 0.03,
      expectedHomeRuns: 0.03,
      confidence: 3, // Lower confidence due to error
      factors: {
        batterProfile: 1.0,
        pitcherVulnerability: 5.0, // Set to 5.0 for scaled version
        ballpark: 1.0,
        weather: 1.0,
        platoonAdvantage: 1.0,
        batterPower: 5.0,
        ballparkFactor: 5.0,
        weatherFactor: 5.0,
        recentForm: 5.0,
      },
      expectedValue: 0.3, // 0.03 * 10
    };
  }
}
