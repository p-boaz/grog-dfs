/**
 * MLB Analysis Type Definitions - Index File
 *
 * This file re-exports all analysis-related type definitions.
 * It integrates both legacy and new types for a gradual migration path.
 */

// Explicitly export legacy batter analysis types
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
} from "./batter";

// Keep SeasonStats alias for backward compatibility
import { BatterStats } from '../domain/player';
export type SeasonStats = BatterStats;

// Export other legacy modules 
export * from "./events";
export * from "./matchups";
export * from "./pitcher";

// New types from scoring module with both legacy and modern types
export * from "./scoring";

// Export domain types selectively for convenience
export { 
  Batter, 
  BatterStats, 
  Pitcher, 
  PitcherStats, 
  isBatter, 
  isPitcher,
  isBatterStats,
  isPitcherStats
} from '../domain/player';

export {
  Game,
  GameStatus,
  GameEnvironment,
  BallparkFactors,
  isGame,
  isGameEnvironment
} from '../domain/game';
