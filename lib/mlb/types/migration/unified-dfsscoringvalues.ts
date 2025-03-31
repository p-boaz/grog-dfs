/**
 * Unified interface generated from 2 similar interfaces:
 * - DFSScoringValues (lib/mlb/types/analysis/scoring.ts)
 * - DraftKingsScoringRules (lib/mlb/types/draftkings.ts)
 */
export interface UnifiedDFSScoringValues {
  /** Present in 2/2 interfaces */
  hitter: {
    single: number; // +3 Pts
    double: number; // +5 Pts
    triple: number; // +8 Pts
    homeRun: number; // +10 Pts
    rbi: number; // +2 Pts
    run: number; // +2 Pts
    walk: number; // +2 Pts
    hitByPitch: number; // +2 Pts
    stolenBase: number; // +5 Pts
  } | {
    single: number;
    double: number;
    triple: number;
    homeRun: number;
    rbi: number;
    run: number;
    baseOnBalls: number;
    hitByPitch: number;
    stolenBase: number;
  };
  /** Present in 2/2 interfaces */
  pitcher: {
    inningPitched: number; // +2.25 Pts (+0.75 Pts/Out)
    strikeout: number; // +2 Pts
    win: number; // +4 Pts
    earnedRunAllowed: number; // -2 Pts
    hitAgainst: number; // -0.6 Pts
    walkAgainst: number; // -0.6 Pts
    hitBatsman: number; // -0.6 Pts
    completeGame: number; // +2.5 Pts
    completeGameShutout: number; // +2.5 Pts
    noHitter: number; // +5 Pts
  } | {
    inningPitched: number;
    strikeout: number;
    win: number;
    earnedRunAllowed: number;
    hitAgainst: number;
    baseOnBallsAgainst: number;
    hitBatsman: number;
    completeGame: number;
    completeGameShutout: number;
    noHitter: number;
  };
}


/**
 * Adapter functions for converting between similar interfaces
 */

/**
 * Convert from DFSScoringValues to UnifiedDFSScoringValues
 */
export function DFSScoringValuesToUnifiedDFSScoringValues(source: DFSScoringValues): UnifiedDFSScoringValues {
  return {
    hitter: source.hitter,
    pitcher: source.pitcher,
  };
}

/**
 * Convert from UnifiedDFSScoringValues to DFSScoringValues
 */
export function UnifiedDFSScoringValuesToDFSScoringValues(source: UnifiedDFSScoringValues): DFSScoringValues {
  return {
    hitter: source.hitter ?? 0,
    pitcher: source.pitcher ?? 0,
  };
}

/**
 * Convert from DraftKingsScoringRules to UnifiedDFSScoringValues
 */
export function DraftKingsScoringRulesToUnifiedDFSScoringValues(source: DraftKingsScoringRules): UnifiedDFSScoringValues {
  return {
    hitter: source.hitter,
    pitcher: source.pitcher,
  };
}

/**
 * Convert from UnifiedDFSScoringValues to DraftKingsScoringRules
 */
export function UnifiedDFSScoringValuesToDraftKingsScoringRules(source: UnifiedDFSScoringValues): DraftKingsScoringRules {
  return {
    hitter: source.hitter ?? 0,
    pitcher: source.pitcher ?? 0,
  };
}

