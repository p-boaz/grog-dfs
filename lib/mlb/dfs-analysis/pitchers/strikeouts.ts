/**
 * Specialized functions for analyzing strikeout potential for pitchers
 */

import { getGameEnvironmentData } from "../../weather/weather";
import { getTeamStats } from "../../schedule/schedule";
import { getEnhancedPitcherData, EnhancedPitcherData } from "../../services/pitcher-data-service";
import { PitcherPitchMixData } from "../../types/player/pitcher";
import { Pitcher, isPitcherStats } from "../../types/domain/player";
import { StrikeoutProjection } from "../../types/analysis/pitcher";

/**
 * Pitcher strikeout statistics and metrics
 */
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
  pitchMix?: Partial<{
    fastballPct?: number;
    sliderPct?: number;
    curvePct?: number;
    changeupPct?: number;
    cutterPct?: number;
    splitterPct?: number;
    otherPct?: number;
    avgFastballVelo?: number;
    maxFastballVelo?: number;
    controlMetrics?: {
      zonePercentage?: number;
      firstPitchStrikePercent?: number;
      swingingStrikePercent?: number;
      chaseRate?: number;
    };
  }>;
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
    // Fetch enhanced pitcher data with MLB and Statcast metrics
    const pitcherData: EnhancedPitcherData = await getEnhancedPitcherData(pitcherId);

    if (!pitcherData || !pitcherData.seasonStats.gamesPlayed) {
      console.log(
        `No pitching stats found for pitcher ${pitcherId}, current season`
      );
      return undefined;
    }

    // Extract pitching stats
    const stats = pitcherData.seasonStats;

    // Calculate strikeout rate - strikeouts per 9 innings
    const strikeoutRate =
      stats.inningsPitched > 0
        ? (stats.strikeouts / stats.inningsPitched) * 9
        : 0;

    // Calculate strikeout percentage - strikeouts per batter faced
    // Use battersFaced if available, otherwise estimate
    const battersFaced = stats.battersFaced || stats.inningsPitched * 4.3; // MLB average is ~4.3 batters per inning
    const strikeoutPercentage =
      battersFaced > 0 ? stats.strikeouts / battersFaced : 0;

    // Use advanced metrics from controlMetrics if available
    const swingingStrikeRate = pitcherData.controlMetrics?.whiffRate || 10;
    const zonePct = pitcherData.controlMetrics?.zoneRate || 45;
    const outsidePitchPct = 100 - zonePct;
    const firstPitchStrikePercentage =
      pitcherData.controlMetrics?.firstPitchStrike || 60;
    const whiffRate = pitcherData.controlMetrics?.whiffRate;
    const chaseRate = pitcherData.controlMetrics?.chaseRate;

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

    // If chase rate is available, factor that in
    if (chaseRate) {
      if (chaseRate > 32) strikeoutStuff += 0.5; // Above average chase rate
      else if (chaseRate < 26) strikeoutStuff -= 0.5; // Below average chase rate
    }

    // Ensure rating is within 1-10 scale
    strikeoutStuff = Math.max(1, Math.min(10, strikeoutStuff));

    // Prepare pitch mix data if available from Statcast
    let pitchMix: PitcherStrikeoutStats['pitchMix'] = undefined;
    if (pitcherData.pitchData) {
      pitchMix = {
        fastballPct:
          (pitcherData.pitchData.pitchTypes.fastball || 0) +
          (pitcherData.pitchData.pitchTypes.sinker || 0),
        sliderPct: pitcherData.pitchData.pitchTypes.slider || 0,
        curvePct: pitcherData.pitchData.pitchTypes.curve || 0,
        changeupPct: pitcherData.pitchData.pitchTypes.changeup || 0,
        cutterPct: pitcherData.pitchData.pitchTypes.cutter || 0,
        splitterPct: pitcherData.pitchData.pitchTypes.splitter || 0,
        otherPct: pitcherData.pitchData.pitchTypes.other || 0,
        avgFastballVelo: pitcherData.pitchData.velocities.avgFastball || 0,
        maxFastballVelo: pitcherData.pitchData.velocities.maxFastball || 0,
        controlMetrics: {
          zonePercentage: zonePct,
          firstPitchStrikePercent: firstPitchStrikePercentage,
          swingingStrikePercent: swingingStrikeRate,
          chaseRate: chaseRate || 0,
        },
      };
    }

    return {
      name: pitcherData.fullName,
      teamName: currentTeam,
      gamesStarted: stats.gamesStarted,
      inningsPitched: stats.inningsPitched,
      strikeouts: stats.strikeouts,
      strikeoutRate,
      strikeoutPercentage,
      swingingStrikeRate,
      whiff: whiffRate,
      pitchMix,
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

    // Access hitting stats directly since TeamStats doesn't have a stats property
    const stats = teamStats.hitting || {};

    // Calculate strikeout vulnerability
    const strikeoutsPerGame =
      (stats.strikeouts || 0) / (stats.gamesPlayed || 1);
    const strikeoutRate =
      (stats.strikeouts || 0) / (stats.plateAppearances || stats.atBats || 1);

    // Scale from 1-10 where 5 is league average
    // Higher number means more vulnerable to strikeouts
    const leagueAvgKPerGame = 8.5;
    const vulnerability =
      5 + ((strikeoutsPerGame - leagueAvgKPerGame) / leagueAvgKPerGame) * 5;

    return {
      teamName: teamStats.name || `Team ${teamId}`,
      gamesPlayed: stats.gamesPlayed || 0,
      strikeouts: stats.strikeouts || 0,
      strikeoutsPerGame,
      strikeoutRate,
      strikeoutVulnerability: Math.max(1, Math.min(10, vulnerability)),
    };
  } catch (error) {
    console.error(
      `Error fetching team strikeout vulnerability for team ${teamId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected strikeouts for a pitcher against a specific team
 */
export async function calculateExpectedStrikeouts(
  pitcherId: number,
  opposingTeamId: number,
  gameId?: string,
  inningsPitched?: number
): Promise<StrikeoutProjection & {
  lowRange: number;
  highRange: number;
  expectedRatePerInning: number;
  factors: {
    pitcherBaseline: number;
    teamVulnerability: number;
    ballpark: number;
    weather: number;
  };
  expectedDfsPoints: number; // DK points from Ks (2 points per K)
}> {
  try {
    // Get pitcher data
    const pitcherData: EnhancedPitcherData = await getEnhancedPitcherData(pitcherId);
    if (!pitcherData) {
      throw new Error(`Could not find pitcher data for ${pitcherId}`);
    }

    // Validate pitcher stats using type guard
    if (!pitcherData.seasonStats) {
      console.warn(`Invalid pitcher stats for player ${pitcherId}`);
      return getDefaultStrikeoutProjection();
    }

    const currentTeam = pitcherData.currentTeam;

    // Get all data in parallel
    const [strikeoutStats, teamVulnerability, environmentData] =
      await Promise.all([
        getPitcherStrikeoutStats(pitcherId, currentTeam),
        getTeamStrikeoutVulnerability(opposingTeamId),
        gameId ? getGameEnvironmentData({ gamePk: gameId }) : null,
      ]);

    // Determine baseline strikeout rate (per inning)
    let baselineKRate = 1.0; // MLB average is ~1 K per inning
    if (strikeoutStats) {
      baselineKRate =
        strikeoutStats.inningsPitched > 0
          ? strikeoutStats.strikeouts / strikeoutStats.inningsPitched
          : 1.0;
    }

    // Adjust for team vulnerability
    let teamFactor = 1.0;
    if (teamVulnerability) {
      // Scale team vulnerability (1-10) to adjustment factor
      teamFactor = teamVulnerability.strikeoutVulnerability / 5.0;
    }

    // Adjust for environment (weather, ballpark)
    let environmentFactor = 1.0;

    // Apply conservative adjustments for specific factors
    if (environmentData) {
      // Check if outdoor game with extreme temperatures
      if (
        environmentData.isOutdoor &&
        typeof environmentData.temperature === "number"
      ) {
        if (environmentData.temperature > 90) {
          environmentFactor *= 1.05; // Hot weather: slight increase in Ks (tired batters)
        } else if (environmentData.temperature < 40) {
          environmentFactor *= 1.1; // Cold weather: more Ks (harder to make contact)
        }
      }

      // Ballpark factor (some parks have higher K rates)
      // This would be more sophisticated in a real implementation
      if ("venue" in environmentData && environmentData.venue) {
        // Neutral by default
      }
    }

    // Use provided innings pitched or estimate from history
    const expectedInnings =
      inningsPitched ||
      (strikeoutStats && strikeoutStats.gamesStarted > 0
        ? strikeoutStats.inningsPitched / strikeoutStats.gamesStarted
        : 5.0);

    // Calculate adjusted K rate using all factors
    const adjustedKRate = baselineKRate * teamFactor * environmentFactor;

    // Calculate expected strikeouts for this game
    const expectedStrikeouts = adjustedKRate * expectedInnings;

    // Calculate range (low to high)
    const lowRange = Math.max(0, expectedStrikeouts * 0.7);
    const highRange = expectedStrikeouts * 1.3;

    // Determine confidence level (1-10 scale)
    let confidence = 5; // Default mid-level confidence

    // Adjust confidence based on sample size
    if (strikeoutStats) {
      if (strikeoutStats.inningsPitched > 100) {
        confidence += 2; // Large sample size
      } else if (strikeoutStats.inningsPitched > 50) {
        confidence += 1; // Decent sample size
      } else if (strikeoutStats.inningsPitched < 20) {
        confidence -= 1; // Small sample size
      }

      // Higher confidence with Statcast data
      if (strikeoutStats.whiff !== undefined) {
        confidence += 1;
      }
    }

    // Ensure confidence is within 1-10 range
    confidence = Math.max(1, Math.min(10, confidence));

    // Calculate expected DFS points (2 points per K)
    const expectedDfsPoints = expectedStrikeouts * 2;

    return {
      expectedStrikeouts,
      lowRange,
      highRange,
      expectedRatePerInning: adjustedKRate,
      perInningRate: adjustedKRate,
      confidence,
      ranges: {
        low: lowRange,
        high: highRange
      },
      factors: {
        pitcherBaseline: baselineKRate,
        teamVulnerability: teamFactor,
        ballpark: environmentFactor,
        weather: environmentFactor,
        pitcherKRate: baselineKRate * 5,
        opposingTeamKRate: teamFactor * 5,
        parkFactor: environmentFactor * 5,
      },
      expectedDfsPoints,
    };
  } catch (error) {
    console.error(
      `Error calculating expected strikeouts for pitcher ${pitcherId} vs team ${opposingTeamId}:`,
      error
    );

    return getDefaultStrikeoutProjection();
  }
}

/**
 * Helper function to create a default strikeout projection
 */
function getDefaultStrikeoutProjection(): StrikeoutProjection & {
  lowRange: number;
  highRange: number;
  expectedRatePerInning: number;
  factors: {
    pitcherBaseline: number;
    teamVulnerability: number;
    ballpark: number;
    weather: number;
  };
  expectedDfsPoints: number;
} {
  return {
    expectedStrikeouts: 5.0, // Default to league average
    lowRange: 3.0,
    highRange: 7.0,
    expectedRatePerInning: 1.0,
    perInningRate: 1.0,
    confidence: 3, // Low confidence due to error
    ranges: {
      low: 3.0,
      high: 7.0
    },
    factors: {
      pitcherBaseline: 1.0,
      teamVulnerability: 1.0,
      ballpark: 1.0,
      weather: 1.0,
      pitcherKRate: 5.0,
      opposingTeamKRate: 5.0,
      parkFactor: 5.0,
    },
    expectedDfsPoints: 10.0, // 5 Ks * 2 points
  };
}