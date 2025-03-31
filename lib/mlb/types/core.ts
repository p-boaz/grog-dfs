/**
 * Core MLB Type Definitions
 *
 * This file contains core type definitions used throughout the MLB module.
 */

/**
 * Handedness enum for batters and pitchers
 */
export type Handedness = 'L' | 'R' | 'S';

/**
 * Game state values
 */
export type GameState = 'Preview' | 'Live' | 'Final';

/**
 * Team statistics for both hitting and pitching
 */
export interface TeamStats {
  hitting: Record<string, any>;
  pitching: Record<string, any>;
}

/**
 * Common metadata interface for cached data
 */
export interface ApiSourceMetadata {
  sourceTimestamp?: Date;
}

/**
 * Tracking information for data analysis
 */
export interface AnalysisMetadata {
  confidence: number; // 0-100
  analysisTimestamp: Date;
  dataVersion: string;
  factors: string[];
}

/**
 * Date range for data queries
 */
export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}