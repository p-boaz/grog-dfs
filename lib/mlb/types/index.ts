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

// Legacy type aliases maintained for backward compatibility
// These make migration easier by providing shortcuts to commonly used types

/**
 * @deprecated Use Api.GameFeedApiResponse instead 
 */
export type GameFeedResponse = Api.GameFeedApiResponse;

/**
 * @deprecated Use Api.GameBoxScoreApiResponse instead
 */
export type GameBoxScoreResponse = Api.GameBoxScoreApiResponse;

/**
 * @deprecated Use Api.ScheduleApiResponse instead
 */
export type MLBScheduleResponse = Api.ScheduleApiResponse;

/**
 * @deprecated Use Domain types instead
 */
export type MLBGame = Api.GameFeedApiResponse;

/**
 * @deprecated Use Domain types instead
 */
export type GameEnvironmentData = Api.GameEnvironmentApiResponse;

/**
 * @deprecated Use Domain types instead
 */
export type ProbableLineup = Record<string, any>;

// Type aliases for core domain objects  
export type MLBWeatherData = Record<string, any>;
export type DetailedWeatherInfo = Record<string, any>;
export type DailyMLBData = Record<string, any>;

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