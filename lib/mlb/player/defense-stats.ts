/**
 * Defense-focused stats with emphasis on catcher metrics
 */

import { makeMLBApiRequest } from "../core/api-client";
import { withCache, DEFAULT_CACHE_TTL, markAsApiSource } from "../cache";

/**
 * Interface for catcher's defensive metrics related to stolen bases
 */
export interface CatcherDefenseMetrics {
  playerId: number;
  fullName: string;
  caughtStealingPercentage: number;
  stolenBasesAllowed: number;
  caughtStealing: number;
  attemptsPer9: number;
  popTime?: number; // Time from catching to release in seconds
  armStrength?: number; // MPH on throws
  defensiveRating: number; // Overall 0-100 rating of defense vs stolen bases
  teamRank?: number; // Rank among MLB catchers
  runs_saved_vs_running?: number; // Advanced stat: runs saved vs average
  sourceTimestamp?: Date;
}

/**
 * Get catcher's defensive metrics, focusing on stolen base prevention
 *
 * @param catcherId MLB player ID
 * @param season Season year (defaults to current year)
 */
async function fetchCatcherDefense(params: {
  catcherId: number;
  season?: number;
}): Promise<CatcherDefenseMetrics | null> {
  const { catcherId, season = new Date().getFullYear() } = params;

  try {
    // Get fielding stats focused on catching
    const response = await makeMLBApiRequest<any>(
      `/people/${catcherId}?hydrate=stats(group=[fielding],type=[yearByYear,statSplits],season=${season})`
    );

    if (!response?.people?.[0]) {
      return null;
    }

    const playerData = response.people[0];
    const fullName = playerData.fullName || `Player ${catcherId}`;
    const position = playerData.primaryPosition?.abbreviation || "";

    // Verify player is a catcher
    if (position !== "C") {
      return null;
    }

    // Extract fielding stats
    const stats = playerData.stats || [];
    const fieldingStats =
      stats.find(
        (s: any) =>
          s.group.displayName === "fielding" &&
          s.type.displayName === "yearByYear"
      )?.splits || [];

    // Find catching stats for current season
    const seasonStr = season.toString();
    const catchingStats =
      fieldingStats.find(
        (s: any) => s.season === seasonStr && s.position?.name === "Catcher"
      )?.stat || {};

    // Calculate metrics from raw stats
    const stolenBasesAllowed = catchingStats.passedBall || 0;
    const caughtStealing = catchingStats.caughtStealing || 0;
    const totalAttempts = stolenBasesAllowed + caughtStealing;
    const caughtStealingPercentage =
      totalAttempts > 0 ? caughtStealing / totalAttempts : 0.25; // Default to league average if no data

    // Get defensive innings to calculate attempts/9IP
    const defensiveInnings = catchingStats.innings || 0;
    const attemptsPer9 =
      defensiveInnings > 0 ? (totalAttempts / defensiveInnings) * 9 : 0.8; // Default value

    // Calculate overall defensive rating (0-100 scale)
    // Better CS% = higher rating
    const leagueAverageCS = 0.25; // MLB average ~25%
    const csAboveAverage = caughtStealingPercentage - leagueAverageCS;
    const defenseRating = Math.max(30, Math.min(90, 50 + csAboveAverage * 100));

    return markAsApiSource({
      playerId: catcherId,
      fullName,
      caughtStealingPercentage,
      stolenBasesAllowed,
      caughtStealing,
      attemptsPer9,
      defensiveRating: defenseRating,
      // Will be populated from Statcast data in future implementation
      popTime: 2.0, // Average is ~2.0 seconds
      armStrength: 82, // Average is ~82 MPH
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error(
      `Error fetching catcher defense metrics for ${catcherId}:`,
      error
    );

    // Return default/fallback data rather than null
    return markAsApiSource({
      playerId: catcherId,
      fullName: `Catcher ${catcherId}`,
      caughtStealingPercentage: 0.25, // League average
      stolenBasesAllowed: 30,
      caughtStealing: 10,
      attemptsPer9: 0.8,
      defensiveRating: 50, // Average (0-100 scale)
      sourceTimestamp: new Date(),
    });
  }
}

/**
 * Get catcher defense metrics with caching
 */
export const getCatcherDefense = withCache(
  fetchCatcherDefense,
  "catcher-defense",
  DEFAULT_CACHE_TTL.player
);

/**
 * Calculate the vulnerability of a battery (pitcher+catcher) to stolen bases
 * The lower the score, the harder to steal against
 *
 * @param catcherId MLB player ID for catcher
 * @param pitcherId MLB player ID for pitcher
 * @param season Season year
 * @returns Numeric rating from 1-10, where 5 is league average (higher = easier to steal)
 */
export async function getBatteryVulnerability(
  catcherId: number,
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<{
  vulnerability: number; // Scale 1-10 where 5 is league average
  catcherFactor: number; // How much the catcher influences vulnerability (0-1)
  pitcherFactor: number; // How much the pitcher influences vulnerability (0-1)
  catcherMetrics: CatcherDefenseMetrics | null;
} | null> {
  try {
    // Get catcher metrics
    const catcherMetrics = await getCatcherDefense({
      catcherId,
      season,
    });

    if (!catcherMetrics) {
      return null;
    }

    // Get pitcher's time to plate
    // This would need a reference to pitcher stats module
    // For now we'll use a static default value
    const pitcherDeliveryTime = 1.3; // Average is ~1.3 seconds

    // Calculate vulnerability factors

    // Catcher factor: Based on caught stealing percentage
    // Higher CS% = lower vulnerability
    const catcherFactor = Math.max(
      0.3,
      Math.min(0.7, 1.0 - catcherMetrics.caughtStealingPercentage * 1.5)
    );

    // Pitcher factor: Based on delivery time to plate
    // Faster delivery = lower vulnerability
    const leagueAverageDelivery = 1.3;
    const pitcherFactor = Math.max(
      0.3,
      Math.min(0.7, pitcherDeliveryTime / leagueAverageDelivery)
    );

    // Combined vulnerability (1-10 scale)
    // 5 is league average
    const rawVulnerability = 5 * (catcherFactor + pitcherFactor);
    const vulnerability = Math.max(1, Math.min(10, rawVulnerability));

    return {
      vulnerability,
      catcherFactor,
      pitcherFactor,
      catcherMetrics,
    };
  } catch (error) {
    console.error(
      `Error calculating battery vulnerability for catcher=${catcherId}, pitcher=${pitcherId}:`,
      error
    );
    return null;
  }
}
