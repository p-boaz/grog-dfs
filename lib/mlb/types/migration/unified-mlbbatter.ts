/**
 * Unified interface generated from 2 similar interfaces:
 * - MLBBatter (lib/mlb/types/player/batter.ts)
 * - MLBPitcher (lib/mlb/types/player/index.ts)
 */
export interface UnifiedMLBBatter {
  /** Present in 1/2 interfaces */
  batterId?: number;
  /** Present in 2/2 interfaces */
  name: string;
  /** Present in 2/2 interfaces */
  team: string;
  /** Present in 2/2 interfaces */
  teamId: number;
  /** Present in 2/2 interfaces */
  position: string;
  /** Present in 2/2 interfaces */
  handedness: string;
  /** Present in 2/2 interfaces */
  stats: {
    seasons: Record<string, BatterSeasonStats>;
  } | {
    seasons: Record<string, import('./pitcher').PitcherSeasonStats>;
  };
  /** Present in 1/2 interfaces */
  pitcherId?: number;
}


/**
 * Adapter functions for converting between similar interfaces
 */

/**
 * Convert from MLBBatter to UnifiedMLBBatter
 */
export function MLBBatterToUnifiedMLBBatter(source: MLBBatter): UnifiedMLBBatter {
  return {
    batterId: source.batterId,
    name: source.name,
    team: source.team,
    teamId: source.teamId,
    position: source.position,
    handedness: source.handedness,
    stats: source.stats,
  };
}

/**
 * Convert from UnifiedMLBBatter to MLBBatter
 */
export function UnifiedMLBBatterToMLBBatter(source: UnifiedMLBBatter): MLBBatter {
  return {
    batterId: source.batterId ?? 0,
    name: source.name ?? "",
    team: source.team ?? "",
    teamId: source.teamId ?? 0,
    position: source.position ?? "",
    handedness: source.handedness ?? "",
    stats: source.stats ?? "",
  };
}

/**
 * Convert from MLBPitcher to UnifiedMLBBatter
 */
export function MLBPitcherToUnifiedMLBBatter(source: MLBPitcher): UnifiedMLBBatter {
  return {
    pitcherId: source.pitcherId,
    name: source.name,
    team: source.team,
    teamId: source.teamId,
    position: source.position,
    handedness: source.handedness,
    stats: source.stats,
  };
}

/**
 * Convert from UnifiedMLBBatter to MLBPitcher
 */
export function UnifiedMLBBatterToMLBPitcher(source: UnifiedMLBBatter): MLBPitcher {
  return {
    pitcherId: source.pitcherId ?? 0,
    name: source.name ?? "",
    team: source.team ?? "",
    teamId: source.teamId ?? 0,
    position: source.position ?? "",
    handedness: source.handedness ?? "",
    stats: source.stats ?? "",
  };
}

