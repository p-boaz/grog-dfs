/**
 * Specialized functions for analyzing stolen base potential and probabilities
 */

import { getCatcherDefense } from "../player/defense-stats";
import { getEnhancedBatterData } from "../services/batter-data-service";
import { getEnhancedPitcherData } from "../services/pitcher-data-service";

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
  sprintSpeed?: number;
} | null> {
  try {
    // Fetch enhanced player data that may include Statcast metrics
    const enhancedData = await getEnhancedBatterData(playerId, season);

    // If no stats are available, return null
    if (!enhancedData || !enhancedData.seasonStats) {
      return null;
    }

    const stats = enhancedData.seasonStats;

    // Calculate attempts and rate
    const stolenBaseAttempts = stats.stolenBases + stats.caughtStealing;
    const stolenBaseRate =
      stats.gamesPlayed > 0 ? stats.stolenBases / stats.gamesPlayed : 0;
    const stolenBaseSuccess =
      stolenBaseAttempts > 0 ? stats.stolenBases / stolenBaseAttempts : 0;

    // Extract sprint speed from Statcast data if available
    // This would come from a more comprehensive Statcast integration
    // For now, estimate based on SB success rate and frequency
    const estimatedSprintSpeed = estimateSprintSpeed(
      stolenBaseRate,
      stolenBaseSuccess,
      stats.stolenBases
    );

    return {
      battingAverage: stats.avg,
      stolenBases: stats.stolenBases,
      stolenBaseAttempts,
      caughtStealing: stats.caughtStealing,
      gamesPlayed: stats.gamesPlayed,
      stolenBaseRate,
      stolenBaseSuccess,
      sprintSpeed: estimatedSprintSpeed,
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
  try {
    // Get enhanced player data with career stats
    const enhancedData = await getEnhancedBatterData(playerId);

    if (
      !enhancedData ||
      !enhancedData.careerStats ||
      enhancedData.careerStats.length === 0
    ) {
      return null;
    }

    let careerStolenBases = 0;
    let careerGames = 0;
    let bestSeasonSB = 0;
    let bestSeasonRate = 0;

    // Track recent seasons for trend analysis
    const recentSeasons: Array<{ season: string; sbRate: number }> = [];

    // Analyze career stats
    enhancedData.careerStats.forEach((season) => {
      careerStolenBases += season.stolenBases || 0;
      careerGames += season.gamesPlayed || 0;

      // Check if this is the best SB season
      if ((season.stolenBases || 0) > bestSeasonSB) {
        bestSeasonSB = season.stolenBases || 0;
      }

      // Calculate season SB rate
      const seasonRate =
        season.gamesPlayed > 0
          ? (season.stolenBases || 0) / season.gamesPlayed
          : 0;

      if (seasonRate > bestSeasonRate && season.gamesPlayed >= 20) {
        bestSeasonRate = seasonRate;
      }

      // Track recent seasons for trend analysis
      const currentYear = new Date().getFullYear();
      const seasonYear = parseInt(season.season);
      if (seasonYear >= currentYear - 3 && season.gamesPlayed >= 20) {
        recentSeasons.push({
          season: season.season,
          sbRate: seasonRate,
        });
      }
    });

    // Calculate career rate
    const careerRate = careerGames > 0 ? careerStolenBases / careerGames : 0;

    // Determine trend
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
  popTime?: number;
  armStrength?: number;
} | null> {
  try {
    // Delegate to the defense-stats implementation
    const defenseMetrics = await getCatcherDefense({
      catcherId,
      season,
    });

    if (!defenseMetrics) {
      return null;
    }

    // Map to enhanced interface format
    return {
      caughtStealingPercentage: defenseMetrics.caughtStealingPercentage,
      stolenBasesAllowed: defenseMetrics.stolenBasesAllowed,
      caughtStealing: defenseMetrics.caughtStealing,
      attemptsPer9: defenseMetrics.attemptsPer9,
      defensiveRating: defenseMetrics.defensiveRating,
      // Statcast metrics would be added here in a full implementation
      popTime: estimatePopTime(defenseMetrics.caughtStealingPercentage),
      armStrength: estimateArmStrength(defenseMetrics.caughtStealingPercentage),
    };
  } catch (error) {
    console.error(
      `Error fetching catcher defense metrics for player ${catcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Analyze pitcher's ability to control the running game
 */
export async function getPitcherRunningGameControl(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<{
  pickoffMoves: number; // 1-10 scale
  slideStepTime: number; // Time to plate with slide step in seconds
  timeToPlate: number; // Regular delivery time in seconds
  stolenBaseAllowedRate: number; // SB allowed per 9 innings
  holdRating: number; // 1-10 scale of ability to hold runners
} | null> {
  try {
    // Get enhanced pitcher data that may include time to plate metrics
    const pitcherData = await getEnhancedPitcherData(pitcherId, season);

    if (!pitcherData) {
      return null;
    }

    // These metrics would ideally come from Statcast
    // For now, use estimates based on limited data

    // League average time to plate is ~1.3-1.5 seconds
    // Slide step is typically ~0.2-0.3 seconds faster
    const estimatedTimeToPlate = 1.4;
    const estimatedSlideStep = 1.2;

    // Estimated hold rating based on delivery mechanics
    // This would use actual data in a full implementation
    const holdRating = 5; // Default to league average

    // Estimated stolen base allowed rate
    // In a complete implementation, we'd use actual stolen bases allowed
    const stolenBaseAllowedRate = 0.5; // League average is ~0.5 SB per 9 innings

    return {
      pickoffMoves: 5, // Default to league average
      slideStepTime: estimatedSlideStep,
      timeToPlate: estimatedTimeToPlate,
      stolenBaseAllowedRate,
      holdRating,
    };
  } catch (error) {
    console.error(
      `Error fetching pitcher running game control for player ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate stolen base probability for a specific batter/pitcher/catcher matchup
 */
export async function calculateStolenBaseProbability(
  batterId: number,
  pitcherId: number,
  catcherId: number
): Promise<{
  probability: number; // 0-1 scale
  expectedValue: number; // Expected fantasy points
  factors: {
    batterProfile: number;
    catcherDefense: number;
    pitcherHold: number;
    gameContext: number;
  };
  confidence: number; // 1-10 scale
}> {
  try {
    // Get all relevant data in parallel
    const [batterStats, careerProfile, catcherDefense, pitcherControl] =
      await Promise.all([
        getPlayerSeasonStats(batterId),
        getCareerStolenBaseProfile(batterId),
        getCatcherStolenBaseDefense(catcherId),
        getPitcherRunningGameControl(pitcherId),
      ]);

    // Base probability factors
    let batterFactor = 1.0;
    let catcherFactor = 1.0;
    let pitcherFactor = 1.0;
    let contextFactor = 1.0;

    // Base confidence level
    let confidence = 5;

    // Calculate batter factor based on SB tendency
    if (batterStats) {
      // Players with higher SB rates should have higher probabilities
      // League average is about 0.1 SB per game
      batterFactor = Math.min(
        3.0,
        Math.max(0.2, batterStats.stolenBaseRate / 0.1)
      );

      // Adjust for success rate - players with high success rates are more likely to attempt
      if (batterStats.stolenBaseSuccess > 0.8) {
        batterFactor *= 1.2; // Boost for highly successful base stealers
        confidence += 1;
      } else if (batterStats.stolenBaseSuccess < 0.6) {
        batterFactor *= 0.8; // Penalty for unsuccessful stealers
      }

      // Adjust for sprint speed if available
      if (batterStats.sprintSpeed) {
        // Sprint speed of 30 ft/sec is elite, 27 is average
        if (batterStats.sprintSpeed > 29) {
          batterFactor *= 1.3;
          confidence += 1;
        } else if (batterStats.sprintSpeed < 26) {
          batterFactor *= 0.7;
        }
      }
    }

    // Adjust for career profile
    if (careerProfile) {
      // Consider recent trend
      if (careerProfile.recentTrend === "increasing") {
        batterFactor *= 1.15;
      } else if (careerProfile.recentTrend === "decreasing") {
        batterFactor *= 0.85;
      }

      // Confidence boost for consistent base stealers
      if (careerProfile.careerRate > 0.2) {
        confidence += 1;
      }
    }

    // Calculate catcher factor
    if (catcherDefense) {
      // League average CS% is ~28%
      // Higher CS% means lower success probability for runner
      catcherFactor = Math.min(
        2.0,
        Math.max(
          0.5,
          0.28 / Math.max(0.2, catcherDefense.caughtStealingPercentage)
        )
      );

      // Additional adjustments based on advanced metrics
      if (catcherDefense.popTime) {
        // Pop time of 2.0 is average, 1.9 is good, 1.8 is elite
        if (catcherDefense.popTime < 1.9) {
          catcherFactor *= 0.8; // Significant reduction for quick pop times
          confidence += 1;
        } else if (catcherDefense.popTime > 2.1) {
          catcherFactor *= 1.2; // Bonus for slow pop times
        }
      }

      // Overall defensive rating impact
      catcherFactor *= (6 - catcherDefense.defensiveRating) / 5;
    }

    // Calculate pitcher factor
    if (pitcherControl) {
      // Pitchers with good hold ratings reduce SB probability
      pitcherFactor = (11 - pitcherControl.holdRating) / 10;

      // Time to plate is crucial
      // League average is ~1.4 seconds
      if (pitcherControl.timeToPlate < 1.3) {
        pitcherFactor *= 0.8; // Quick delivery reduces success
        confidence += 1;
      } else if (pitcherControl.timeToPlate > 1.5) {
        pitcherFactor *= 1.2; // Slow delivery increases success
      }
    }

    // Calculate base probability (weighted factors)
    const weights = {
      batter: 0.5, // Batter factor has highest impact
      catcher: 0.3, // Catcher has significant impact
      pitcher: 0.15, // Pitcher has moderate impact
      context: 0.05, // Game context has minor impact
    };

    const baseProbability = 0.67; // League average SB success rate
    const adjustedProbability =
      baseProbability *
      (batterFactor * weights.batter +
        catcherFactor * weights.catcher +
        pitcherFactor * weights.pitcher +
        contextFactor * weights.context);

    // Ensure probability is reasonable
    const finalProbability = Math.min(0.95, Math.max(0.2, adjustedProbability));

    // Calculate expected fantasy points (5 points per SB in DraftKings)
    const expectedValue = finalProbability * 5;

    // Final confidence capped at 1-10
    const finalConfidence = Math.min(10, Math.max(1, confidence));

    return {
      probability: finalProbability,
      expectedValue,
      factors: {
        batterProfile: batterFactor,
        catcherDefense: catcherFactor,
        pitcherHold: pitcherFactor,
        gameContext: contextFactor,
      },
      confidence: finalConfidence,
    };
  } catch (error) {
    console.error(
      `Error calculating stolen base probability for batter ${batterId} vs pitcher ${pitcherId} and catcher ${catcherId}:`,
      error
    );

    // Return conservative default values
    return {
      probability: 0.67, // League average success rate
      expectedValue: 0.67 * 5, // Average expected points
      factors: {
        batterProfile: 1.0,
        catcherDefense: 1.0,
        pitcherHold: 1.0,
        gameContext: 1.0,
      },
      confidence: 3, // Low confidence due to error
    };
  }
}

/**
 * Helper function to estimate sprint speed from stolen base metrics
 * In a real implementation, this would use actual Statcast sprint speed
 */
function estimateSprintSpeed(
  stolenBaseRate: number,
  successRate: number,
  totalSBs: number
): number {
  // League average sprint speed is ~27 ft/sec
  let estimatedSpeed = 27;

  // Adjust based on SB frequency
  if (stolenBaseRate > 0.3) estimatedSpeed += 2; // Elite frequency
  else if (stolenBaseRate > 0.2) estimatedSpeed += 1.5;
  else if (stolenBaseRate > 0.1) estimatedSpeed += 1;
  else if (stolenBaseRate < 0.05) estimatedSpeed -= 1;

  // Adjust based on success rate
  if (successRate > 0.85 && totalSBs >= 10)
    estimatedSpeed += 1; // Efficient with volume
  else if (successRate < 0.7) estimatedSpeed -= 0.5; // Inefficient

  // Ensure within reasonable range
  return Math.min(30.5, Math.max(23, estimatedSpeed));
}

/**
 * Helper function to estimate pop time from caught stealing percentage
 */
function estimatePopTime(caughtStealingPct: number): number {
  // League average pop time is ~2.0 seconds
  // Elite is ~1.85, poor is ~2.15
  // CS% of 40% is elite, 20% is poor

  const popTimeRange = 0.3; // Range from best to worst (1.85 to 2.15)
  const csRange = 30; // Range from best to worst CS% (45% to 15%)

  // Normalize CS% to 0-1 range where 1 is best
  const normalizedCS = Math.min(0.45, Math.max(0.15, caughtStealingPct)) - 0.15;
  const scaledCS = normalizedCS / 0.3;

  // Calculate pop time where higher scaledCS means lower (better) pop time
  return 2.15 - scaledCS * popTimeRange;
}

/**
 * Helper function to estimate arm strength from caught stealing percentage
 */
function estimateArmStrength(caughtStealingPct: number): number {
  // Arm strength on 1-10 scale where 10 is best
  // CS% of 40% is elite (9-10), 20% is poor (3-4)

  // Simple linear mapping from CS% to arm strength rating
  return Math.min(10, Math.max(1, caughtStealingPct * 25));
}
