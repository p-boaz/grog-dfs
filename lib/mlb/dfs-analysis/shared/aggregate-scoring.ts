/**
 * Specialized functions for combining all category-specific projections
 * into comprehensive DFS point projections
 */

import { makeMLBApiRequest } from "../../core/api-client";
import { getEnhancedPitcherData } from "../../services/pitcher-data-service";
import { isPitcherStats } from "../../types/domain/player";
import { calculateExpectedInnings } from "../pitchers/innings-pitched";
import { calculatePitcherWinProbability } from "../pitchers/pitcher-win";
import { calculateRareEventPotential } from "../pitchers/rare-events";
import { calculateExpectedStrikeouts } from "../pitchers/strikeouts";

/**
 * Helper function to find which team a pitcher is on in a game
 * @param gameFeedData Game feed data from MLB API
 * @param pitcherId MLB Player ID for the pitcher
 * @returns Team ID for the pitcher's team, or undefined if not found
 */
function findPitcherTeamId(
  gameFeedData: any,
  pitcherId: number
): number | undefined {
  if (!gameFeedData?.gameData?.players) {
    return undefined;
  }

  // Find the pitcher in the players dictionary
  const pitcherKey = `ID${pitcherId}`;
  const pitcher = gameFeedData.gameData.players[pitcherKey];

  if (!pitcher) {
    return undefined;
  }

  // Get the pitcher's current team ID
  return pitcher.currentTeam?.id;
}

/**
 * Calculate comprehensive DFS points projection for a pitcher
 */
export async function calculatePitcherDfsProjection(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear(),
  opposingTeamId?: number
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
    // First, try to get the game feed to extract team info if opposingTeamId not provided
    let opposingTeamID = opposingTeamId;

    if (!opposingTeamID) {
      try {
        // Get enhanced pitcher data first
        const pitcherData = await getEnhancedPitcherData(pitcherId, season);

        // Get the game feed to extract team info
        const gameFeedData = await makeMLBApiRequest<any>(
          `/game/${gamePk}/feed/live`,
          "V11"
        );

        // Get home and away team IDs
        const homeTeamId = gameFeedData?.gameData?.teams?.home?.team?.id;
        const awayTeamId = gameFeedData?.gameData?.teams?.away?.team?.id;

        // Get the pitcher's team ID from the game data
        const pitcherTeamId = findPitcherTeamId(gameFeedData, pitcherId);

        // Determine opposing team (the team the pitcher is not on)
        opposingTeamID = pitcherTeamId === homeTeamId ? awayTeamId : homeTeamId;

        if (!opposingTeamID) {
          console.warn(
            `Could not determine opposing team ID for game ${gamePk}, skipping team-specific calculations`
          );
          // Return a default projection without team-specific data
          return {
            pitcher: {
              id: pitcherId,
              name: pitcherData?.fullName || `Pitcher ${pitcherId}`,
              team: pitcherData?.currentTeam,
            },
            points: {
              total: 0,
              baseline: 0,
              floor: 0,
              upside: 0,
              breakdown: {
                innings: 0,
                strikeouts: 0,
                win: 0,
                rareEvents: 0,
                negative: 0,
              },
            },
            stats: {
              projectedInnings: 0,
              projectedStrikeouts: 0,
              winProbability: 0,
              projectedEarnedRuns: 0,
              quality: 0,
            },
            confidence: {
              overall: 0,
              categoryScores: {
                innings: 0,
                strikeouts: 0,
                win: 0,
                rareEvents: 0,
              },
            },
          };
        }
      } catch (error) {
        console.warn(
          `Error getting game feed data for game ${gamePk}, skipping team-specific calculations:`,
          error
        );
        // Return a default projection without team-specific data
        return {
          pitcher: {
            id: pitcherId,
            name: `Pitcher ${pitcherId}`, // No pitcherData available in catch block
            team: undefined,
          },
          points: {
            total: 0,
            baseline: 0,
            floor: 0,
            upside: 0,
            breakdown: {
              innings: 0,
              strikeouts: 0,
              win: 0,
              rareEvents: 0,
              negative: 0,
            },
          },
          stats: {
            projectedInnings: 0,
            projectedStrikeouts: 0,
            winProbability: 0,
            projectedEarnedRuns: 0,
            quality: 0,
          },
          confidence: {
            overall: 0,
            categoryScores: {
              innings: 0,
              strikeouts: 0,
              win: 0,
              rareEvents: 0,
            },
          },
        };
      }
    }

    // Get enhanced pitcher data for additional metrics
    const pitcherData = await getEnhancedPitcherData(pitcherId, season);

    const [
      winProjection,
      strikeoutProjection,
      inningsProjection,
      rareEventsProjection,
    ] = await Promise.all([
      calculatePitcherWinProbability(pitcherId, gamePk, season),
      calculateExpectedStrikeouts(pitcherId, opposingTeamID, gamePk),
      calculateExpectedInnings(pitcherId, gamePk, season),
      calculateRareEventPotential(pitcherId, gamePk, season),
    ]);

    // Extract pitcher name and team from enhanced data
    const name = pitcherData?.fullName || "";
    const team = pitcherData?.currentTeam || "";

    // Calculate expected earned runs
    // Get HR vulnerability from current stats
    let hrVulnerabilityFactor = 1.0;

    if (pitcherData && isPitcherStats(pitcherData.seasonStats)) {
      const innings = pitcherData.seasonStats.inningsPitched || 1;
      const hrs = pitcherData.seasonStats.homeRunsAllowed || 0;
      const hrPer9 = (hrs / innings) * 9;

      // Normal HR/9 is around 1.25, adjust vulnerability based on deviation
      hrVulnerabilityFactor = hrPer9 / 1.25;
    }

    const projectedInnings = inningsProjection.expectedInnings;
    const baseEraEstimate = 4.0; // League average
    const adjustedEra = baseEraEstimate * hrVulnerabilityFactor;
    const projectedEarnedRuns = (projectedInnings / 9) * adjustedEra;

    // Calculate negative points (-2 per ER, -0.6 per hit, walk, HBP)
    // Simple estimate: 1 hit per inning + 0.3 walks/HBP per inning, plus earned runs
    const projectedHits = projectedInnings; // Estimate 1 hit per inning
    const projectedWalksHbp = projectedInnings * 0.3; // Estimate 0.3 walks/HBP per inning

    const negativePoints =
      projectedEarnedRuns * -2 +
      projectedHits * -0.6 +
      projectedWalksHbp * -0.6;

    // Calculate positive points
    const inningsPoints = projectedInnings * 2.25; // 2.25 pts per inning
    const strikeoutPoints =
      strikeoutProjection && strikeoutProjection.expectedDfsPoints
        ? strikeoutProjection.expectedDfsPoints
        : 0; // 2 pts per K
    const winPoints = (winProjection.overallWinProbability / 100) * 4; // 4 pts for win
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
      rareEvents: 0.1,
    };

    const overallConfidence =
      inningsProjection.confidence * confidenceWeights.innings +
      strikeoutProjection.confidence * confidenceWeights.strikeouts +
      winProjection.confidence * confidenceWeights.win +
      rareEventsProjection.confidence * confidenceWeights.rareEvents;

    // Calculate pitcher quality rating (1-10 scale)
    // Get pitching stats from enhanced data if available
    let pitcherBaseline = 5; // Default to average
    let durability = 5; // Default to average
    let hrVulnerability = 5; // Default to average

    if (pitcherData && isPitcherStats(pitcherData.seasonStats)) {
      const stats = pitcherData.seasonStats;

      // Use K/9 for baseline pitcher quality
      const k9 =
        stats.k9 || (stats.strikeouts / (stats.inningsPitched || 1)) * 9;

      // Average K/9 is around 8.5, scale to 1-10
      pitcherBaseline = Math.min(10, Math.max(1, (k9 / 10) * 10));

      // Durability based on average innings per start
      const inningsPerStart = stats.inningsPitched / (stats.gamesStarted || 1);

      // Average IP/GS is around 5.5, scale to 1-10
      durability = Math.min(10, Math.max(1, (inningsPerStart / 7) * 10));

      // HR vulnerability based on HR/9
      const homeRunsAllowed = stats.homeRunsAllowed || 0;
      const inningsPitched = stats.inningsPitched || 1;
      const hr9 = (homeRunsAllowed / inningsPitched) * 9;

      // Average HR/9 is around 1.25, scale to 10-1 (inverted because lower is better)
      hrVulnerability = Math.min(10, Math.max(1, 10 - (hr9 / 2.5) * 10));
    }

    const qualityComponents = [pitcherBaseline, durability, hrVulnerability];

    const qualityRating =
      qualityComponents.reduce((sum, rating) => sum + rating, 0) /
      qualityComponents.length;

    return {
      pitcher: {
        id: pitcherId,
        name,
        team,
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
          negative: Math.round(negativePoints * 10) / 10,
        },
      },
      stats: {
        projectedInnings: Math.round(projectedInnings * 10) / 10,
        projectedStrikeouts:
          Math.round(strikeoutProjection.expectedStrikeouts * 10) / 10,
        winProbability: winProjection.overallWinProbability,
        projectedEarnedRuns: Math.round(projectedEarnedRuns * 10) / 10,
        quality: Math.round(qualityRating * 10) / 10,
      },
      confidence: {
        overall: Math.round(overallConfidence),
        categoryScores: {
          innings: inningsProjection.confidence,
          strikeouts: strikeoutProjection.confidence,
          win: winProjection.confidence,
          rareEvents: rareEventsProjection.confidence,
        },
      },
    };
  } catch (error) {
    console.error(
      `Error calculating pitcher DFS projection for ID ${pitcherId}:`,
      error
    );

    // Return default values with low confidence
    return {
      pitcher: {
        id: pitcherId,
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
          negative: -6, // 3 ER
        },
      },
      stats: {
        projectedInnings: 5,
        projectedStrikeouts: 4,
        winProbability: 50,
        projectedEarnedRuns: 3,
        quality: 5,
      },
      confidence: {
        overall: 30,
        categoryScores: {
          innings: 30,
          strikeouts: 30,
          win: 30,
          rareEvents: 30,
        },
      },
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

        const projection = await calculatePitcherDfsProjection(
          pitcherId,
          gamePk,
          season
        );

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
    const projections = (await Promise.all(projectionPromises)).filter(
      (p) => p !== null
    ) as Array<{
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
      salary: proj.salary,
    }));

    // Calculate average projection
    const totalPoints = projections.reduce((sum, proj) => sum + proj.points, 0);
    const averageProjection =
      projections.length > 0 ? totalPoints / projections.length : 0;

    // Set tier thresholds
    const topTierThreshold = averageProjection * 1.25;
    const midTierThreshold = averageProjection * 0.9;

    return {
      rankings,
      averageProjection: Math.round(averageProjection * 10) / 10,
      topTierThreshold: Math.round(topTierThreshold * 10) / 10,
      midTierThreshold: Math.round(midTierThreshold * 10) / 10,
    };
  } catch (error) {
    console.error(`Error ranking pitcher projections:`, error);

    // Return empty rankings
    return {
      rankings: [],
      averageProjection: 15,
      topTierThreshold: 20,
      midTierThreshold: 12,
    };
  }
}
