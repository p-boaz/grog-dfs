/**
 * MLB Type Definitions - Main Export File
 *
 * This file re-exports all MLB-related type definitions for easier imports.
 * Import from this file to access any MLB type without needing to know its exact location.
 */

// Core types
export * from './core';

// Game types - explicitly imported to avoid conflicts
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

// Draftkings types
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

// Environment types - renamed to avoid conflicts
export type {
  DetailedWeatherInfo as DetailedGameWeatherInfo,
  GameEnvironmentData as GameEnvironmentDetails,
  MLBWeatherData as MLBWeatherRecord,
  BallparkFactors,
  BallparkDimensions
} from './environment';

// Add MLBWeatherData as WeatherData for compatibility
export type { MLBWeatherData as WeatherData } from './environment';

// Analysis types - explicitly export to avoid ambiguity
export type {
  BatterAnalysis,
  BatterInfo,
  BatterProjections,
  BatterQualityMetrics,
  DetailedHitProjection,
  DetailedHitProjections,
  DKPlayer,
  GameInfo,
  HitProjection,
  LineupContext,
  PitcherRunAllowance,
  Projections,
  RunProductionAnalysis,
  RunProductionStats,
  TeamOffensiveContext
} from './analysis';

// Statcast types - explicitly import known types to avoid duplicates
export type {
  PitchUsage,
  // Add only types that actually exist
} from './statcast';

// Re-export entire modules to ensure all types are available
export * from './statcast';
export * from './validation';
