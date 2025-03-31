/**
 * MLB Player Matchup Type Definitions
 *
 * This file contains type definitions for matchups between pitchers and batters.
 */

/**
 * Statistics for pitcher-batter matchups
 * 
 * @property atBats - Total at-bats
 * @property hits - Total hits
 * @property homeRuns - Home runs hit
 * @property strikeouts - Batter strikeouts
 * @property walks - Walks issued
 * @property avg - Batting average
 * @property obp - On-base percentage
 * @property slg - Slugging percentage
 * @property ops - On-base plus slugging
 * @property totalPitches - Total pitches thrown (if available)
 * @property timing - Qualitative timing assessment (if available)
 */
export interface MatchupStats {
  atBats: number;
  hits: number;
  homeRuns: number;
  strikeouts: number;
  walks: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  totalPitches?: number;
  timing?: string;
}

/**
 * Comprehensive matchup between a pitcher and batter
 * 
 * @property pitcher - Pitcher information
 * @property batter - Batter information
 * @property stats - Historical matchup statistics 
 * @property sourceTimestamp - When the data was retrieved
 */
export interface PitcherBatterMatchup {
  pitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
  batter: {
    id: number;
    name: string;
    batsHand: string;
  };
  stats: MatchupStats;
  sourceTimestamp?: Date;
}

/**
 * Extended matchup data with projections
 * 
 * @property historical - Historical matchup data
 * @property projections - Projected outcomes for this matchup
 * @property factors - Factors influencing the projection
 */
export interface MatchupAnalysis extends PitcherBatterMatchup {
  projections: {
    expectedOutcome: string; // e.g., "Strong advantage batter", "Slight advantage pitcher"
    hitProbability: number; // 0-1
    hrProbability: number; // 0-1
    kProbability: number; // 0-1
    expectedDfsPoints: number; // For the batter
  };
  factors: {
    handedness: number; // Impact of platoon advantage (0-10)
    recentForm: number; // Recent performance factor (0-10)
    ballparkFactor: number; // Impact of ballpark (0-10)
    weatherFactor: number; // Impact of weather (0-10)
  };
}