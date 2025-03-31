/**
 * Unified interface generated from 3 similar interfaces:
 * - PlayerStats (lib/mlb/types/core.ts)
 * - BatterStats (lib/mlb/types/player/batter.ts)
 * - PitcherStats (lib/mlb/types/player/pitcher.ts)
 */
export interface UnifiedPlayerStats {
  /** Present in 3/3 interfaces */
  id: number;
  /** Present in 3/3 interfaces */
  fullName: string;
  /** Present in 3/3 interfaces */
  currentTeam: string;
  /** Present in 3/3 interfaces */
  primaryPosition: string;
  /** Present in 2/3 interfaces */
  batSide?: string;
  /** Present in 2/3 interfaces */
  pitchHand?: string;
  /** Present in 3/3 interfaces */
  seasonStats: {
    gamesPlayed: number;
    // Batting stats
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    wOBAvsL?: number;
    wOBAvsR?: number;
    last30wOBA?: number;
    // Pitching stats
    era?: number;
    whip?: number;
    wins?: number;
    losses?: number;
    saves?: number;
    inningsPitched?: number;
    strikeouts?: number;
    walks?: number;
  } | BatterSeasonStats | {
    [season: string]: PitcherSeasonStats;
  };
  /** Present in 3/3 interfaces */
  careerStats: Array<{
    season: string;
    team: string;
    gamesPlayed: number;
    // Batting stats
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    // Pitching stats
    era?: number;
    whip?: number;
    wins?: number;
    losses?: number;
    saves?: number;
    inningsPitched?: number;
    strikeouts?: number;
    walks?: number;
  }> | Array<{
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
    hitByPitches: number;
    sacrificeFlies: number;
    walks: number;
    strikeouts: number;
    plateAppearances: number;
  }> | PitcherCareerStatsSeason[];
  /** Present in 3/3 interfaces */
  sourceTimestamp: Date;
  /** Present in 1/3 interfaces */
  lastGameStats?: BatterSeasonStats;
  /** Present in 1/3 interfaces */
  lastFiveGames?: BatterSeasonStats[];
}


/**
 * Adapter functions for converting between similar interfaces
 */

/**
 * Convert from PlayerStats to UnifiedPlayerStats
 */
export function PlayerStatsToUnifiedPlayerStats(source: PlayerStats): UnifiedPlayerStats {
  return {
    id: source.id,
    fullName: source.fullName,
    currentTeam: source.currentTeam,
    primaryPosition: source.primaryPosition,
    batSide: source.batSide,
    pitchHand: source.pitchHand,
    seasonStats: source.seasonStats,
    careerStats: source.careerStats,
    sourceTimestamp: source.sourceTimestamp,
  };
}

/**
 * Convert from UnifiedPlayerStats to PlayerStats
 */
export function UnifiedPlayerStatsToPlayerStats(source: UnifiedPlayerStats): PlayerStats {
  return {
    id: source.id ?? 0,
    fullName: source.fullName ?? "",
    currentTeam: source.currentTeam ?? "",
    primaryPosition: source.primaryPosition ?? "",
    batSide: source.batSide ?? "",
    pitchHand: source.pitchHand ?? "",
    seasonStats: source.seasonStats ?? 0,
    careerStats: source.careerStats ?? "",
    sourceTimestamp: source.sourceTimestamp ?? undefined,
  };
}

/**
 * Convert from BatterStats to UnifiedPlayerStats
 */
export function BatterStatsToUnifiedPlayerStats(source: BatterStats): UnifiedPlayerStats {
  return {
    id: source.id,
    fullName: source.fullName,
    currentTeam: source.currentTeam,
    primaryPosition: source.primaryPosition,
    batSide: source.batSide,
    seasonStats: source.seasonStats,
    careerStats: source.careerStats,
    lastGameStats: source.lastGameStats,
    lastFiveGames: source.lastFiveGames,
    sourceTimestamp: source.sourceTimestamp,
  };
}

/**
 * Convert from UnifiedPlayerStats to BatterStats
 */
export function UnifiedPlayerStatsToBatterStats(source: UnifiedPlayerStats): BatterStats {
  return {
    id: source.id ?? 0,
    fullName: source.fullName ?? "",
    currentTeam: source.currentTeam ?? "",
    primaryPosition: source.primaryPosition ?? "",
    batSide: source.batSide ?? "",
    seasonStats: source.seasonStats ?? undefined,
    careerStats: source.careerStats ?? "",
    lastGameStats: source.lastGameStats ?? undefined,
    lastFiveGames: source.lastFiveGames ?? [],
    sourceTimestamp: source.sourceTimestamp ?? undefined,
  };
}

/**
 * Convert from PitcherStats to UnifiedPlayerStats
 */
export function PitcherStatsToUnifiedPlayerStats(source: PitcherStats): UnifiedPlayerStats {
  return {
    id: source.id,
    fullName: source.fullName,
    currentTeam: source.currentTeam,
    primaryPosition: source.primaryPosition,
    pitchHand: source.pitchHand,
    seasonStats: source.seasonStats,
    careerStats: source.careerStats,
    sourceTimestamp: source.sourceTimestamp,
  };
}

/**
 * Convert from UnifiedPlayerStats to PitcherStats
 */
export function UnifiedPlayerStatsToPitcherStats(source: UnifiedPlayerStats): PitcherStats {
  return {
    id: source.id ?? 0,
    fullName: source.fullName ?? "",
    currentTeam: source.currentTeam ?? "",
    primaryPosition: source.primaryPosition ?? "",
    pitchHand: source.pitchHand ?? "",
    seasonStats: source.seasonStats ?? "",
    careerStats: source.careerStats ?? [],
    sourceTimestamp: source.sourceTimestamp ?? undefined,
  };
}

