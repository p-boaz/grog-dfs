/**
 * Specialized module for analyzing base stealing metrics and projections
 */

import { makeMLBApiRequest } from "../core/api-client";
import {
  PlayerSBCareerProfile,
  PlayerSBSeasonStats,
  StolenBaseContext,
  StolenBaseProjection,
} from "../types/player/batter";
import { getCatcherDefense } from "./defense-stats";

/**
 * Get player's season stats focused on stolen bases
 *
 * @param playerId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Stolen base statistics for specified season
 */
export async function getPlayerSBSeasonStats(
  playerId: number,
  season = new Date().getFullYear()
): Promise<PlayerSBSeasonStats | null> {
  try {
    // Fetch player data with season stats
    const response = await makeMLBApiRequest<any>(
      `/people/${playerId}?hydrate=stats(group=[hitting],type=[yearByYear],season=${season})`
    );

    if (!response?.people?.[0]) {
      return null;
    }

    const player = response.people[0];
    const position = player.primaryPosition?.abbreviation || "";

    // Skip pitchers
    if (position === "P") {
      return null;
    }

    // Extract stats from response
    const stats = player.stats || [];
    const yearByYearStats =
      stats.find(
        (s: any) =>
          s.group.displayName === "hitting" &&
          s.type.displayName === "yearByYear"
      )?.splits || [];

    // Get current season stats
    const seasonStr = season.toString();
    const seasonStats =
      yearByYearStats.find((s: any) => s.season === seasonStr)?.stat || {};

    // If no stats found or no games played, return null
    if (!seasonStats || !seasonStats.gamesPlayed) {
      console.log(
        `No batting stats found for player ${playerId}, season ${season}`
      );
      return null;
    }

    // Extract stolen base metrics
    const stolenBases = seasonStats.stolenBases || 0;
    const caughtStealing = seasonStats.caughtStealing || 0;
    const gamesPlayed = seasonStats.gamesPlayed || 0;

    // Calculate rates
    const stolenBaseRate = gamesPlayed > 0 ? stolenBases / gamesPlayed : 0;
    const stolenBaseAttempts = stolenBases + caughtStealing;
    const stolenBaseSuccess =
      stolenBaseAttempts > 0 ? stolenBases / stolenBaseAttempts : 0;

    return {
      battingAverage: seasonStats.avg || 0,
      stolenBases,
      stolenBaseAttempts,
      caughtStealing,
      gamesPlayed,
      stolenBaseRate,
      stolenBaseSuccess,
    };
  } catch (error) {
    console.error(
      `Error fetching stolen base stats for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get player's career stolen base metrics
 *
 * @param playerId MLB player ID
 * @returns Career SB profile with trends
 */
export async function getPlayerSBCareerProfile(
  playerId: number
): Promise<PlayerSBCareerProfile | null> {
  try {
    // Fetch player data with career stats
    const response = await makeMLBApiRequest<any>(
      `/people/${playerId}?hydrate=stats(group=[hitting],type=[yearByYear])`
    );

    if (!response?.people?.[0]) {
      return null;
    }

    const player = response.people[0];

    // Extract career stats
    const stats = player.stats || [];
    const yearByYearStats =
      stats.find(
        (s: any) =>
          s.group.displayName === "hitting" &&
          s.type.displayName === "yearByYear"
      )?.splits || [];

    if (!yearByYearStats || yearByYearStats.length === 0) {
      return null;
    }

    // Track career totals and analyze trends
    let careerStolenBases = 0;
    let careerGames = 0;
    let bestSeasonSB = 0;
    let bestSeasonRate = 0;

    // Track recent seasons for trend analysis
    const recentSeasons: Array<{ season: string; sbRate: number }> = [];

    // Process each season
    yearByYearStats.forEach((season: { season: string; stat?: any }) => {
      const seasonStats = season.stat || {};
      const stolenBases = seasonStats.stolenBases || 0;
      const gamesPlayed = seasonStats.gamesPlayed || 0;

      // Update career totals
      careerStolenBases += stolenBases;
      careerGames += gamesPlayed;

      // Check if this is the best SB season
      const seasonRate = gamesPlayed > 0 ? stolenBases / gamesPlayed : 0;
      if (stolenBases > bestSeasonSB) {
        bestSeasonSB = stolenBases;
      }

      if (seasonRate > bestSeasonRate && gamesPlayed >= 20) {
        bestSeasonRate = seasonRate;
      }

      // Track for recent trend (last 3 seasons)
      const currentYear = new Date().getFullYear();
      const seasonYear = parseInt(season.season);
      if (seasonYear >= currentYear - 3 && gamesPlayed >= 20) {
        recentSeasons.push({
          season: season.season,
          sbRate: seasonRate,
        });
      }
    });

    // Calculate career SB rate
    const careerRate = careerGames > 0 ? careerStolenBases / careerGames : 0;

    // Determine SB trend
    let recentTrend: "increasing" | "decreasing" | "stable" = "stable";

    if (recentSeasons.length >= 2) {
      // Sort by season (descending)
      recentSeasons.sort((a, b) => parseInt(b.season) - parseInt(a.season));

      // Compare most recent to previous
      if (recentSeasons[0].sbRate > recentSeasons[1].sbRate * 1.2) {
        recentTrend = "increasing";
      } else if (recentSeasons[0].sbRate < recentSeasons[1].sbRate * 0.8) {
        recentTrend = "decreasing";
      }
    }

    return {
      careerStolenBases,
      careerGames,
      careerRate,
      bestSeasonSB,
      bestSeasonRate,
      recentTrend,
    };
  } catch (error) {
    console.error(
      `Error fetching career stolen base profile for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Project stolen base opportunities and success probability
 *
 * @param playerId Batter's MLB ID
 * @param catcherId Catcher's MLB ID (optional)
 * @param pitcherId Pitcher's MLB ID (optional)
 * @param context Additional context like game situation
 * @returns Projected SB opportunities and success rate
 */
export async function projectStolenBaseOpportunities(
  playerId: number,
  catcherId?: number,
  pitcherId?: number,
  context?: StolenBaseContext
): Promise<StolenBaseProjection | null> {
  try {
    // Get player's baseline SB metrics
    const [seasonStats, careerProfile] = await Promise.all([
      getPlayerSBSeasonStats(playerId),
      getPlayerSBCareerProfile(playerId),
    ]);

    if (!seasonStats || !careerProfile) {
      return null;
    }

    // Base projection on weighted combo of season and career rates
    // More weight to current season
    const baselineAttempts =
      (seasonStats.stolenBaseRate * 2 + careerProfile.careerRate) / 3;
    const baselineSuccess = seasonStats.stolenBaseSuccess;

    // Default factors (no adjustment)
    let catcherFactor = 1.0;
    let pitcherFactor = 1.0;
    let situationalFactor = 1.0;

    // Apply catcher adjustment if provided
    if (catcherId) {
      const catcherMetrics = await getCatcherDefense({ catcherId });
      if (catcherMetrics) {
        // Adjust for catcher's caught stealing percentage
        // 25% is league average, each 5% above/below changes factor by 0.1
        const leagueAverageCS = 0.25;
        const csPercentDiff =
          catcherMetrics.caughtStealingPercentage - leagueAverageCS;
        // Better catchers (higher CS%) reduce steal attempts
        catcherFactor = Math.max(0.7, Math.min(1.3, 1.0 - csPercentDiff * 2));
      }
    }

    // Apply pitcher adjustment (would integrate with pitcher stats)
    // Implement in future version

    // Apply situational factors
    if (context) {
      // Teams steal more when behind, especially late in close games
      if (context.scoreMargin !== undefined) {
        if (context.scoreMargin < 0 && context.inning && context.inning >= 7) {
          situationalFactor *= 1.2; // 20% more attempts when trailing late
        } else if (context.scoreMargin > 2) {
          situationalFactor *= 0.8; // 20% fewer attempts when up by multiple runs
        }
      }

      // Home teams tend to run slightly less
      if (context.isHome === true) {
        situationalFactor *= 0.95;
      }
    }

    // Apply career trend factor
    let careerTrendFactor = 1.0;
    if (careerProfile.recentTrend === "increasing") {
      careerTrendFactor = 1.1; // 10% increase
    } else if (careerProfile.recentTrend === "decreasing") {
      careerTrendFactor = 0.9; // 10% decrease
    }

    // Calculate final projections
    const expectedAttempts =
      baselineAttempts *
      catcherFactor *
      pitcherFactor *
      situationalFactor *
      careerTrendFactor;
    const successProbability = baselineSuccess * catcherFactor;
    const projectedSB = expectedAttempts * successProbability;

    return {
      expectedAttempts,
      successProbability,
      projectedSB,
      factors: {
        playerBaseline: baselineAttempts,
        careerTrend: careerTrendFactor,
        catcherImpact: catcherFactor,
        pitcherImpact: pitcherFactor,
        situationalAdjustment: situationalFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error projecting stolen base opportunities for player ${playerId}:`,
      error
    );
    return null;
  }
}
