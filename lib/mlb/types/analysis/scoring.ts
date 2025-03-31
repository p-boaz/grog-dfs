/**
 * MLB DFS Scoring Type Definitions
 *
 * This file contains type definitions for DFS scoring and projections.
 */

/**
 * DFS Points breakdown for a batter
 * 
 * @property singles - Points from singles
 * @property doubles - Points from doubles
 * @property triples - Points from triples
 * @property homeRuns - Points from home runs
 * @property rbis - Points from RBIs
 * @property runs - Points from runs scored
 * @property walks - Points from walks
 * @property hitByPitch - Points from being hit by pitch
 * @property stolenBases - Points from stolen bases
 * @property total - Total DFS points
 */
export interface BatterDFSPoints {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbis: number;
  runs: number;
  walks: number;
  hitByPitch: number;
  stolenBases: number;
  total: number;
}

/**
 * DFS Points breakdown for a pitcher
 * 
 * @property inningsPitched - Points from innings pitched
 * @property strikeouts - Points from strikeouts
 * @property win - Points from win
 * @property earnedRuns - Points deducted for earned runs
 * @property hitsAllowed - Points deducted for hits allowed
 * @property walksAllowed - Points deducted for walks allowed
 * @property hitBatsmen - Points deducted for hit batsmen
 * @property completeGame - Points from complete game
 * @property shutout - Points from shutout
 * @property noHitter - Points from no-hitter
 * @property total - Total DFS points
 */
export interface PitcherDFSPoints {
  inningsPitched: number;
  strikeouts: number;
  win: number;
  earnedRuns: number;
  hitsAllowed: number;
  walksAllowed: number;
  hitBatsmen: number;
  completeGame: number;
  shutout: number;
  noHitter: number;
  total: number;
}

/**
 * DFS scoring point values
 * Matches DraftKings MLB Classic scoring
 */
export interface DFSScoringValues {
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
  };
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
  };
}

/**
 * Aggregate player projection
 * 
 * @property playerId - MLB player ID
 * @property name - Player name
 * @property position - Position
 * @property team - Team abbreviation
 * @property opponent - Opponent team
 * @property salary - DraftKings salary
 * @property projectedPoints - Projected DFS points
 * @property upside - Upside projection (90th percentile)
 * @property floor - Floor projection (10th percentile)
 * @property valueScore - Value relative to salary (points per $1000)
 * @property confidence - Projection confidence (0-100)
 */
export interface PlayerProjection {
  playerId: number;
  name: string;
  position: string;
  team: string;
  opponent: string;
  salary: number;
  projectedPoints: number;
  upside: number;
  floor: number;
  valueScore: number; // Points per $1000 salary
  confidence: number; // 0-100
}

/**
 * DFS lineup with projected points
 * 
 * @property totalSalary - Total salary for the lineup
 * @property totalProjectedPoints - Projected points for the lineup
 * @property players - Array of players in the lineup
 */
export interface DFSLineup {
  totalSalary: number;
  totalProjectedPoints: number;
  players: Array<{
    playerId: number;
    name: string;
    position: string;
    team: string;
    salary: number;
    projectedPoints: number;
  }>;
}