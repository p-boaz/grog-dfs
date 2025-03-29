/**
 * Specialized functions for analyzing pitcher longevity and innings pitched potential
 */

import { getPitcherStats } from "../player/pitcher-stats";
import { getTeamStats } from "../schedule/schedule";
import { getGameEnvironmentData } from "../index";
import { getGameFeed } from "../game/game-feed";
import { calculatePitcherWinProbability } from "./pitcher-win";

/**
 * Get pitcher's innings pitched statistics and durability metrics
 */
export async function getPitcherInningsStats(
  pitcherId: number,
  season: number = new Date().getFullYear()
): Promise<{
  name?: string;
  teamName?: string;
  gamesStarted: number;
  inningsPitched: number;
  avgInningsPerStart: number;
  qualityStartPercentage?: number;
  completionRate?: number; // % of times pitcher gets through 6+ innings
  pitchEfficiency?: number; // Estimated pitches per inning
  earlyHookRate?: number; // % of times pitcher gets pulled before 5 innings
  durabilityRating: number; // 1-10 scale for IP potential
} | null> {
  try {
    // Fetch full pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    if (!pitcherData || !pitcherData.seasonStats.gamesPlayed) {
      console.log(
        `No pitching stats found for pitcher ${pitcherId}, season ${season}`
      );
      return null;
    }

    // Extract stats
    const stats = pitcherData.seasonStats;
    const gamesStarted = stats.gamesPlayed;
    const inningsPitched = stats.inningsPitched;

    // Calculate average innings per start
    const avgInningsPerStart =
      gamesStarted > 0 ? inningsPitched / gamesStarted : 0;

    // Calculate estimated quality starts (6+ IP, 3 or fewer ER)
    // Higher quality pitchers tend to have more quality starts - derive from ERA
    let qualityStartPct = 0.5; // Default to league average
    if (stats.era < 3.0) {
      qualityStartPct = 0.65; // Elite pitchers
    } else if (stats.era < 3.75) {
      qualityStartPct = 0.55; // Good pitchers
    } else if (stats.era > 5.0) {
      qualityStartPct = 0.35; // Struggling pitchers
    }

    // Calculate completion rate (6+ innings)
    const completionRate =
      avgInningsPerStart >= 6
        ? 0.75 // Likely completes 6+ innings regularly
        : avgInningsPerStart >= 5.5
        ? 0.6 // Often completes 6+ innings
        : avgInningsPerStart >= 5
        ? 0.45 // Sometimes completes 6+ innings
        : 0.25; // Rarely completes 6+ innings

    // Calculate pitch efficiency (pitches per inning)
    // Lower is better - derived from walks and strikeouts
    const walkRate = stats.walks / inningsPitched;
    const strikeoutRate = stats.strikeouts / inningsPitched;
    const pitchEfficiency = 15 + walkRate * 6 + strikeoutRate * 2;

    // Calculate early hook rate (less than 5 innings)
    const earlyHookRate =
      avgInningsPerStart < 4.5
        ? 0.6 // Often pulled early
        : avgInningsPerStart < 5
        ? 0.4 // Sometimes pulled early
        : avgInningsPerStart < 5.5
        ? 0.25 // Occasionally pulled early
        : 0.15; // Rarely pulled early

    // Calculate durability rating (1-10 scale)
    let durabilityRating = 5; // Start at average

    // Adjust based on avg innings per start
    if (avgInningsPerStart >= 6.5) {
      durabilityRating += 2.5; // Elite longevity
    } else if (avgInningsPerStart >= 6) {
      durabilityRating += 1.5; // Very good longevity
    } else if (avgInningsPerStart >= 5.5) {
      durabilityRating += 0.75; // Above average longevity
    } else if (avgInningsPerStart < 5) {
      durabilityRating -= 1; // Below average longevity
    } else if (avgInningsPerStart < 4.5) {
      durabilityRating -= 2; // Poor longevity
    }

    // Adjust based on pitch efficiency
    if (pitchEfficiency < 15) {
      durabilityRating += 1; // Very efficient
    } else if (pitchEfficiency > 18) {
      durabilityRating -= 0.75; // Inefficient
    }

    // Adjust based on quality start percentage
    if (qualityStartPct > 0.6) {
      durabilityRating += 0.75; // Consistent quality
    } else if (qualityStartPct < 0.4) {
      durabilityRating -= 0.75; // Inconsistent quality
    }

    // Ensure rating is within 1-10 scale
    durabilityRating = Math.max(1, Math.min(10, durabilityRating));

    return {
      name: pitcherData.fullName,
      teamName: pitcherData.currentTeam,
      gamesStarted,
      inningsPitched,
      avgInningsPerStart,
      qualityStartPercentage: qualityStartPct,
      completionRate,
      pitchEfficiency,
      earlyHookRate,
      durabilityRating,
    };
  } catch (error) {
    console.error(
      `Error fetching innings stats for pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Analyze team hook tendencies - how quickly teams pull their starters
 */
export async function getTeamHookTendencies(
  teamId: number,
  season: number = new Date().getFullYear()
): Promise<{
  teamName?: string;
  quickHookRating: number; // 1-10 scale (higher means quicker hook)
  bullpenUsageRating: number; // 1-10 scale (higher means more bullpen usage)
  starterInningsPerGame: number;
  confidenceScore: number; // 1-100
} | null> {
  try {
    // Get team data
    const teamData = await getTeamStats(teamId, season);

    if (!teamData) {
      return null;
    }

    // Extract relevant stats
    // Note: This is simplified as we don't have complete team pitching strategy data
    const stats = teamData.stats;

    // Approximate starter innings per game (league average ~5.5)
    // This is simplified - ideally we'd have actual data on starter vs. reliever innings
    const starterInningsPerGame = 5.5;

    // Quick hook rating (1-10 scale)
    // Without specific data, use team ERA as a proxy - teams with higher ERA tend to pull starters quicker
    const quickHookRating = 5 + (stats.era - 4.0) * 1.5;

    // Bullpen usage rating (1-10 scale)
    // Similar proxy using team ERA for now
    const bullpenUsageRating = quickHookRating;

    return {
      teamName: teamData.name,
      quickHookRating: Math.max(1, Math.min(10, quickHookRating)),
      bullpenUsageRating: Math.max(1, Math.min(10, bullpenUsageRating)),
      starterInningsPerGame,
      confidenceScore: 60, // Lower confidence due to estimation
    };
  } catch (error) {
    console.error(
      `Error getting team hook tendencies for team ${teamId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected innings pitched for a pitcher in a specific game
 */
export async function calculateExpectedInnings(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear()
): Promise<{
  expectedInnings: number;
  inningsProjection: {
    low: number;
    mid: number;
    high: number;
  };
  expectedDfsPoints: number;
  factors: {
    pitcherDurability: number;
    teamHookTendency: number;
    gameContext: number;
    pitcherEfficiency: number;
  };
  confidenceScore: number;
}> {
  try {
    // Get pitcher metrics for both current and previous season
    const [currentSeasonMetrics, previousSeasonMetrics] = await Promise.all([
      getPitcherInningsStats(pitcherId, season),
      getPitcherInningsStats(pitcherId, season - 1),
    ]);

    // Use current season metrics if available, otherwise fall back to previous season
    const pitcherMetrics = currentSeasonMetrics || previousSeasonMetrics;

    if (!pitcherMetrics) {
      // If no data is available for either season, return conservative default values
      return {
        expectedInnings: 5.0, // League average for starters
        inningsProjection: {
          low: 4.0,
          mid: 5.0,
          high: 6.0,
        },
        expectedDfsPoints: 11.25, // 5 innings * 2.25 points
        factors: {
          pitcherDurability: 5.0,
          teamHookTendency: 5.0,
          gameContext: 1.0,
          pitcherEfficiency: 16.0,
        },
        confidenceScore: 30, // Low confidence due to missing data
      };
    }

    // Get game environment data
    const gameEnvironment = await getGameEnvironmentData({ gamePk });

    // Get game feed for additional context
    const gameFeed = await getGameFeed({ gamePk });

    // Get win probability for game context
    const winProb = await calculatePitcherWinProbability(pitcherId, gamePk);

    // Calculate base expected innings from pitcher metrics
    const baseInnings = pitcherMetrics.avgInningsPerStart || 5.0;

    // Adjust for game context
    const gameContextMultiplier = calculateGameContextMultiplier(
      gameEnvironment,
      gameFeed,
      winProb
    );

    // Calculate expected innings
    const expectedInnings = Math.min(9, baseInnings * gameContextMultiplier);

    // Calculate projections
    const inningsProjection = {
      low: Math.max(2, expectedInnings - 1),
      mid: expectedInnings,
      high: Math.min(9, expectedInnings + 1),
    };

    return {
      expectedInnings,
      inningsProjection,
      expectedDfsPoints: expectedInnings * 2.25,
      factors: {
        pitcherDurability: pitcherMetrics.durabilityRating,
        teamHookTendency: 5.0, // Default if team data not available
        gameContext: gameContextMultiplier,
        pitcherEfficiency: pitcherMetrics.pitchEfficiency || 16.0,
      },
      confidenceScore: calculateConfidenceScore(
        pitcherMetrics,
        gameEnvironment
      ),
    };
  } catch (error) {
    console.error(
      `Error calculating expected innings for pitcher ${pitcherId}:`,
      error
    );
    // Return conservative default values on error
    return {
      expectedInnings: 5.0,
      inningsProjection: {
        low: 4.0,
        mid: 5.0,
        high: 6.0,
      },
      expectedDfsPoints: 11.25,
      factors: {
        pitcherDurability: 5.0,
        teamHookTendency: 5.0,
        gameContext: 1.0,
        pitcherEfficiency: 16.0,
      },
      confidenceScore: 30,
    };
  }
}

function calculateGameContextMultiplier(
  gameEnvironment: any,
  gameFeed: any,
  winProb: any
): number {
  let multiplier = 1.0;

  // Adjust for win probability
  if (winProb?.overallWinProbability > 0.6) {
    multiplier *= 1.1; // More likely to go deeper in games team is favored
  } else if (winProb?.overallWinProbability < 0.4) {
    multiplier *= 0.9; // Less likely in unfavorable matchups
  }

  // Adjust for weather if outdoor game
  if (gameEnvironment?.isOutdoor) {
    // Extreme temperatures affect pitcher longevity
    if (gameEnvironment.temperature > 90) {
      multiplier *= 0.9;
    } else if (gameEnvironment.temperature < 40) {
      multiplier *= 0.95;
    }

    // Strong winds can affect pitch count
    if (gameEnvironment.windSpeed > 15) {
      multiplier *= 0.95;
    }
  }

  return Math.max(0.8, Math.min(1.2, multiplier));
}

function calculateConfidenceScore(
  pitcherMetrics: any,
  gameEnvironment: any
): number {
  let score = 50; // Base confidence

  // Adjust based on sample size
  if (pitcherMetrics.gamesStarted > 10) {
    score += 20;
  } else if (pitcherMetrics.gamesStarted > 5) {
    score += 10;
  }

  // Adjust based on consistency
  if (pitcherMetrics.qualityStartPercentage > 0.6) {
    score += 15;
  } else if (pitcherMetrics.qualityStartPercentage < 0.4) {
    score -= 10;
  }

  // Adjust for environmental factors
  if (gameEnvironment?.isOutdoor) {
    score -= 5; // More variables in outdoor games
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate the complete game potential for a pitcher
 * (2.5 additional DFS points for complete game, 2.5 more for shutout, 5 more for no-hitter)
 */
export async function calculateCompleteGamePotential(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear()
): Promise<{
  completeGameProbability: number; // 0-100%
  shutoutProbability: number; // 0-100%
  noHitterProbability: number; // 0-100%
  expectedRareEventPoints: number; // Expected value of rare event bonuses
}> {
  try {
    // Get pitcher innings metrics
    const pitcherMetrics = await getPitcherInningsStats(pitcherId, season);

    if (!pitcherMetrics) {
      return {
        completeGameProbability: 0.5,
        shutoutProbability: 0.1,
        noHitterProbability: 0.01,
        expectedRareEventPoints: 0.02,
      };
    }

    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    // Base probabilities - very rare in modern baseball
    // MLB average is about 1% CG rate, 0.3% shutout rate, 0.02% no-hitter rate
    let completeGameProb = 0.01; // 1%
    let shutoutProb = 0.003; // 0.3%
    let noHitterProb = 0.0002; // 0.02%

    // Adjust based on pitcher durability
    if (pitcherMetrics.durabilityRating >= 8) {
      completeGameProb *= 3; // Elite durability pitchers 3x more likely
      shutoutProb *= 3;
      noHitterProb *= 3;
    } else if (pitcherMetrics.durabilityRating >= 6) {
      completeGameProb *= 2; // Good durability pitchers 2x more likely
      shutoutProb *= 2;
      noHitterProb *= 2;
    } else if (pitcherMetrics.durabilityRating <= 3) {
      completeGameProb *= 0.25; // Poor durability pitchers 75% less likely
      shutoutProb *= 0.25;
      noHitterProb *= 0.25;
    }

    // Adjust based on pitcher quality (ERA)
    if (pitcherData.seasonStats.era < 3.0) {
      shutoutProb *= 2.5; // Elite pitchers more likely for shutouts
      noHitterProb *= 3;
    } else if (pitcherData.seasonStats.era > 4.5) {
      shutoutProb *= 0.3; // Poor pitchers less likely for shutouts
      noHitterProb *= 0.2;
    }

    // Adjust based on avg innings per start
    if (pitcherMetrics.avgInningsPerStart >= 6.5) {
      completeGameProb *= 2.5; // Pitchers who go deep into games more likely
    } else if (pitcherMetrics.avgInningsPerStart < 5) {
      completeGameProb *= 0.2; // Pitchers with short outings very unlikely
    }

    // Convert to percentages and ensure in valid range
    const completeGameProbability = Math.min(15, completeGameProb * 100);
    const shutoutProbability = Math.min(5, shutoutProb * 100);
    const noHitterProbability = Math.min(1, noHitterProb * 100);

    // Calculate expected value of rare event points
    // CG = 2.5 pts, CGSO = 5 pts (2.5 + 2.5), No-hitter = 10 pts (2.5 + 2.5 + 5)
    const expectedRareEventPoints =
      completeGameProb * 2.5 + shutoutProb * 2.5 + noHitterProb * 5;

    return {
      completeGameProbability,
      shutoutProbability,
      noHitterProbability,
      expectedRareEventPoints,
    };
  } catch (error) {
    console.error(
      `Error calculating CG potential for pitcher ${pitcherId}:`,
      error
    );

    // Return minimal defaults
    return {
      completeGameProbability: 0.5,
      shutoutProbability: 0.1,
      noHitterProbability: 0.01,
      expectedRareEventPoints: 0.02,
    };
  }
}
