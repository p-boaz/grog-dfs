/**
 * Unified interface generated from 2 similar interfaces:
 * - RunProductionAnalysis (lib/mlb/types/analysis/batter.ts)
 * - RunProductionPoints (lib/mlb/types/analysis/run-production.ts)
 */
export interface UnifiedRunProductionAnalysis {
  /** Present in 2/2 interfaces */
  runs: {
    expected: number;
    points: number;
    confidence: number;
  };
  /** Present in 2/2 interfaces */
  rbis: {
    expected: number;
    points: number;
    confidence: number;
  };
  /** Present in 2/2 interfaces */
  total: {
    expected: number;
    points: number;
    confidence: number;
  };
}


/**
 * Adapter functions for converting between similar interfaces
 */

/**
 * Convert from RunProductionAnalysis to UnifiedRunProductionAnalysis
 */
export function RunProductionAnalysisToUnifiedRunProductionAnalysis(source: RunProductionAnalysis): UnifiedRunProductionAnalysis {
  return {
    runs: source.runs,
    rbis: source.rbis,
    total: source.total,
  };
}

/**
 * Convert from UnifiedRunProductionAnalysis to RunProductionAnalysis
 */
export function UnifiedRunProductionAnalysisToRunProductionAnalysis(source: UnifiedRunProductionAnalysis): RunProductionAnalysis {
  return {
    runs: source.runs ?? 0,
    rbis: source.rbis ?? 0,
    total: source.total ?? 0,
  };
}

/**
 * Convert from RunProductionPoints to UnifiedRunProductionAnalysis
 */
export function RunProductionPointsToUnifiedRunProductionAnalysis(source: RunProductionPoints): UnifiedRunProductionAnalysis {
  return {
    runs: source.runs,
    rbis: source.rbis,
    total: source.total,
  };
}

/**
 * Convert from UnifiedRunProductionAnalysis to RunProductionPoints
 */
export function UnifiedRunProductionAnalysisToRunProductionPoints(source: UnifiedRunProductionAnalysis): RunProductionPoints {
  return {
    runs: source.runs ?? 0,
    rbis: source.rbis ?? 0,
    total: source.total ?? 0,
  };
}

