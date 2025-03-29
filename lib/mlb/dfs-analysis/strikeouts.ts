/**
 * Specialized functions for analyzing strikeout potential for pitchers
 */

import {
  getPitcherStats,
  PitcherPitchMixData,
  getPitcherPitchMix,
} from "../player/pitcher-stats";
import { getTeamStats } from "../schedule/schedule";
import { getGameEnvironmentData } from "../index";
import { getGameFeed } from "../game/game-feed";
import { makeMLBApiRequest } from "../core/api-client";
import { GameFeedResponse } from "../core/types";

export interface PitcherStrikeoutStats {
  name: string;
  teamName: string;
  gamesStarted: number;
  inningsPitched: number;
  strikeouts: number;
  strikeoutRate: number;
  strikeoutPercentage: number;
  swingingStrikeRate: number;
  whiff?: number;
  pitchMix?: Partial<PitcherPitchMixData>;
  zonePct: number;
  outsidePitchPct: number;
  firstPitchStrikePercentage: number;
  strikeoutStuff: number;
}

/**
 * Get pitcher's strikeout statistics and metrics
 */
export async function getPitcherStrikeoutStats(
  pitcherId: number,
  currentTeam: string
): Promise<PitcherStrikeoutStats | undefined> {
  try {
    // Fetch full pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season: new Date().getFullYear(),
    });

    if (!pitcherData || !pitcherData.seasonStats.gamesPlayed) {
      console.log(
        `No pitching stats found for pitcher ${pitcherId}, season ${new Date().getFullYear()}`
      );
      return undefined;
    }

    // Get pitch mix data for more analysis
    const pitchMixData = await getPitcherPitchMix({ pitcherId });

    // Extract pitching stats
    const stats = pitcherData.seasonStats;

    // Calculate strikeout rate - strikeouts per 9 innings
    const strikeoutRate =
      stats.inningsPitched > 0
        ? (stats.strikeouts / stats.inningsPitched) * 9
        : 0;

    // Calculate strikeout percentage - strikeouts per batter faced
    // Estimate batters faced if not directly available
    const estimatedBattersFaced = stats.inningsPitched * 4.3; // MLB average is ~4.3 batters per inning
    const strikeoutPercentage =
      estimatedBattersFaced > 0 ? stats.strikeouts / estimatedBattersFaced : 0;

    // Use pitch mix data or defaults
    const swingingStrikeRate =
      pitchMixData?.controlMetrics?.swingingStrikePercent || 10;
    const zonePct = pitchMixData?.controlMetrics?.zonePercentage || 45;
    const outsidePitchPct = 100 - zonePct;
    const firstPitchStrikePercentage =
      pitchMixData?.controlMetrics?.firstPitchStrikePercent || 60;

    // Calculate strikeout stuff rating (1-10 scale)
    // Use combination of strikeout rate, swinging strike rate, and pitch qualities
    let strikeoutStuff = 5; // Start at average

    if (strikeoutRate > 10) {
      strikeoutStuff += 2; // Elite K/9
    } else if (strikeoutRate > 8) {
      strikeoutStuff += 1; // Above average K/9
    } else if (strikeoutRate < 6) {
      strikeoutStuff -= 1; // Below average K/9
    }

    if (swingingStrikeRate > 13) {
      strikeoutStuff += 1.5; // Elite swing and miss
    } else if (swingingStrikeRate > 11) {
      strikeoutStuff += 0.75; // Above average swing and miss
    } else if (swingingStrikeRate < 8) {
      strikeoutStuff -= 1; // Poor swing and miss
    }

    // Adjust based on first pitch strike rate
    if (firstPitchStrikePercentage > 65) {
      strikeoutStuff += 0.5; // Gets ahead in counts
    } else if (firstPitchStrikePercentage < 55) {
      strikeoutStuff -= 0.5; // Falls behind in counts
    }

    // Ensure rating is within 1-10 scale
    strikeoutStuff = Math.max(1, Math.min(10, strikeoutStuff));

    return {
      name: pitcherData.fullName,
      teamName: currentTeam,
      gamesStarted: stats.gamesPlayed,
      inningsPitched: stats.inningsPitched,
      strikeouts: stats.strikeouts,
      strikeoutRate,
      strikeoutPercentage,
      swingingStrikeRate,
      whiff: pitchMixData?.controlMetrics?.chaseRate,
      pitchMix: pitchMixData || undefined,
      zonePct,
      outsidePitchPct,
      firstPitchStrikePercentage,
      strikeoutStuff,
    };
  } catch (error) {
    console.error(
      `Error fetching strikeout stats for pitcher ${pitcherId}:`,
      error
    );
    return undefined;
  }
}

/**
 * Analyze opponent team strikeout vulnerability
 */
export async function getTeamStrikeoutVulnerability(
  teamId: number,
  season: number = new Date().getFullYear()
): Promise<{
  teamName?: string;
  gamesPlayed: number;
  strikeouts: number;
  strikeoutsPerGame: number;
  strikeoutRate: number; // K%
  strikeoutVulnerability: number; // 1-10 scale
} | null> {
  try {
    const teamStats = await getTeamStats(teamId, season);

    if (!teamStats) {
      console.log(
        `No team stats available for team ${teamId}, using league average values`
      );
      return {
        teamName: "Unknown",
        gamesPlayed: 0,
        strikeouts: 0,
        strikeoutsPerGame: 8.5, // League average
        strikeoutRate: 0.22, // League average
        strikeoutVulnerability: 5.0, // Neutral
      };
    }

    const { stats } = teamStats;

    // Calculate strikeout vulnerability
    const strikeoutsPerGame = stats.strikeouts / (stats.gamesPlayed || 1);
    const strikeoutRate =
      stats.strikeouts / (stats.plateAppearances || stats.atBats || 1);

    // Scale from 1-10 where 5 is league average
    // Higher number means more vulnerable to strikeouts
    const leagueAvgKPerGame = 8.5;
    const vulnerability =
      5 + ((strikeoutsPerGame - leagueAvgKPerGame) / leagueAvgKPerGame) * 5;

    return {
      teamName: teamStats.name,
      gamesPlayed: stats.gamesPlayed || 0,
      strikeouts: stats.strikeouts || 0,
      strikeoutsPerGame,
      strikeoutRate,
      strikeoutVulnerability: Math.max(1, Math.min(10, vulnerability)),
    };
  } catch (error) {
    console.error(
      `Error getting team strikeout vulnerability for team ${teamId}:`,
      error
    );
    // Return league average values as fallback
    return {
      teamName: "Unknown",
      gamesPlayed: 0,
      strikeouts: 0,
      strikeoutsPerGame: 8.5,
      strikeoutRate: 0.22,
      strikeoutVulnerability: 5.0,
    };
  }
}

/**
 * Calculate expected strikeouts for a pitcher in a specific game
 */
export async function calculateExpectedStrikeouts(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear()
): Promise<{
  expectedStrikeouts: number;
  expectedInnings: number;
  strikeoutProjection: {
    low: number;
    mid: number;
    high: number;
  };
  expectedDfsPoints: number;
  factors: {
    pitcherSkill: number;
    opponentVulnerability: number;
    gameEnvironment: number;
    recentPerformance: number;
  };
  confidenceScore: number;
}> {
  try {
    // Get pitcher stats for both current and previous season
    const [currentSeasonStats, previousSeasonStats] = await Promise.all([
      getPitcherStats({ pitcherId, season }),
      getPitcherStats({ pitcherId, season: season - 1 }),
    ]);

    // Use current season stats if available, otherwise fall back to previous season
    const pitcherStats = currentSeasonStats || previousSeasonStats;

    if (!pitcherStats) {
      // If no data is available for either season, return conservative default values
      return {
        expectedStrikeouts: 4.0, // League average for 5 innings
        expectedInnings: 5.0,
        strikeoutProjection: {
          low: 3.0,
          mid: 4.0,
          high: 5.0,
        },
        expectedDfsPoints: 4.0, // 1 point per strikeout
        factors: {
          pitcherSkill: 5.0,
          opponentVulnerability: 5.0,
          gameEnvironment: 1.0,
          recentPerformance: 5.0,
        },
        confidenceScore: 30, // Low confidence due to missing data
      };
    }

    // Get game environment data
    const gameEnvironment = await getGameEnvironmentData({ gamePk });

    // Get game feed for opponent info
    const gameFeed = await getGameFeed({ gamePk });

    // Get opponent team ID
    const isHome =
      gameFeed?.gameData?.teams?.home?.team?.name === pitcherStats.currentTeam;
    const opponentTeam = isHome
      ? gameFeed?.gameData?.teams?.away
      : gameFeed?.gameData?.teams?.home;
    const opponentId = opponentTeam?.team?.id;

    // Get opponent strikeout vulnerability
    const opponentVulnerability = opponentId
      ? await getTeamStrikeoutVulnerability(opponentId, season)
      : null;

    // Calculate base strikeout rate (K/9)
    const baseK9 =
      pitcherStats.seasonStats.inningsPitched > 0
        ? (pitcherStats.seasonStats.strikeouts /
            pitcherStats.seasonStats.inningsPitched) *
          9
        : 7.5; // League average K/9

    // Get expected innings
    const expectedInnings = 5.0; // Conservative estimate

    // Calculate expected strikeouts
    let expectedStrikeouts = (baseK9 / 9) * expectedInnings;

    // Adjust for opponent
    if (opponentVulnerability) {
      const opponentMultiplier =
        opponentVulnerability.strikeoutVulnerability / 5;
      expectedStrikeouts *= opponentMultiplier;
    }

    // Adjust for environment
    const environmentMultiplier =
      calculateEnvironmentMultiplier(gameEnvironment);
    expectedStrikeouts *= environmentMultiplier;

    // Calculate projections
    const strikeoutProjection = {
      low: Math.max(0, Math.round(expectedStrikeouts * 0.7)),
      mid: Math.round(expectedStrikeouts),
      high: Math.round(expectedStrikeouts * 1.3),
    };

    // Calculate DFS points (1 point per strikeout)
    const expectedDfsPoints = expectedStrikeouts;

    return {
      expectedStrikeouts,
      expectedInnings,
      strikeoutProjection,
      expectedDfsPoints,
      factors: {
        pitcherSkill: calculatePitcherSkillRating(pitcherStats),
        opponentVulnerability:
          opponentVulnerability?.strikeoutVulnerability || 5.0,
        gameEnvironment: environmentMultiplier,
        recentPerformance: 5.0, // Default to neutral
      },
      confidenceScore: calculateConfidenceScore(
        pitcherStats,
        opponentVulnerability
      ),
    };
  } catch (error) {
    console.error(
      `Error calculating expected strikeouts for pitcher ${pitcherId}:`,
      error
    );
    // Return conservative default values on error
    return {
      expectedStrikeouts: 4.0,
      expectedInnings: 5.0,
      strikeoutProjection: {
        low: 3.0,
        mid: 4.0,
        high: 5.0,
      },
      expectedDfsPoints: 4.0,
      factors: {
        pitcherSkill: 5.0,
        opponentVulnerability: 5.0,
        gameEnvironment: 1.0,
        recentPerformance: 5.0,
      },
      confidenceScore: 30,
    };
  }
}

function calculateEnvironmentMultiplier(gameEnvironment: any): number {
  let multiplier = 1.0;

  if (gameEnvironment?.isOutdoor) {
    // Temperature affects strikeout rates
    if (gameEnvironment.temperature > 90) {
      multiplier *= 0.95; // Hot weather reduces strikeouts
    } else if (gameEnvironment.temperature < 40) {
      multiplier *= 0.95; // Cold weather reduces strikeouts
    }

    // Wind can affect strikeouts
    if (gameEnvironment.windSpeed > 15) {
      multiplier *= 0.95; // Strong winds reduce strikeouts
    }
  }

  return Math.max(0.8, Math.min(1.2, multiplier));
}

function calculatePitcherSkillRating(pitcherStats: any): number {
  const stats = pitcherStats.seasonStats;
  let rating = 5.0; // Start at average

  if (stats.inningsPitched > 0) {
    const k9 = (stats.strikeouts / stats.inningsPitched) * 9;

    // Adjust based on K/9
    if (k9 > 10) {
      rating += 2.0; // Elite strikeout rate
    } else if (k9 > 8.5) {
      rating += 1.0; // Above average strikeout rate
    } else if (k9 < 6.5) {
      rating -= 1.0; // Below average strikeout rate
    }

    // Adjust based on walk rate
    const bb9 = (stats.walks / stats.inningsPitched) * 9;
    if (bb9 < 2.5) {
      rating += 0.5; // Good control
    } else if (bb9 > 4) {
      rating -= 0.5; // Poor control
    }
  }

  return Math.max(1, Math.min(10, rating));
}

function calculateConfidenceScore(
  pitcherStats: any,
  opponentVulnerability: any
): number {
  let score = 50; // Base confidence

  // Adjust based on sample size
  if (pitcherStats.seasonStats.inningsPitched > 30) {
    score += 20;
  } else if (pitcherStats.seasonStats.inningsPitched > 15) {
    score += 10;
  }

  // Adjust based on opponent data
  if (opponentVulnerability?.gamesPlayed > 10) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
