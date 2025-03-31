/**
 * MLB Type Definitions - Main Export File
 *
 * This file re-exports all MLB-related type definitions for easier imports.
 * Import from this file to access any MLB type without needing to know its exact location.
 */

export * from './core';
export * from './game';

// Explicitly re-export to avoid name conflicts
export type {
  DraftKingsCSVEntry,
  DraftKingsPlayer,
  DraftKingsMapping,
  DraftKingsScoringRules
} from './draftkings';

// Re-export DraftKingsInfo with a different name to avoid conflict
export type { DraftKingsInfo as DKPlayerInfo } from './draftkings';

// Export from player directory
export * from './player';

// Export from environment, renaming conflicting types
export type {
  DetailedWeatherInfo as DetailedGameWeatherInfo,
  GameEnvironmentData as GameEnvironmentDetails,
  MLBWeatherData as MLBWeatherRecord
} from './environment';

export * from './statcast';
export * from './validation';
