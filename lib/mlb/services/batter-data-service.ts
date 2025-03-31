import { getBatterStats } from "../player/batter-stats";
import { getBatterStatcastData } from "../savant";

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
  seasonStats: {
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
    runs: number;
    doubles: number;
    triples: number;
    walks: number;
    strikeouts: number;
    sacrificeFlies: number;
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
  const [baseStats, statcastData] = await Promise.all([
    getBatterStats({ batterId, season }),
    getBatterStatcastData({ batterId, season }).catch((error) => {
      console.warn(
        `Could not fetch Statcast data for batter ${batterId}: ${error.message}`
      );
      return null;
    }),
  ]);

  // Start with the base stats from MLB API
  const enhancedData: EnhancedBatterData = {
    id: batterId,
    fullName: baseStats.fullName,
    currentTeam: baseStats.currentTeam,
    primaryPosition: baseStats.primaryPosition,
    batSide: baseStats.batSide,
    seasonStats: baseStats.seasonStats,
    careerStats: baseStats.careerStats,
  };

  // Add game-specific stats if available
  if ("lastGameStats" in baseStats && baseStats.lastGameStats) {
    enhancedData.lastGameStats = baseStats.lastGameStats;
  }

  if ("lastFiveGames" in baseStats && Array.isArray(baseStats.lastFiveGames)) {
    enhancedData.lastFiveGames = baseStats.lastFiveGames;
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
 * Helper function to estimate batter barrel rate when Statcast data is unavailable
 * Based on power metrics from standard stats
 */
export function estimateBarrelRate(
  stats: EnhancedBatterData["seasonStats"]
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
  stats: EnhancedBatterData["seasonStats"]
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
