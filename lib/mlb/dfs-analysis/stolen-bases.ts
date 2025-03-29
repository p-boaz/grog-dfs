/**
 * Specialized functions for tracking and analyzing stolen base data
 *
 * IMPORTANT: This file is maintained for backward compatibility.
 * New code should use the base-stealing.ts and defense-stats.ts modules directly.
 */

import {
  getPlayerSBSeasonStats,
  getPlayerSBCareerProfile,
} from "../player/base-stealing";
import { getCatcherDefense } from "../player/defense-stats";

/**
 * Get player's season stats with focus on stolen bases and baserunning
 *
 * @param playerId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Object with stolen base statistics
 */
export async function getPlayerSeasonStats(
  playerId: number,
  season = new Date().getFullYear()
): Promise<{
  battingAverage: number;
  stolenBases: number;
  stolenBaseAttempts: number;
  caughtStealing: number;
  gamesPlayed: number;
  stolenBaseRate: number;
  stolenBaseSuccess: number;
} | null> {
  // Delegate to the new base-stealing implementation
  return getPlayerSBSeasonStats(playerId, season);
}

/**
 * Get career stolen base profile based on historical data
 * Useful for identifying players with consistent stealing tendencies
 */
export async function getCareerStolenBaseProfile(playerId: number): Promise<{
  careerStolenBases: number;
  careerGames: number;
  careerRate: number;
  bestSeasonSB: number;
  bestSeasonRate: number;
  recentTrend: "increasing" | "decreasing" | "stable";
} | null> {
  // Delegate to the new base-stealing implementation
  return getPlayerSBCareerProfile(playerId);
}

/**
 * Get catcher's stolen base defense metrics
 * Used to evaluate susceptibility to stolen bases
 */
export async function getCatcherStolenBaseDefense(
  catcherId: number,
  season = new Date().getFullYear()
): Promise<{
  caughtStealingPercentage: number;
  stolenBasesAllowed: number;
  caughtStealing: number;
  attemptsPer9: number;
  defensiveRating: number;
} | null> {
  try {
    // Delegate to the new defense-stats implementation
    const defenseMetrics = await getCatcherDefense({
      catcherId,
      season,
    });

    if (!defenseMetrics) {
      return null;
    }

    // Map to the old interface format
    return {
      caughtStealingPercentage: defenseMetrics.caughtStealingPercentage,
      stolenBasesAllowed: defenseMetrics.stolenBasesAllowed,
      caughtStealing: defenseMetrics.caughtStealing,
      attemptsPer9: defenseMetrics.attemptsPer9,
      defensiveRating: defenseMetrics.defensiveRating,
    };
  } catch (error) {
    console.error(
      `Error fetching catcher defense metrics for player ${catcherId}:`,
      error
    );
    return null;
  }
}
