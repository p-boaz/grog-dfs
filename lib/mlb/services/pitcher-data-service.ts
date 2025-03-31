import { PitcherStatcastData, PitchUsage } from "../types/statcast";
import { PitcherSeasonStats, PitcherCareerStatsSeason } from "../types/player/pitcher";
import { getPitcherStats } from "../player/pitcher-stats";
import { getPitcherStatcastData } from "../savant";

/**
 * Enhanced pitcher data that combines MLB API and Savant data
 */
export interface EnhancedPitcherData {
  // Basic player info
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  throwsHand: string;

  // Season stats from MLB API
  seasonStats: PitcherSeasonStats & {
    holds?: number;
    blownSaves?: number;
    completeGames?: number;
    shutouts?: number;
    battersFaced?: number;
    hits?: number;
    kRate?: number;
    bbRate?: number;
    hrRate?: number;
    babip?: number;
    fip?: number;
    xFIP?: number;
  };

  // Career stats from MLB API
  careerStats: PitcherCareerStatsSeason[];

  // Game-specific stats if available
  lastGameStats?: any;
  lastFiveGames?: any[];

  // Pitch mix and velocity data from Savant
  pitchData?: {
    pitchTypes: PitchUsage;
    velocities: {
      avgFastball: number;
      maxFastball: number;
      avgBreaking: number;
      avgOffspeed: number;
    };
    movement: {
      horizontalBreak: number;
      verticalBreak: number;
      spinRate: number;
    };
  };

  // Control and command metrics from Savant
  controlMetrics?: {
    zoneRate: number;
    firstPitchStrike: number;
    whiffRate: number;
    chaseRate: number;
    cswRate: number;
    edgePercent: number;
    zoneContactRate: number;
    chaseContactRate: number;
  };

  // Results metrics from Savant
  resultMetrics?: {
    hardHitPercent: number;
    avgExitVelocity: number;
    barrelRate: number;
    expectedERA: number;
    expectedWOBA: number;
  };
}

/**
 * Get enhanced pitcher data combining MLB API stats and Savant metrics
 *
 * @param pitcherId MLB player ID
 * @param season Current season year (defaults to current year)
 * @returns Enhanced pitcher data
 */
export async function getEnhancedPitcherData(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<EnhancedPitcherData> {
  // Fetch both data sources concurrently
  const [baseStats, statcastData] = await Promise.all([
    getPitcherStats({ pitcherId, season }),
    getPitcherStatcastData({ pitcherId, season }).catch((error) => {
      console.warn(
        `Could not fetch Statcast data for pitcher ${pitcherId}: ${error.message}`
      );
      return null;
    }),
  ]);

  if (!baseStats) {
    throw new Error(`No pitcher stats found for pitcher ${pitcherId}`);
  }

  // Create a properly shaped seasonStats object from the base stats
  // Ensuring all required properties are present
  const seasonYear = season.toString();
  const rawSeasonStats = baseStats.seasonStats[seasonYear] || {};

  // Cast the rawSeasonStats to a known type for safer access
  interface PitcherRawSeasonStats {
    gamesPlayed?: number;
    gamesStarted?: number;
    inningsPitched?: number;
    wins?: number;
    losses?: number;
    era?: number;
    whip?: number;
    strikeouts?: number;
    walks?: number;
    saves?: number;
    homeRunsAllowed?: number;
    hitBatsmen?: number;
    holds?: number;
    blownSaves?: number;
    completeGames?: number;
    shutouts?: number;
    battersFaced?: number;
    hits?: number;
    kRate?: number;
    bbRate?: number;
    hrRate?: number;
    babip?: number;
    fip?: number;
    xFIP?: number;
  }

  const typedRawStats = rawSeasonStats as PitcherRawSeasonStats;

  const seasonStats: EnhancedPitcherData["seasonStats"] = {
    gamesPlayed: typedRawStats.gamesPlayed || 0,
    gamesStarted: typedRawStats.gamesStarted || 0,
    inningsPitched: typedRawStats.inningsPitched || 0,
    wins: typedRawStats.wins || 0,
    losses: typedRawStats.losses || 0,
    era: typedRawStats.era || 0,
    whip: typedRawStats.whip || 0,
    strikeouts: typedRawStats.strikeouts || 0,
    walks: typedRawStats.walks || 0,
    saves: typedRawStats.saves || 0,
    homeRunsAllowed: typedRawStats.homeRunsAllowed || 0,
    hitBatsmen: typedRawStats.hitBatsmen || 0, // Required in PitcherSeasonStats
    // Optional properties
    holds: typedRawStats.holds,
    blownSaves: typedRawStats.blownSaves,
    completeGames: typedRawStats.completeGames,
    shutouts: typedRawStats.shutouts,
    battersFaced: typedRawStats.battersFaced,
    hits: typedRawStats.hits,
    kRate: typedRawStats.kRate,
    bbRate: typedRawStats.bbRate,
    hrRate: typedRawStats.hrRate,
    babip: typedRawStats.babip,
    fip: typedRawStats.fip,
    xFIP: typedRawStats.xFIP,
  };

  // Ensure career stats are properly mapped
  const careerStats =
    baseStats.careerStats?.map((season) => ({
      season: season.season,
      team: season.team,
      gamesPlayed: season.gamesPlayed,
      gamesStarted: season.gamesStarted,
      inningsPitched: season.inningsPitched,
      wins: season.wins,
      losses: season.losses,
      era: season.era,
      whip: season.whip,
      strikeouts: season.strikeouts,
      walks: season.walks,
      saves: season.saves,
      homeRunsAllowed: season.homeRunsAllowed || 0, // Ensure this is not undefined
      hitBatsmen: season.hitBatsmen || 0, // Required in PitcherCareerStatsSeason
    })) || [];

  const enhancedData: EnhancedPitcherData = {
    id: pitcherId,
    fullName: baseStats.fullName,
    currentTeam: baseStats.currentTeam,
    primaryPosition: baseStats.primaryPosition,
    throwsHand: baseStats.pitchHand,
    seasonStats,
    careerStats,
  };

  // Add game-specific stats if available
  if ("lastGameStats" in baseStats && baseStats.lastGameStats) {
    enhancedData.lastGameStats = baseStats.lastGameStats;
  }

  if ("lastFiveGames" in baseStats && baseStats.lastFiveGames) {
    enhancedData.lastFiveGames = baseStats.lastFiveGames as any[];
  }

  // Add Statcast metrics if available
  if (statcastData) {
    // Add pitch mix data
    enhancedData.pitchData = {
      pitchTypes: {
        fastball: statcastData.pitches.fastball,
        slider: statcastData.pitches.slider,
        curve: statcastData.pitches.curve,
        changeup: statcastData.pitches.changeup,
        sinker: statcastData.pitches.sinker,
        cutter: statcastData.pitches.cutter,
        splitter: statcastData.pitches.splitter,
        sweep: statcastData.pitches.sweep || 0, // Add missing properties from PitchUsage
        fork: statcastData.pitches.fork || 0, 
        knuckle: statcastData.pitches.knuckle || 0,
        other: statcastData.pitches.other,
      },
      velocities: {
        avgFastball: getAverageFastballVelocity(statcastData),
        maxFastball: getMaxFastballVelocity(statcastData),
        avgBreaking: getAverageBreakingVelocity(statcastData),
        avgOffspeed: getAverageOffspeedVelocity(statcastData),
      },
      movement: {
        horizontalBreak: statcastData.movement_metrics.horizontal_break,
        verticalBreak: statcastData.movement_metrics.induced_vertical_break,
        spinRate: getAverageSpinRate(statcastData),
      },
    };

    // Add control metrics
    enhancedData.controlMetrics = {
      zoneRate: statcastData.control_metrics.zone_rate,
      firstPitchStrike: statcastData.control_metrics.first_pitch_strike,
      whiffRate: statcastData.control_metrics.whiff_rate,
      chaseRate: statcastData.control_metrics.chase_rate,
      cswRate: statcastData.control_metrics.csw_rate,
      edgePercent: statcastData.control_metrics.edge_percent || 0,
      zoneContactRate: statcastData.control_metrics.zone_contact_rate || 0,
      chaseContactRate: statcastData.control_metrics.chase_contact_rate || 0,
    };

    // Add result metrics
    enhancedData.resultMetrics = {
      hardHitPercent: statcastData.result_metrics.hard_hit_percent,
      avgExitVelocity: 0, // Not directly available in the provided interface
      barrelRate: 0, // Not directly available in the provided interface
      expectedERA: 0, // Not directly available in the provided interface
      expectedWOBA: statcastData.result_metrics.expected_woba,
    };
  }

  return enhancedData;
}

/**
 * Helper functions to extract velocity data from Statcast data
 */
function getAverageFastballVelocity(data: PitcherStatcastData): number {
  // Look for fastball-type pitches in the pitch mix
  const fastballs = data.pitch_mix.filter((pitch) =>
    ["FF", "FT", "FC", "SI"].includes(pitch.pitch_type)
  );

  if (fastballs.length === 0) return 93; // Default value

  // Calculate weighted average based on usage
  const totalUsage = fastballs.reduce((sum, pitch) => sum + pitch.count, 0);
  const weightedVelocity = fastballs.reduce(
    (sum, pitch) => sum + pitch.velocity * pitch.count,
    0
  );

  return totalUsage > 0 ? weightedVelocity / totalUsage : 93;
}

function getMaxFastballVelocity(data: PitcherStatcastData): number {
  // Look at velocity trends for max velocity
  if (data.velocity_trends && data.velocity_trends.length > 0) {
    const fastballTrends = data.velocity_trends.filter((trend) =>
      ["FF", "FT", "FC", "SI"].includes(trend.pitch_type)
    );

    if (fastballTrends.length > 0) {
      // Find max velocity among all tracked fastballs
      return Math.max(...fastballTrends.map((trend) => trend.max_velocity));
    }
  }

  // If no trend data, estimate based on average velocity
  return getAverageFastballVelocity(data) + 2.5; // Max is typically ~2-3 mph higher
}

function getAverageBreakingVelocity(data: PitcherStatcastData): number {
  // Look for breaking-type pitches in the pitch mix
  const breakingPitches = data.pitch_mix.filter((pitch) =>
    ["SL", "CU", "KC", "SC", "SV"].includes(pitch.pitch_type)
  );

  if (breakingPitches.length === 0) return 83; // Default value

  // Calculate weighted average based on usage
  const totalUsage = breakingPitches.reduce(
    (sum, pitch) => sum + pitch.count,
    0
  );
  const weightedVelocity = breakingPitches.reduce(
    (sum, pitch) => sum + pitch.velocity * pitch.count,
    0
  );

  return totalUsage > 0 ? weightedVelocity / totalUsage : 83;
}

function getAverageOffspeedVelocity(data: PitcherStatcastData): number {
  // Look for offspeed-type pitches in the pitch mix
  const offspeedPitches = data.pitch_mix.filter((pitch) =>
    ["CH", "FS", "KN", "FO"].includes(pitch.pitch_type)
  );

  if (offspeedPitches.length === 0) return 84; // Default value

  // Calculate weighted average based on usage
  const totalUsage = offspeedPitches.reduce(
    (sum, pitch) => sum + pitch.count,
    0
  );
  const weightedVelocity = offspeedPitches.reduce(
    (sum, pitch) => sum + pitch.velocity * pitch.count,
    0
  );

  return totalUsage > 0 ? weightedVelocity / totalUsage : 84;
}

function getAverageSpinRate(data: PitcherStatcastData): number {
  // Calculate weighted average spin rate across all pitches
  const allPitches = data.pitch_mix;

  if (allPitches.length === 0) return 2200; // Default value

  const totalUsage = allPitches.reduce((sum, pitch) => sum + pitch.count, 0);
  const weightedSpinRate = allPitches.reduce(
    (sum, pitch) => sum + pitch.spin_rate * pitch.count,
    0
  );

  return totalUsage > 0 ? weightedSpinRate / totalUsage : 2200;
}
