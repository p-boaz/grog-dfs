/**
 * MLB Matchup Analysis Type Definitions
 *
 * This file contains type definitions for advanced matchup analysis.
 */

import { PitcherBatterMatchup } from "../player";

/**
 * Enhanced analysis of a matchup between pitcher and batter
 *
 * @property matchupRating - Overall rating (0-100 scale)
 * @property advantagePlayer - Which player has the advantage
 * @property confidenceScore - Confidence in the analysis (0-100)
 * @property factors - Component factors affecting the matchup
 * @property keyInsights - Key insights about the matchup
 * @property historicalMatchup - Historical matchup data
 */
export interface AdvancedMatchupAnalysis {
  matchupRating: number;
  advantagePlayer: "pitcher" | "batter" | "neutral";
  confidenceScore: number;
  factors: {
    historicalSuccess: number; // -10 to +10
    pitchTypeAdvantage: number; // -10 to +10
    plateSplitAdvantage: number; // -10 to +10
    recentForm: number; // -10 to +10
    velocityTrend: number; // -5 to +5
  };
  keyInsights: string[];
  historicalMatchup?: PitcherBatterMatchup;
}

/**
 * Detailed analysis of a hitter's matchup with a pitcher
 *
 * @property plateAppearances - Total number of plate appearances
 * @property babip - Batting average on balls in play
 * @property sampleSize - Sample size indicator (0-1)
 * @property confidence - Confidence in the projection (0-1)
 * @property expectedAvg - Expected batting average
 * @property expectedObp - Expected on-base percentage
 * @property expectedSlg - Expected slugging percentage
 * @property strikeoutProbability - Probability of a strikeout
 * @property walkProbability - Probability of a walk
 * @property homeProbability - Probability of a home run
 * @property stats - Additional statistics
 */
export interface HitterMatchupAnalysis {
  plateAppearances: number;
  babip: number;
  sampleSize: number;
  confidence: number;
  expectedAvg: number;
  expectedObp: number;
  expectedSlg: number;
  strikeoutProbability: number;
  walkProbability: number;
  homeProbability: number;
  stats: {
    plateAppearances: number;
    walks: number;
    hitByPitch: number;
    strikeouts: number;
  };
}
