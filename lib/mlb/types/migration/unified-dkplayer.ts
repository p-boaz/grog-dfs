/**
 * Unified interface generated from 2 similar interfaces:
 * - DKPlayer (lib/mlb/types/analysis/batter.ts)
 * - DraftKingsPlayer (lib/mlb/types/draftkings.ts)
 */
export interface UnifiedDKPlayer {
  /** Present in 2/2 interfaces */
  id: number;
  /** Present in 2/2 interfaces */
  name: string;
  /** Present in 2/2 interfaces */
  position: string;
  /** Present in 2/2 interfaces */
  salary: number;
  /** Present in 2/2 interfaces */
  avgPointsPerGame: number;
  /** Present in 2/2 interfaces */
  team: string;
  /** Present in 1/2 interfaces */
  lineupPosition?: number;
  /** Present in 1/2 interfaces */
  mlbId?: number;
}


/**
 * Adapter functions for converting between similar interfaces
 */

/**
 * Convert from DKPlayer to UnifiedDKPlayer
 */
export function DKPlayerToUnifiedDKPlayer(source: DKPlayer): UnifiedDKPlayer {
  return {
    id: source.id,
    name: source.name,
    position: source.position,
    salary: source.salary,
    avgPointsPerGame: source.avgPointsPerGame,
    team: source.team,
    lineupPosition: source.lineupPosition,
  };
}

/**
 * Convert from UnifiedDKPlayer to DKPlayer
 */
export function UnifiedDKPlayerToDKPlayer(source: UnifiedDKPlayer): DKPlayer {
  return {
    id: source.id ?? 0,
    name: source.name ?? "",
    position: source.position ?? "",
    salary: source.salary ?? 0,
    avgPointsPerGame: source.avgPointsPerGame ?? 0,
    team: source.team ?? "",
    lineupPosition: source.lineupPosition ?? 0,
  };
}

/**
 * Convert from DraftKingsPlayer to UnifiedDKPlayer
 */
export function DraftKingsPlayerToUnifiedDKPlayer(source: DraftKingsPlayer): UnifiedDKPlayer {
  return {
    mlbId: source.mlbId,
    id: source.id,
    name: source.name,
    position: source.position,
    salary: source.salary,
    avgPointsPerGame: source.avgPointsPerGame,
    team: source.team,
  };
}

/**
 * Convert from UnifiedDKPlayer to DraftKingsPlayer
 */
export function UnifiedDKPlayerToDraftKingsPlayer(source: UnifiedDKPlayer): DraftKingsPlayer {
  return {
    mlbId: source.mlbId ?? 0,
    id: source.id ?? 0,
    name: source.name ?? "",
    position: source.position ?? "",
    salary: source.salary ?? 0,
    avgPointsPerGame: source.avgPointsPerGame ?? 0,
    team: source.team ?? "",
  };
}

