/**
 * Quality metrics calculator for batters and pitchers
 * Used to determine the overall quality of a player for DFS projections
 */

import { BatterQualityMetrics } from "../../types/analysis";
import { BatterStats, isBatterStats } from "../../types/domain/player";

/**
 * Calculate quality metrics for a batter based on current season stats
 * @param stats Batter statistics
 * @returns BatterQualityMetrics object with scores from 0-1
 */
export function calculateQualityMetrics(
  stats: BatterStats
): BatterQualityMetrics {
  try {
    // Validate stats object with type guard
    if (!isBatterStats(stats)) {
      console.warn("Invalid batter stats provided to calculateQualityMetrics");
      return getDefaultQualityMetrics();
    }

    // Calculate batted ball quality (based on BABIP and ISO)
    const babip = stats.babip || 0;
    const iso = stats.iso || 0;
    const battedBallQuality = calculateBattedBallQuality(babip, iso);

    // Calculate power metrics (based on HR rate and ISO)
    const hrRate = stats.hrRate || 0;
    const powerMetrics = calculatePowerMetrics(hrRate, iso);

    // Calculate contact rate (based on K rate and batting avg)
    const kRate = stats.kRate || 0;
    const avg = stats.avg || 0;
    const contactRate = calculateContactRate(kRate, avg);

    // Calculate plate approach (based on BB rate and OBP)
    const bbRate = stats.bbRate || 0;
    const obp = stats.obp || 0;
    const plateApproach = calculatePlateApproach(bbRate, obp);

    // Calculate speed metrics (based on SB rate and triples)
    const sbRate = stats.sbRate || 0;
    const triples = stats.triples || 0;
    const gamesPlayed = stats.gamesPlayed || 1;
    const triplesRate = triples / gamesPlayed;
    const speedScore = calculateSpeedScore(sbRate, triplesRate);

    // Calculate consistency score (0-100 scale)
    const consistency = calculateConsistencyScore(stats);

    return {
      battedBallQuality,
      power: powerMetrics,
      contactRate,
      plateApproach,
      speed: speedScore,
      consistency,
    };
  } catch (error) {
    console.error("Error calculating quality metrics:", error);
    return getDefaultQualityMetrics();
  }
}

/**
 * Get default quality metrics for fallback
 */
function getDefaultQualityMetrics(): BatterQualityMetrics {
  return {
    battedBallQuality: 0.3,
    power: 0.3,
    contactRate: 0.3,
    plateApproach: 0.3,
    speed: 0.3,
    consistency: 30,
  };
}

/**
 * Calculate batted ball quality score (0-1 scale)
 */
function calculateBattedBallQuality(babip: number, iso: number): number {
  // BABIP ranges typically from .250 to .350
  // ISO ranges typically from .100 to .250
  const babipScore = Math.min(Math.max((babip - 0.25) / 0.1, 0), 1);
  const isoScore = Math.min(Math.max((iso - 0.1) / 0.15, 0), 1);

  // Combined score with higher weight on BABIP
  return babipScore * 0.6 + isoScore * 0.4;
}

/**
 * Calculate power metrics score (0-1 scale)
 */
function calculatePowerMetrics(hrRate: number, iso: number): number {
  // HR rate typically ranges from 0.01 to 0.08
  // ISO ranges typically from .100 to .250
  const hrRateScore = Math.min(Math.max((hrRate - 0.01) / 0.07, 0), 1);
  const isoScore = Math.min(Math.max((iso - 0.1) / 0.15, 0), 1);

  // Combined score with higher weight on HR rate
  return hrRateScore * 0.7 + isoScore * 0.3;
}

/**
 * Calculate contact rate score (0-1 scale)
 */
function calculateContactRate(kRate: number, avg: number): number {
  // K rate typically ranges from 0.10 to 0.30 (lower is better)
  // Batting average typically ranges from .220 to .320
  const kRateScore = Math.min(Math.max(1 - (kRate - 0.1) / 0.2, 0), 1);
  const avgScore = Math.min(Math.max((avg - 0.22) / 0.1, 0), 1);

  // Combined score with higher weight on K rate
  return kRateScore * 0.6 + avgScore * 0.4;
}

/**
 * Calculate plate approach score (0-1 scale)
 */
function calculatePlateApproach(bbRate: number, obp: number): number {
  // BB rate typically ranges from 0.05 to 0.15
  // OBP typically ranges from .300 to .400
  const bbRateScore = Math.min(Math.max((bbRate - 0.05) / 0.1, 0), 1);
  const obpScore = Math.min(Math.max((obp - 0.3) / 0.1, 0), 1);

  // Combined score with equal weight
  return bbRateScore * 0.5 + obpScore * 0.5;
}

/**
 * Calculate speed score (0-1 scale)
 */
function calculateSpeedScore(sbRate: number, triplesRate: number): number {
  // SB success rate typically ranges from 0.6 to 0.9
  // Triples rate typically very low, around 0 to 0.05 per game
  const sbRateScore = Math.min(Math.max((sbRate - 0.6) / 0.3, 0), 1);
  const triplesRateScore = Math.min(Math.max(triplesRate / 0.05, 0), 1);

  // Combined score with higher weight on SB rate
  return sbRateScore * 0.7 + triplesRateScore * 0.3;
}

/**
 * Calculate consistency score (0-100 scale)
 */
function calculateConsistencyScore(stats: BatterStats): number {
  // This would ideally use variance in game-to-game stats
  // For now, use a simple model where more games played = more reliable data
  const gamesPlayed = stats.gamesPlayed || 0;

  // Score based on games played, maxing out at 100 games
  const baseScore = Math.min(gamesPlayed / 100, 1) * 80;

  // Add small bonus for overall contact rate
  const contactBonus = (1 - (stats.kRate || 0.2)) * 20;

  return Math.round(baseScore + contactBonus);
}