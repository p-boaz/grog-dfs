/**
 * Specialized functions for combining all category-specific projections 
 * into comprehensive DFS point projections
 */

import { calculatePitcherWinProbability } from "./pitcher-win";
import { calculateExpectedStrikeouts } from "./strikeouts";
import { calculateExpectedInnings } from "./innings-pitched";
import { calculateRareEventPotential } from "./rare-events";
import { getPitcherHomeRunVulnerability } from "../player/pitcher-stats";
import { PitcherDFSPoints, PlayerProjection } from "../types/analysis/scoring";

/**
 * Calculate comprehensive DFS points projection for a pitcher
 */
export async function calculatePitcherDfsProjection(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear()
): Promise<{
  pitcher: {
    id: number;
    name?: string;
    team?: string;
  };
  points: {
    total: number;
    baseline: number;
    upside: number;
    floor: number;
    breakdown: {
      innings: number;
      strikeouts: number;
      win: number;
      rareEvents: number;
      negative: number;
    };
  };
  stats: {
    projectedInnings: number;
    projectedStrikeouts: number;
    winProbability: number;
    projectedEarnedRuns: number;
    quality: number; // 1-10 scale
  };
  confidence: {
    overall: number; // 1-100
    categoryScores: {
      innings: number;
      strikeouts: number;
      win: number;
      rareEvents: number;
    };
  };
}> {
  try {
    // Collect all category-specific projections in parallel
    const [
      winProjection, 
      strikeoutProjection, 
      inningsProjection, 
      rareEventsProjection,
      hrVulnerability
    ] = await Promise.all([
      calculatePitcherWinProbability(pitcherId, gamePk, season),
      calculateExpectedStrikeouts(pitcherId, parseInt(gamePk), gamePk),
      calculateExpectedInnings(pitcherId, gamePk, season),
      calculateRareEventPotential(pitcherId, gamePk, season),
      getPitcherHomeRunVulnerability(pitcherId, season)
    ]);
    
    // Extract pitcher name and team from any available projection
    const name = winProjection.pitcherFactors ? 
      (strikeoutProjection.expectedStrikeouts > 0 ? strikeoutProjection.factors.pitcherBaseline : 0) : "";
    const team = "";  // Would extract from pitcher data
    
    // Calculate expected earned runs
    // Use HR vulnerability and innings to estimate ER
    const hrVulnerabilityFactor = hrVulnerability ? hrVulnerability.homeRunVulnerability / 5 : 1;
    const projectedInnings = inningsProjection.expectedInnings;
    const baseEraEstimate = 4.0;  // League average
    const adjustedEra = baseEraEstimate * hrVulnerabilityFactor;
    const projectedEarnedRuns = (projectedInnings / 9) * adjustedEra;
    
    // Calculate negative points (-2 per ER, -0.6 per hit, walk, HBP)
    // Simple estimate: 1 hit per inning + 0.3 walks/HBP per inning, plus earned runs
    const projectedHits = projectedInnings;  // Estimate 1 hit per inning
    const projectedWalksHbp = projectedInnings * 0.3;  // Estimate 0.3 walks/HBP per inning
    
    const negativePoints = 
      (projectedEarnedRuns * -2) + 
      (projectedHits * -0.6) + 
      (projectedWalksHbp * -0.6);
    
    // Calculate positive points
    const inningsPoints = projectedInnings * 2.25;  // 2.25 pts per inning
    const strikeoutPoints = strikeoutProjection && strikeoutProjection.expectedDfsPoints ? strikeoutProjection.expectedDfsPoints : 0;  // 2 pts per K
    const winPoints = winProjection.overallWinProbability / 100 * 4;  // 4 pts for win
    const rareEventPoints = rareEventsProjection.expectedRareEventPoints;
    
    // Calculate total points
    const totalPoints = 
      inningsPoints + 
      strikeoutPoints + 
      winPoints + 
      rareEventPoints + 
      negativePoints;
    
    // Calculate upside (90th percentile)
    const upsidePoints = totalPoints * 1.2;
    
    // Calculate floor (10th percentile)
    const floorPoints = totalPoints * 0.75;
    
    // Calculate baseline (50th percentile)
    const baselinePoints = totalPoints;
    
    // Calculate overall confidence
    // Weight by importance of each category to DFS scoring
    const confidenceWeights = {
      innings: 0.35,
      strikeouts: 0.3,
      win: 0.25,
      rareEvents: 0.1
    };
    
    const overallConfidence = 
      (inningsProjection.confidence * confidenceWeights.innings) +
      (strikeoutProjection.confidence * confidenceWeights.strikeouts) +
      (winProjection.confidenceScore * confidenceWeights.win) +
      (rareEventsProjection.confidenceScore * confidenceWeights.rareEvents);
    
    // Calculate pitcher quality rating (1-10 scale)
    const qualityComponents = [
      strikeoutProjection.factors.pitcherBaseline,
      inningsProjection.factors.pitcherDurability,
      10 - (hrVulnerability ? hrVulnerability.homeRunVulnerability : 5) // Invert HR vulnerability
    ];
    
    const qualityRating = qualityComponents.reduce((sum, rating) => sum + rating, 0) / qualityComponents.length;
    
    return {
      pitcher: {
        id: pitcherId,
        name: name as string | undefined,
        team
      },
      points: {
        total: Math.max(0, Math.round(totalPoints * 10) / 10), // Round to 1 decimal and floor at 0
        baseline: Math.max(0, Math.round(baselinePoints * 10) / 10),
        upside: Math.max(0, Math.round(upsidePoints * 10) / 10),
        floor: Math.max(0, Math.round(floorPoints * 10) / 10),
        breakdown: {
          innings: Math.round(inningsPoints * 10) / 10,
          strikeouts: Math.round(strikeoutPoints * 10) / 10,
          win: Math.round(winPoints * 10) / 10,
          rareEvents: Math.round(rareEventPoints * 10) / 10,
          negative: Math.round(negativePoints * 10) / 10
        }
      },
      stats: {
        projectedInnings: Math.round(projectedInnings * 10) / 10,
        projectedStrikeouts: Math.round(strikeoutProjection.expectedStrikeouts * 10) / 10,
        winProbability: winProjection.overallWinProbability,
        projectedEarnedRuns: Math.round(projectedEarnedRuns * 10) / 10,
        quality: Math.round(qualityRating * 10) / 10
      },
      confidence: {
        overall: Math.round(overallConfidence),
        categoryScores: {
          innings: inningsProjection.confidence,
          strikeouts: strikeoutProjection.confidence,
          win: winProjection.confidenceScore,
          rareEvents: rareEventsProjection.confidenceScore
        }
      }
    };
  } catch (error) {
    console.error(`Error calculating pitcher DFS projection for ID ${pitcherId}:`, error);
    
    // Return default values with low confidence
    return {
      pitcher: {
        id: pitcherId
      },
      points: {
        total: 15,
        baseline: 15,
        upside: 22,
        floor: 8,
        breakdown: {
          innings: 11.25, // 5 innings
          strikeouts: 8, // 4 Ks
          win: 2, // 50% win probability
          rareEvents: 0,
          negative: -6 // 3 ER
        }
      },
      stats: {
        projectedInnings: 5,
        projectedStrikeouts: 4,
        winProbability: 50,
        projectedEarnedRuns: 3,
        quality: 5
      },
      confidence: {
        overall: 30,
        categoryScores: {
          innings: 30,
          strikeouts: 30,
          win: 30,
          rareEvents: 30
        }
      }
    };
  }
}

/**
 * Calculate comparative rank of pitcher projections
 */
export async function rankPitcherProjections(
  pitcherIds: number[],
  gamePks: Record<number, string>, // Map of pitcher ID to game PK
  season: number = new Date().getFullYear()
): Promise<{
  rankings: Array<{
    rank: number;
    pitcher: {
      id: number;
      name?: string;
      team?: string;
    };
    points: number;
    value: number; // Points per $1000 salary
    salary?: number;
  }>;
  averageProjection: number;
  topTierThreshold: number;
  midTierThreshold: number;
}> {
  try {
    // Default pitcher salary if not provided (can be replaced with actual data)
    const defaultSalary = 8000;
    
    // Generate projections for all pitchers
    const projectionPromises = pitcherIds.map(async (pitcherId) => {
      try {
        const gamePk = gamePks[pitcherId];
        if (!gamePk) {
          throw new Error(`No game PK provided for pitcher ${pitcherId}`);
        }
        
        const projection = await calculatePitcherDfsProjection(pitcherId, gamePk, season);
        
        return {
          pitcher: projection.pitcher,
          points: projection.points.total,
          confidence: projection.confidence.overall,
          salary: defaultSalary, // Replace with actual salary data when available
        };
      } catch (error) {
        console.error(`Error projecting pitcher ${pitcherId}:`, error);
        return null;
      }
    });
    
    // Wait for all projections to complete
    const projections = (await Promise.all(projectionPromises)).filter(p => p !== null) as Array<{
      pitcher: {
        id: number;
        name?: string;
        team?: string;
      };
      points: number;
      confidence: number;
      salary: number;
    }>;
    
    // Sort projections by points (descending)
    projections.sort((a, b) => b.points - a.points);
    
    // Calculate value (points per $1000)
    const rankings = projections.map((proj, index) => ({
      rank: index + 1,
      pitcher: proj.pitcher,
      points: proj.points,
      value: (proj.points / proj.salary) * 1000,
      salary: proj.salary
    }));
    
    // Calculate average projection
    const totalPoints = projections.reduce((sum, proj) => sum + proj.points, 0);
    const averageProjection = projections.length > 0 ? totalPoints / projections.length : 0;
    
    // Set tier thresholds
    const topTierThreshold = averageProjection * 1.25;
    const midTierThreshold = averageProjection * 0.9;
    
    return {
      rankings,
      averageProjection: Math.round(averageProjection * 10) / 10,
      topTierThreshold: Math.round(topTierThreshold * 10) / 10,
      midTierThreshold: Math.round(midTierThreshold * 10) / 10
    };
  } catch (error) {
    console.error(`Error ranking pitcher projections:`, error);
    
    // Return empty rankings
    return {
      rankings: [],
      averageProjection: 15,
      topTierThreshold: 20,
      midTierThreshold: 12
    };
  }
}