/**
 * Specialized functions for analyzing stolen base potential and probabilities
 */

import { getGameFeed } from "../game/game-feed";
import { getCatcherDefense } from "../player/defense-stats";
import { getEnhancedBatterData } from "../services/batter-data-service";
import { getEnhancedPitcherData } from "../services/pitcher-data-service";
import { getGameEnvironmentData } from "../weather/weather";
import { StolenBaseAnalysis } from "../types/analysis/events";
import { PlayerSBCareerProfile, PlayerSBSeasonStats, StolenBaseContext } from "../types/player/batter";
import { CatcherDefenseMetrics } from "../types/player/common";
import { PitcherHoldMetrics } from "../types/player/pitcher";

/**
 * Result interface for stolen base probability calculations
 */
export interface StolenBaseProbabilityResult {
  probability: number; // 0-1 scale for likelihood of success
  expectedValue: number; // Expected fantasy points
  factors: {
    batterProfile: number;
    catcherDefense: number;
    pitcherHold: number;
    gameContext: number;
    sprintSpeed: number; // New factor for sprint speed impact
  };
  confidence: number; // 1-10 scale
  insightDetails?: {
    // Optional detailed insights
    sprintSpeed?: number;
    sprintSpeedPercentile?: number;
    successRateProjection?: number;
    attemptLikelihood?: number;
  };
}

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
): Promise<PlayerSBSeasonStats | null> {
  try {
    // Fetch enhanced player data that includes Statcast metrics
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

    // Use sprint speed from enhanced data if available
    const sprintSpeed = enhancedData.runningMetrics?.sprintSpeed;

    return {
      battingAverage: stats.avg,
      stolenBases: stats.stolenBases,
      stolenBaseAttempts,
      caughtStealing: stats.caughtStealing,
      gamesPlayed: stats.gamesPlayed,
      stolenBaseRate,
      stolenBaseSuccess,
      sprintSpeed,
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
export async function getCareerStolenBaseProfile(playerId: number): Promise<PlayerSBCareerProfile | null> {
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
): Promise<CatcherDefenseMetrics | null> {
  try {
    // Delegate to the defense-stats implementation
    const defenseMetrics = await getCatcherDefense({
      catcherId,
      season,
    });

    if (!defenseMetrics) {
      return null;
    }

    // Map to enhanced interface format with required playerId and fullName
    return {
      playerId: defenseMetrics.playerId,
      fullName: defenseMetrics.fullName || "Unknown Catcher",
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
): Promise<PitcherHoldMetrics | null> {
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
 * Calculate stolen base probability for a specific batter in a specific game
 */
export async function calculateStolenBaseProbability(
  batterId: number,
  gamePk: string,
  oppPitcherId: number
): Promise<StolenBaseAnalysis & StolenBaseProbabilityResult> {
  try {
    // Get enhanced batter data with Statcast metrics
    const enhancedBatterData = await getEnhancedBatterData(batterId);

    // Get game data to find catcher
    const gameData = await getGameFeed({ gamePk });

    // Determine the catcher ID
    let catcherId = 0;

    try {
      // Determine if batter is home or away
      const batterTeamId = enhancedBatterData.currentTeam;
      const homeTeamId = gameData?.gameData?.teams?.home?.team?.id;
      const isHome = homeTeamId && batterTeamId === String(homeTeamId);

      // Get opposing team's catcher
      const oppTeam = isHome ? "away" : "home";
      const players = gameData?.liveData?.boxscore?.teams?.[oppTeam]?.players;

      if (players) {
        const playerEntries = Object.entries(players);
        for (const [_, playerData] of playerEntries) {
          const player = playerData as any;
          if (player?.position?.code === "2" && player?.person?.id) {
            catcherId = player.person.id;
            break;
          }
        }
      }
    } catch (error) {
      console.warn(`Could not determine catcher ID for game ${gamePk}:`, error);
    }

    // Get environment data for weather factors
    const environmentData = await getGameEnvironmentData({ gamePk });

    // Get all relevant data in parallel
    const [batterStats, careerProfile, catcherDefense, pitcherControl] =
      await Promise.all([
        getPlayerSeasonStats(batterId),
        getCareerStolenBaseProfile(batterId),
        catcherId ? getCatcherStolenBaseDefense(catcherId) : null,
        getPitcherRunningGameControl(oppPitcherId),
      ]);

    // Base probability factors
    let batterFactor = 1.0;
    let catcherFactor = 1.0;
    let pitcherFactor = 1.0;
    let contextFactor = 1.0;
    let sprintSpeedFactor = 1.0;

    // Base confidence level
    let confidence = 5;

    // Get sprint speed from enhanced batter data
    const sprintSpeed = enhancedBatterData.runningMetrics?.sprintSpeed;

    // Process detailed insights
    const insightDetails: StolenBaseProbabilityResult["insightDetails"] = {};

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
    }

    // Apply sprint speed factor - this is now a primary factor
    if (sprintSpeed) {
      // Store sprint speed in insights
      insightDetails.sprintSpeed = sprintSpeed;

      // Calculate percentile (roughly)
      // MLB sprint speed ranges from about 23 ft/sec to 31 ft/sec
      // with 27 ft/sec being approximately average
      const percentile = Math.min(
        100,
        Math.max(0, ((sprintSpeed - 23) / (31 - 23)) * 100)
      );
      insightDetails.sprintSpeedPercentile = Math.round(percentile);

      // Apply sprint speed as a major factor in stolen base probability
      // Elite speed (30+ ft/sec) is a massive advantage
      if (sprintSpeed >= 30) {
        sprintSpeedFactor = 1.8; // Elite speed (80% boost)
        confidence += 2;
      } else if (sprintSpeed >= 29) {
        sprintSpeedFactor = 1.6; // Very fast
        confidence += 1;
      } else if (sprintSpeed >= 28) {
        sprintSpeedFactor = 1.4; // Above average speed
        confidence += 1;
      } else if (sprintSpeed >= 27) {
        sprintSpeedFactor = 1.1; // Slightly above average speed
      } else if (sprintSpeed < 26) {
        sprintSpeedFactor = 0.7; // Below average speed
        confidence -= 1;
      } else if (sprintSpeed < 25) {
        sprintSpeedFactor = 0.5; // Well below average speed
        confidence -= 2;
      }
    }

    // Calculate catcher factor if available
    if (catcherDefense) {
      // Convert defensive rating to a factor
      // Higher rating means better defense, so invert for our formula
      catcherFactor = 2 - catcherDefense.defensiveRating / 5;

      // Adjust for pop time if available
      if (catcherDefense.popTime) {
        // Pop time below 1.9 is elite, above 2.1 is poor
        if (catcherDefense.popTime < 1.9) {
          catcherFactor *= 0.7; // Hard to steal on
        } else if (catcherDefense.popTime > 2.1) {
          catcherFactor *= 1.3; // Easier to steal on
        }
      }

      // Clamp to reasonable range
      catcherFactor = Math.min(1.8, Math.max(0.5, catcherFactor));
    }

    // Calculate pitcher factor
    if (pitcherControl) {
      pitcherFactor = 1.0;

      // Adjust for slide step time
      // Faster to plate = harder to steal
      if (pitcherControl.slideStepTime < 1.2) {
        pitcherFactor *= 0.8; // Very quick to plate
      } else if (pitcherControl.slideStepTime > 1.5) {
        pitcherFactor *= 1.2; // Slow to plate
      }

      // Adjust for hold rating
      pitcherFactor *= 5 / pitcherControl.holdRating;

      // Clamp to reasonable range
      pitcherFactor = Math.min(1.5, Math.max(0.7, pitcherFactor));
    }

    // Calculate context factor based on game situation
    // Default to neutral
    if (environmentData) {
      // Weather can affect stolen base attempts
      // Wet field conditions decrease likelihood of attempts
      if (environmentData.precipitation) {
        contextFactor *= 0.9;
      }

      // Very cold weather also decreases attempts
      if (environmentData.temperature < 40) {
        contextFactor *= 0.9;
      }
    }

    // Calculate base probability (weighted factors)
    const weights = {
      sprintSpeed: 0.3, // Sprint speed now has highest impact
      batter: 0.3, // Batter stealing tendency is still important
      catcher: 0.2, // Catcher has significant impact
      pitcher: 0.15, // Pitcher has moderate impact
      context: 0.05, // Game context has minor impact
    };

    const baseProbability = 0.67; // League average SB success rate
    const adjustedProbability =
      baseProbability *
      (sprintSpeedFactor * weights.sprintSpeed +
        batterFactor * weights.batter +
        catcherFactor * weights.catcher +
        pitcherFactor * weights.pitcher +
        contextFactor * weights.context);

    // Calculate attempt likelihood based on career profile
    let attemptLikelihood = 0.5; // Neutral default
    if (careerProfile) {
      // High career rate indicates higher likelihood of attempts
      if (careerProfile.careerRate > 0.2) {
        attemptLikelihood = 0.8;
      } else if (careerProfile.careerRate > 0.1) {
        attemptLikelihood = 0.6;
      } else if (careerProfile.careerRate < 0.05) {
        attemptLikelihood = 0.2;
      }

      // Recent trend affects likelihood
      if (careerProfile.recentTrend === "increasing") {
        attemptLikelihood += 0.1;
      } else if (careerProfile.recentTrend === "decreasing") {
        attemptLikelihood -= 0.1;
      }

      // Clamp to reasonable range
      attemptLikelihood = Math.min(1.0, Math.max(0.1, attemptLikelihood));
    }

    // Store additional insights
    insightDetails.attemptLikelihood = attemptLikelihood;
    insightDetails.successRateProjection = adjustedProbability;

    // Ensure probability is reasonable
    const finalProbability = Math.min(0.95, Math.max(0.2, adjustedProbability));

    // Calculate expected fantasy points (5 points per SB in DraftKings)
    // Adjust by attempt likelihood - players who don't attempt won't get SBs
    const expectedValue = finalProbability * attemptLikelihood * 5;

    // Final confidence capped at 1-10
    const finalConfidence = Math.min(10, Math.max(1, confidence));

    return {
      // StolenBaseAnalysis required properties
      expectedSteals: finalProbability * attemptLikelihood,
      stealAttemptProbability: attemptLikelihood,
      stealSuccessProbability: finalProbability,
      factors: {
        batterSpeed: sprintSpeedFactor,
        batterTendency: batterFactor,
        catcherDefense: catcherFactor,
        pitcherHoldRate: pitcherFactor,
        gameScriptFactor: contextFactor,
      },
      confidence: finalConfidence,
      
      // Additional properties
      probability: finalProbability,
      expectedValue,
      insightDetails,
    };
  } catch (error) {
    console.error(
      `Error calculating stolen base probability for batter ${batterId} in game ${gamePk}:`,
      error
    );

    // Return conservative default values
    return {
      // StolenBaseAnalysis required properties
      expectedSteals: 0.33, // Approximately one every 3 games
      stealAttemptProbability: 0.5, // 50% chance of attempting
      stealSuccessProbability: 0.67, // League average success rate
      factors: {
        batterSpeed: 5.0, // Average speed
        batterTendency: 5.0, // Average tendency
        catcherDefense: 5.0, // Average defense
        pitcherHoldRate: 5.0, // Average hold
        gameScriptFactor: 5.0, // Average game situation
      },
      confidence: 3, // Low confidence due to error
      
      // Additional properties
      probability: 0.67, // League average success rate
      expectedValue: 0.67 * 0.5 * 5 // Average expected points with 50% attempt likelihood
    };
  }
}

/**
 * Helper function to estimate sprint speed from stolen base metrics
 * This is a fallback when Statcast data is not available
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
 * Estimate pop time based on caught stealing percentage
 * This is a fallback when Statcast data is not available
 */
function estimatePopTime(caughtStealingPct: number): number {
  // League average pop time is ~2.0 seconds
  // CS% of 40% is very good, 20% is poor
  if (caughtStealingPct >= 40) return 1.85; // Elite
  if (caughtStealingPct >= 35) return 1.9;
  if (caughtStealingPct >= 30) return 1.95;
  if (caughtStealingPct >= 25) return 2.0; // Average
  if (caughtStealingPct >= 20) return 2.05;
  if (caughtStealingPct >= 15) return 2.1;
  return 2.15; // Poor
}

/**
 * Estimate arm strength based on caught stealing percentage
 * This is a fallback when Statcast data is not available
 */
function estimateArmStrength(caughtStealingPct: number): number {
  // League average arm strength is ~85 mph
  // CS% of 40% is very good, 20% is poor
  if (caughtStealingPct >= 40) return 87;
  if (caughtStealingPct >= 35) return 86;
  if (caughtStealingPct >= 30) return 85;
  if (caughtStealingPct >= 25) return 84;
  if (caughtStealingPct >= 20) return 83;
  if (caughtStealingPct >= 15) return 82;
  return 81;
}
