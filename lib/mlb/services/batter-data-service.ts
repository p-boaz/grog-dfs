import { getBatterStats } from "../player/batter-stats";
import { getBatterStatcastData } from "../savant";
import { BatterSeasonStats, BatterStats as LegacyBatterStats } from "../types/player/batter"; // Legacy types
import { BatterStatcastData } from "../types/statcast";
import { Batter, BatterStats } from "../types/domain/player";

/**
 * Enhanced batter data that combines MLB API and Savant data
 */
export interface EnhancedBatterData {
  // Basic player info
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  batSide: string;

  // Season stats from MLB API
  seasonStats: BatterSeasonStats & {
    wOBA?: number;
    iso?: number;
    babip?: number;
    kRate?: number;
    bbRate?: number;
    hrRate?: number;
    sbRate?: number;
  };

  // Career stats from MLB API
  careerStats: Array<{
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
  }>;

  // Game-specific stats if available
  lastGameStats?: any;
  lastFiveGames?: any[];

  // Quality metrics from Savant
  qualityMetrics?: {
    barrelRate: number;
    exitVelocity: number;
    hardHitRate: number;
    sweetSpotRate: number;
    expectedStats: {
      xBA: number;
      xSLG: number;
      xwOBA: number;
    };
  };

  // Running metrics from Statcast
  runningMetrics?: {
    sprintSpeed: number; // ft/sec
    homeToFirst: number; // seconds
    bolts: number; // Number of 30+ ft/sec runs (elite speed)
  };

  // Platoon splits from Savant
  platoonSplits?: {
    vsLeft: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
      woba: number;
    };
    vsRight: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
      woba: number;
    };
  };
}

/**
 * Get enhanced batter data combining MLB API stats and Savant metrics
 *
 * @param batterId MLB player ID
 * @param season Current season year (defaults to current year)
 * @returns Enhanced batter data
 */
export async function getEnhancedBatterData(
  batterId: number,
  season = new Date().getFullYear()
): Promise<EnhancedBatterData> {
  // Fetch both data sources concurrently
  const [batter, statcastData] = await Promise.all([
    getBatterStats({ batterId, season }),
    getBatterStatcastData({ batterId, season }).catch((error) => {
      console.warn(
        `Could not fetch Statcast data for batter ${batterId}: ${error.message}`
      );
      return null;
    }),
  ]);

  // Start with the base stats from MLB API
  // Note: This uses the new domain model batter, but maintains 
  // the EnhancedBatterData legacy structure for compatibility
  const enhancedData: EnhancedBatterData = {
    id: batterId,
    fullName: batter.fullName,
    currentTeam: batter.team,
    primaryPosition: batter.position,
    batSide: batter.handedness,
    // Convert from domain model to the expected seasonStats format
    seasonStats: {
      gamesPlayed: batter.currentSeason.gamesPlayed,
      atBats: batter.currentSeason.atBats,
      hits: batter.currentSeason.hits,
      doubles: batter.currentSeason.doubles,
      triples: batter.currentSeason.triples,
      homeRuns: batter.currentSeason.homeRuns,
      rbi: batter.currentSeason.rbi,
      rbis: batter.currentSeason.rbi, // For backward compatibility
      walks: batter.currentSeason.walks,
      strikeouts: batter.currentSeason.strikeouts,
      stolenBases: batter.currentSeason.stolenBases,
      avg: batter.currentSeason.avg,
      obp: batter.currentSeason.obp,
      slg: batter.currentSeason.slg,
      ops: batter.currentSeason.ops,
      runs: batter.currentSeason.runs,
      hitByPitches: batter.currentSeason.hitByPitches,
      sacrificeFlies: batter.currentSeason.sacrificeFlies,
      plateAppearances: batter.currentSeason.plateAppearances,
      caughtStealing: batter.currentSeason.caughtStealing,
      // Add calculated metrics
      wOBA: batter.currentSeason.wOBA,
      iso: batter.currentSeason.iso,
      babip: batter.currentSeason.babip,
      kRate: batter.currentSeason.kRate,
      bbRate: batter.currentSeason.bbRate,
      hrRate: batter.currentSeason.hrRate,
      sbRate: batter.currentSeason.sbRate
    },
    // Convert career stats to expected format - Type-safe version
    careerStats: Object.entries(batter.careerByYear).map(([year, seasonStats]) => {
      // Add explicit typing to fix "unknown" type issue
      const typedStats = seasonStats as BatterStats;
      return {
        season: year,
        team: '',  // Not available in all domain models
        gamesPlayed: typedStats.gamesPlayed,
        atBats: typedStats.atBats,
        hits: typedStats.hits,
        homeRuns: typedStats.homeRuns,
        rbi: typedStats.rbi,
        avg: typedStats.avg,
        obp: typedStats.obp,
        slg: typedStats.slg,
        ops: typedStats.ops,
        stolenBases: typedStats.stolenBases,
        caughtStealing: typedStats.caughtStealing
      };
    }),
  };

  // Add game-specific stats if available
  // Note: These are not part of the new domain model, so we check for them and populate if found
  if ("lastGameStats" in batter && (batter as any).lastGameStats) {
    enhancedData.lastGameStats = (batter as any).lastGameStats;
  }

  if ("lastFiveGames" in batter && Array.isArray((batter as any).lastFiveGames)) {
    enhancedData.lastFiveGames = (batter as any).lastFiveGames;
  }

  // Add Statcast quality metrics if available
  if (statcastData) {
    enhancedData.qualityMetrics = {
      barrelRate: statcastData.batting_metrics.barrel_percent,
      exitVelocity: statcastData.batting_metrics.exit_velocity_avg,
      hardHitRate: statcastData.batting_metrics.hard_hit_percent,
      sweetSpotRate: statcastData.batting_metrics.sweet_spot_percent,
      expectedStats: {
        xBA: statcastData.batting_metrics.xwoba || 0, // Not all stats may be available
        xSLG: statcastData.batting_metrics.xwoba || 0, // Using xwOBA as fallback
        xwOBA: statcastData.batting_metrics.xwoba || 0,
      },
    };

    // Add running metrics if available in Statcast data
    if (statcastData.running_metrics) {
      enhancedData.runningMetrics = {
        sprintSpeed:
          statcastData.running_metrics.sprint_speed ||
          estimateSprintSpeed(enhancedData.seasonStats),
        homeToFirst: statcastData.running_metrics.home_to_first || 0,
        bolts: statcastData.running_metrics.bolts || 0,
      };
    } else if (enhancedData.seasonStats.stolenBases > 0) {
      // If no Statcast running data but player has stolen bases, estimate sprint speed
      enhancedData.runningMetrics = {
        sprintSpeed: estimateSprintSpeed(enhancedData.seasonStats),
        homeToFirst: 0,
        bolts: 0,
      };
    }

    // Add platoon splits if available
    if (statcastData.platoon_splits) {
      enhancedData.platoonSplits = {
        vsLeft: statcastData.platoon_splits.vs_left,
        vsRight: statcastData.platoon_splits.vs_right,
      };
    }
  }

  return enhancedData;
}

/**
 * Helper function to estimate sprint speed when Statcast data is unavailable
 * Based on stolen base metrics and player profile
 */
function estimateSprintSpeed(stats: EnhancedBatterData["seasonStats"] | BatterStats): number {
  if (!stats) return 27.0; // League average default

  // Calculate stolen base rate per game
  const sbRate =
    stats.gamesPlayed && stats.gamesPlayed > 0 && stats.stolenBases ? 
    stats.stolenBases / stats.gamesPlayed : 0;

  // Calculate success rate
  const stolenBases = stats.stolenBases || 0;
  const caughtStealing = stats.caughtStealing || 0;
  const attempts = stolenBases + caughtStealing;
  const successRate = attempts > 0 ? stolenBases / attempts : 0;

  // League average sprint speed is ~27 ft/sec
  let estimatedSpeed = 27.0;

  // Adjust based on SB frequency
  if (sbRate > 0.3) estimatedSpeed += 2.0; // Elite frequency
  else if (sbRate > 0.2) estimatedSpeed += 1.5;
  else if (sbRate > 0.1) estimatedSpeed += 1.0;
  else if (sbRate < 0.05 && stats.gamesPlayed && stats.gamesPlayed > 20) estimatedSpeed -= 0.5;

  // Adjust based on success rate with volume
  if (successRate > 0.85 && stolenBases >= 10)
    estimatedSpeed += 1.0; // Efficient with volume
  else if (successRate < 0.65 && stolenBases >= 5) estimatedSpeed -= 0.5; // Inefficient with volume

  // Extra boost for players with high triple rates (speed indicator)
  const tripleRate = stats.atBats && stats.atBats > 0 ? (stats.triples || 0) / stats.atBats : 0;
  if (tripleRate > 0.01) estimatedSpeed += 0.5;

  // Ensure within reasonable range (23-31 ft/sec is MLB range)
  return Math.min(31.0, Math.max(23.0, estimatedSpeed));
}

/**
 * Helper function to estimate batter barrel rate when Statcast data is unavailable
 * Based on power metrics from standard stats
 */
export function estimateBarrelRate(
  stats: EnhancedBatterData["seasonStats"] | BatterStats
): number {
  if (!stats) return 0.05; // League average default

  // Calculate ISO (Isolated Power) if not provided
  const iso = stats.iso || stats.slg - stats.avg;

  // Use ISO to estimate barrel rate - these are approximate values
  if (iso > 0.25) return 0.12; // Power hitters
  if (iso > 0.2) return 0.09; // Above average power
  if (iso > 0.15) return 0.07; // Average power
  if (iso > 0.1) return 0.05; // Below average power
  return 0.03; // Contact hitters
}

/**
 * Helper function to estimate exit velocity when Statcast data is unavailable
 */
export function estimateExitVelocity(
  stats: EnhancedBatterData["seasonStats"] | BatterStats
): number {
  if (!stats) return 88; // League average default

  // Calculate ISO if not provided
  const iso = stats.iso || stats.slg - stats.avg;

  // Estimate exit velocity based on ISO and batting average
  let estimatedEV = 88; // Start with league average

  // Adjust for power (ISO)
  if (iso > 0.25) estimatedEV += 4;
  else if (iso > 0.2) estimatedEV += 3;
  else if (iso > 0.15) estimatedEV += 2;
  else if (iso > 0.1) estimatedEV += 1;
  else if (iso < 0.08) estimatedEV -= 1;

  // Adjust for contact ability (AVG)
  if (stats.avg > 0.3) estimatedEV += 1;
  else if (stats.avg < 0.23) estimatedEV -= 1;

  return estimatedEV;
}
