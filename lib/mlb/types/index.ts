/**
 * MLB Type System - Main Export
 * 
 * This file provides the central entry point for all MLB type definitions.
 * It exposes a three-layer type system:
 * 
 * 1. API Layer: Raw API response types
 * 2. Domain Layer: Normalized domain objects
 * 3. Analysis Layer: DFS-specific types
 * 
 * This structure promotes proper separation of concerns while allowing
 * for a gradual migration path from the old type system.
 */

// API Types - Raw API response types matching real data
import * as Api from './api';
export { Api };

// Domain Types - Normalized business objects
import * as Domain from './domain';
export { Domain };

// Analysis Types - DFS-specific types
import * as Analysis from './analysis';
export { Analysis };

// Legacy re-exports for backward compatibility
// These will be maintained during the migration period
export * from './core';

export type {
  MLBGame,
  GameFeedResponse,
  GameBoxScoreResponse,
  GameSchedule,
  MLBScheduleResponse,
  PlayerGameStats,
  GameEnvironmentData,
  ProbableLineup,
  DailyMLBData,
  DetailedWeatherInfo,
  MLBWeatherData
} from './game';

export type {
  DraftKingsCSVEntry,
  DraftKingsPlayer,
  DraftKingsMapping,
  DraftKingsScoringRules
} from './draftkings';

// Re-export DraftKingsInfo with a different name to avoid conflict
export type { DraftKingsInfo as DKPlayerInfo } from './draftkings';

// Player types - explicitly export to avoid ambiguity with other modules
export type {
  // Batter types
  BatterSeasonStats,
  BatterStats,
  BatterStatsResponse,
  BatterPlateDiscipline,
  BatterSplits,
  MLBBatter,
  PlayerSBSeasonStats,
  PlayerSBCareerProfile,
  StolenBaseProjection,
  StolenBaseContext,
  
  // Pitcher types
  PitcherStats,
  PitcherSeasonStats,
  PitcherPitchMixData,
  PitcherBatterMatchup
} from './player';

// Adjust imports for missing or renamed types
export type {
  PitcherCareerStatsSeason as PitcherCareerStats,
  PitcherHoldMetrics as PitcherControlMetrics,
  MatchupStats as PlayerMatchupStats
} from './player';

// Export convenience types and functions
// These make migration easier by providing shortcuts to commonly used types

/**
 * @deprecated Use Domain.Batter instead
 * Type alias for backward compatibility
 */
export type Batter = Domain.Batter;

/**
 * @deprecated Use Domain.Pitcher instead
 * Type alias for backward compatibility
 */
export type Pitcher = Domain.Pitcher;

/**
 * @deprecated Use Domain.Game instead
 * Type alias for backward compatibility
 */
export type Game = Domain.Game;

/**
 * @deprecated Use Analysis.BatterProjection instead
 * Type alias for backward compatibility
 */
export type BatterProjection = Analysis.BatterProjection;

/**
 * @deprecated Use Analysis.PitcherProjection instead
 * Type alias for backward compatibility 
 */
export type PitcherProjection = Analysis.PitcherProjection;