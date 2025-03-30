/**
 * Specialized functions for analyzing run production (Runs and RBIs)
 * Each run and RBI is worth +2 points in DraftKings
 */

import { getProbableLineups } from "../game/lineups";
import { getBallparkFactors } from "../index";
import { getBatterStats } from "../player/batter-stats";
import { getPitcherStats } from "../player/pitcher-stats";
import { getTeamStats } from "../schedule/schedule";

// Points awarded in DraftKings for runs and RBIs
export const RUN_POINTS = 2;
export const RBI_POINTS = 2;

// Lineup position importance for run production
// These are the relative weights for converting batting lineup position to run/RBI expectations
// Leadoff hitters score more runs, middle-order hitters get more RBIs
export const LINEUP_RUN_WEIGHTS = {
  1: 1.4, // Leadoff hitters score the most runs
  2: 1.3,
  3: 1.2,
  4: 1.1,
  5: 1.0,
  6: 0.9,
  7: 0.8,
  8: 0.7,
  9: 0.6, // 9-hole typically scores fewest runs
};

export const LINEUP_RBI_WEIGHTS = {
  1: 0.7, // Leadoff hitters get fewer RBIs
  2: 0.9,
  3: 1.4, // 3-4-5 hitters get the most RBIs
  4: 1.5,
  5: 1.3,
  6: 1.1,
  7: 0.9,
  8: 0.8,
  9: 0.7,
};

/**
 * Get player's season stats with focus on run production metrics
 *
 * @param playerId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Object with run production statistics
 */
export async function getPlayerRunProductionStats(
  playerId: number,
  season = new Date().getFullYear()
): Promise<{
  runs: number;
  rbi: number;
  games: number;
  plateAppearances: number;
  runsPerGame: number;
  rbiPerGame: number;
  onBasePercentage: number;
  sluggingPct: number;
  battingAverage: number;
  runningSpeed?: number; // 0-100 scale
  battedBallProfile?: {
    flyBallPct: number;
    lineDrivePct: number;
    groundBallPct: number;
    hardHitPct: number;
  };
} | null> {
  try {
    // Fetch full player stats
    const playerData = await getBatterStats({
      batterId: playerId,
      season,
    });

    // Skip pitchers unless they have significant batting stats
    if (
      playerData.primaryPosition === "P" &&
      playerData.seasonStats.atBats < 20
    ) {
      return null;
    }

    // Extract season batting stats
    const batting = playerData.seasonStats;

    // If we don't have the stats we need, return null
    if (!batting || !batting.gamesPlayed || !batting.atBats) {
      console.log(
        `No batting stats found for player ${playerId}, season ${season}`
      );
      return null;
    }

    // Calculate plate appearances (rough estimate if not provided)
    const plateAppearances =
      batting.plateAppearances ||
      batting.atBats + (batting.walks || 0) + (batting.hitByPitches || 0);

    // Calculate rate stats
    const runsPerGame =
      batting.gamesPlayed > 0 ? (batting.runs || 0) / batting.gamesPlayed : 0;
    const rbiPerGame =
      batting.gamesPlayed > 0 ? (batting.rbi || 0) / batting.gamesPlayed : 0;

    return {
      runs: batting.runs || 0,
      rbi: batting.rbi || 0,
      games: batting.gamesPlayed,
      plateAppearances,
      runsPerGame,
      rbiPerGame,
      onBasePercentage: batting.obp || 0,
      sluggingPct: batting.slg || 0,
      battingAverage: batting.avg || 0,
      // These would come from Statcast data in a real implementation
      runningSpeed: 50, // Default average running speed
      battedBallProfile: {
        flyBallPct: 0.35, // Default values
        lineDrivePct: 0.2,
        groundBallPct: 0.45,
        hardHitPct: 0.35,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching run production stats for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get career run production metrics and trends
 */
export async function getCareerRunProductionProfile(playerId: number): Promise<{
  careerRuns: number;
  careerRBI: number;
  careerGames: number;
  careerRunsPerGame: number;
  careerRBIPerGame: number;
  bestSeasonRuns: number;
  bestSeasonRBI: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  seasonToSeasonVariance: number; // 0-1 scale, how consistent are the player's run production numbers
} | null> {
  try {
    // Get player stats with historical data
    const playerData = await getBatterStats({
      batterId: playerId,
    });

    if (
      !playerData ||
      !playerData.careerStats ||
      playerData.careerStats.length === 0
    ) {
      return null;
    }

    // Get career totals
    let careerRuns = 0;
    let careerRBI = 0;
    let careerGames = 0;
    let bestSeasonRuns = 0;
    let bestSeasonRBI = 0;

    // Track recent seasons for trend analysis (last 3 seasons)
    const recentSeasons: Array<{
      season: string;
      runsPerGame: number;
      rbiPerGame: number;
    }> = [];

    // Track season-to-season variations
    const seasonVariations: Array<number> = [];
    let previousRunsPerGame: number | null = null;
    let previousRBIPerGame: number | null = null;

    // Process each season
    playerData.careerStats.forEach((season) => {
      const seasonRuns = "runs" in season ? (season.runs as number) || 0 : 0;
      const seasonRBI = "rbi" in season ? (season.rbi as number) || 0 : 0;
      const seasonGames = season.gamesPlayed || 0;

      // Update career totals
      careerRuns += seasonRuns;
      careerRBI += seasonRBI;
      careerGames += seasonGames;

      // Check for best seasons
      if (seasonRuns > bestSeasonRuns) {
        bestSeasonRuns = seasonRuns;
      }
      if (seasonRBI > bestSeasonRBI) {
        bestSeasonRBI = seasonRBI;
      }

      // Rate stats for the season (if enough games played)
      if (seasonGames >= 20) {
        const runsPerGame = seasonRuns / seasonGames;
        const rbiPerGame = seasonRBI / seasonGames;

        // Track recent seasons for trend analysis
        const currentYear = new Date().getFullYear();
        const seasonYear = parseInt(season.season);
        if (seasonYear >= currentYear - 3) {
          recentSeasons.push({
            season: season.season,
            runsPerGame,
            rbiPerGame,
          });
        }

        // Track season-to-season variation
        if (previousRunsPerGame !== null && previousRBIPerGame !== null) {
          // Calculate change from previous season
          const runChange =
            Math.abs(runsPerGame - previousRunsPerGame) / previousRunsPerGame;
          const rbiChange =
            Math.abs(rbiPerGame - previousRBIPerGame) / previousRBIPerGame;

          // Average the changes
          const avgChange = (runChange + rbiChange) / 2;
          seasonVariations.push(avgChange);
        }

        // Update previous season values
        previousRunsPerGame = runsPerGame;
        previousRBIPerGame = rbiPerGame;
      }
    });

    // Calculate career per-game rates
    const careerRunsPerGame = careerGames > 0 ? careerRuns / careerGames : 0;
    const careerRBIPerGame = careerGames > 0 ? careerRBI / careerGames : 0;

    // Determine trend (simplified)
    let recentTrend: "increasing" | "decreasing" | "stable" = "stable";

    if (recentSeasons.length >= 2) {
      // Sort by season (descending)
      recentSeasons.sort((a, b) => parseInt(b.season) - parseInt(a.season));

      // Calculate combined run production metric
      const currentProduction =
        recentSeasons[0].runsPerGame + recentSeasons[0].rbiPerGame;
      const previousProduction =
        recentSeasons[1].runsPerGame + recentSeasons[1].rbiPerGame;

      // Compare most recent to previous
      if (currentProduction > previousProduction * 1.15) {
        recentTrend = "increasing";
      } else if (currentProduction < previousProduction * 0.85) {
        recentTrend = "decreasing";
      }
    }

    // Calculate consistency (lower variance = more consistent)
    // Average all the season-to-season variations
    let seasonToSeasonVariance = 0.3; // Default medium variance
    if (seasonVariations.length > 0) {
      const avgVariation =
        seasonVariations.reduce((sum, val) => sum + val, 0) /
        seasonVariations.length;
      // Convert to 0-1 scale where 0 is completely consistent
      seasonToSeasonVariance = Math.min(1, avgVariation);
    }

    return {
      careerRuns,
      careerRBI,
      careerGames,
      careerRunsPerGame,
      careerRBIPerGame,
      bestSeasonRuns,
      bestSeasonRBI,
      recentTrend,
      seasonToSeasonVariance,
    };
  } catch (error) {
    console.error(
      `Error fetching career run production profile for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get team offensive stats for scoring context
 */
export async function getTeamOffensiveContext(
  teamId: number,
  season = new Date().getFullYear()
): Promise<{
  runsPerGame: number;
  teamOffensiveRating: number; // 0-100 scale
  lineupStrength: {
    overall: number; // 0-100 scale
    topOfOrder: number; // 0-100 scale
    bottomOfOrder: number; // 0-100 scale
  };
  runnersOnBaseFrequency: number; // Estimated % of time runners are on base
} | null> {
  try {
    // Get team stats
    const teamData = await getTeamStats(teamId, season);

    if (!teamData || !("hitting" in teamData)) {
      return null;
    }

    const stats = teamData.hitting || {};

    // Calculate key metrics
    const gamesPlayed = stats.gamesPlayed || 162; // Default to full season if not available
    const runsPerGame = (stats.runs || 0) / gamesPlayed;

    // MLB average runs per game is ~4.5
    // Convert to 0-100 scale where 50 is league average
    const teamOffensiveRating = 50 * (runsPerGame / 4.5);

    // Estimate lineup strength based on offensive metrics
    // In a real implementation, this would analyze the actual lineup
    const overallStrength = teamOffensiveRating;

    // For simplicity, estimate top/bottom lineup strength
    // In reality, this would use actual player stats from each lineup position
    const topOfOrder = overallStrength * 1.1; // Top of order typically stronger
    const bottomOfOrder = overallStrength * 0.9; // Bottom of order typically weaker

    // Estimate runners on base frequency using OBP
    // League average OBP is ~.320
    const teamOBP = stats.obp || 0.32;
    const runnersOnBaseFrequency = teamOBP + 0.05; // Adjust upward for baserunners from errors, etc.

    return {
      runsPerGame,
      teamOffensiveRating: Math.min(100, Math.max(0, teamOffensiveRating)),
      lineupStrength: {
        overall: Math.min(100, Math.max(0, overallStrength)),
        topOfOrder: Math.min(100, Math.max(0, topOfOrder)),
        bottomOfOrder: Math.min(100, Math.max(0, bottomOfOrder)),
      },
      runnersOnBaseFrequency,
    };
  } catch (error) {
    console.error(
      `Error fetching team offensive context for team ${teamId}:`,
      error
    );
    return null;
  }
}

/**
 * Get ballpark run factors
 */
export async function getBallparkRunFactor(venueId: number): Promise<{
  overall: number;
  runFactor: number;
  rbiFactor: number;
} | null> {
  try {
    const season = new Date().getFullYear().toString();
    const factors = await getBallparkFactors({
      venueId,
      season,
    });

    if (!factors) {
      return null;
    }

    // Return specific run factors
    // RBI factor is typically very close to run factor
    return {
      overall: factors.overall,
      runFactor: factors.types.runs,
      rbiFactor: factors.types.runs, // Using run factor for RBIs
    };
  } catch (error) {
    console.error(
      `Error fetching ballpark run factors for venue ${venueId}:`,
      error
    );
    return null;
  }
}

/**
 * Get lineup position and batting order context for a player
 */
export async function getLineupContext(
  playerId: number,
  gameId: string
): Promise<{
  lineupPosition: number | null;
  battingOrder: string | null; // "top" | "middle" | "bottom"
  hittersBehind: number; // Number of hitters behind in lineup
  hittersAhead: number; // Number of hitters ahead in lineup
  expectedRunOpportunities: number; // Estimated times runner will be on base ahead of batter
  expectedRbiOpportunities: number; // Estimated times runner will be on base for batter to drive in
} | null> {
  try {
    // Get lineup information
    const lineupData = await getProbableLineups({
      gamePk: gameId,
    });

    if (!lineupData) {
      return null;
    }

    // Find player in either home or away lineup
    const homeLineup = lineupData.homeBatters || [];
    const awayLineup = lineupData.awayBatters || [];

    let position = null;
    let isHome = false;

    // Check home lineup
    for (let i = 0; i < homeLineup.length; i++) {
      if (homeLineup[i].id === playerId) {
        position = i + 1; // 1-based position
        isHome = true;
        break;
      }
    }

    // Check away lineup if not found in home
    if (position === null) {
      for (let i = 0; i < awayLineup.length; i++) {
        if (awayLineup[i].id === playerId) {
          position = i + 1; // 1-based position
          break;
        }
      }
    }

    // If player not found in either lineup, return null
    if (position === null) {
      return null;
    }

    // Determine batting order section
    let battingOrder: string;
    if (position <= 3) {
      battingOrder = "top";
    } else if (position <= 6) {
      battingOrder = "middle";
    } else {
      battingOrder = "bottom";
    }

    // Calculate hitters ahead and behind
    // Assuming 9 hitters in lineup
    const lineupSize = 9;
    const hittersAhead = position - 1;
    const hittersBehind = lineupSize - position;

    // Estimate opportunities based on position
    // These would be more sophisticated in a real implementation
    const lineupRuns =
      LINEUP_RUN_WEIGHTS[position as keyof typeof LINEUP_RUN_WEIGHTS] || 1.0;
    const lineupRBIs =
      LINEUP_RBI_WEIGHTS[position as keyof typeof LINEUP_RBI_WEIGHTS] || 1.0;

    // Base opportunities - these would be calibrated in a real system
    const baseRunOpportunities = 0.9; // Times per game player will have scoring opportunity
    const baseRbiOpportunities = 1.1; // Times per game player will have RBI opportunity

    // Adjust by lineup weights
    const expectedRunOpportunities = baseRunOpportunities * lineupRuns;
    const expectedRbiOpportunities = baseRbiOpportunities * lineupRBIs;

    return {
      lineupPosition: position,
      battingOrder,
      hittersAhead,
      hittersBehind,
      expectedRunOpportunities,
      expectedRbiOpportunities,
    };
  } catch (error) {
    console.error(
      `Error getting lineup context for player ${playerId} in game ${gameId}:`,
      error
    );
    return null;
  }
}

/**
 * Get pitcher's propensity to allow runs
 */
export async function getPitcherRunAllowance(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<{
  gamesStarted: number;
  inningsPitched: number;
  earnedRuns: number;
  runsAllowed: number;
  era: number; // Earned Run Average
  runsPer9: number;
  whip: number; // Walks + Hits per Inning Pitched
  runScoringOpportunityRate: number; // Rate of creating run scoring opportunities
  runAllowanceRating: number; // 0-10 scale where 5 is average
} | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    if (!pitcherData) {
      return null;
    }

    // Get the stats for the specific season
    const currentSeason = season.toString();
    const stats = pitcherData.seasonStats[currentSeason] || {
      gamesPlayed: 0,
      gamesStarted: 0,
      inningsPitched: 0,
      wins: 0,
      losses: 0,
      era: 4.5, // MLB average ERA
      whip: 1.3, // League average WHIP
      strikeouts: 0,
      walks: 0,
      saves: 0,
      hitBatsmen: 0,
    };

    // Parse numeric values with safeguards
    const ip = parseFloat(stats.inningsPitched.toString());
    const era = parseFloat(stats.era.toString()) || 4.5; // MLB average if not available
    const whip = parseFloat(stats.whip.toString()) || 1.3; // MLB average if not available

    // Estimate earned runs and total runs
    const earnedRuns = Math.round((era * ip) / 9);
    const runsAllowed = Math.round(earnedRuns * 1.1); // ~10% of runs are unearned

    // Calculate runs per 9 innings
    const runsPer9 = (runsAllowed / ip) * 9;

    // Calculate opportunity rate from WHIP
    // WHIP correlates with runners getting on base (opportunities for runs)
    const runScoringOpportunityRate = whip * 0.25; // Estimated rate of runners in scoring position

    // Calculate run allowance rating on 0-10 scale where 5 is average
    // 4.5 ERA is approximately average
    const runAllowanceRating = 5 * (era / 4.5);

    return {
      gamesStarted: stats.gamesStarted || 0,
      inningsPitched: ip,
      earnedRuns,
      runsAllowed,
      era,
      runsPer9,
      whip,
      runScoringOpportunityRate,
      runAllowanceRating: Math.max(1, Math.min(10, runAllowanceRating)),
    };
  } catch (error) {
    console.error(
      `Error fetching pitcher run allowance for player ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected runs scored for a player in a specific game
 */
export async function calculateExpectedRuns(
  batterId: number,
  gameId: string,
  opposingPitcherId: number,
  isHome: boolean
): Promise<{
  expectedRuns: number;
  confidenceScore: number; // 0-100
  factors: {
    playerBaseline: number;
    lineupPosition: number;
    teamOffense: number;
    pitcherQuality: number;
    ballpark: number;
    gameContext: number;
  };
}> {
  try {
    // Gather all required data in parallel
    const [
      playerStats,
      careerProfile,
      lineupContext,
      pitcherData,
      teamContext,
      ballparkData,
    ] = await Promise.all([
      getPlayerRunProductionStats(batterId).catch(() => null),
      getCareerRunProductionProfile(batterId).catch(() => null),
      getLineupContext(batterId, gameId).catch(() => null),
      getPitcherRunAllowance(opposingPitcherId).catch(() => null),
      // Get player data to find the team
      getBatterStats({ batterId })
        .then((data) => {
          // Use batter data to get team id
          let teamId = 0;

          if (data && typeof data.currentTeam === "object") {
            const team = data.currentTeam as Record<string, any>;
            if (team && "id" in team) {
              teamId = Number(team.id);
            }
          }

          if (!teamId) return null;
          return getTeamOffensiveContext(teamId).catch(() => null);
        })
        .catch(() => null),
      // Get pitcher data to find the venue
      getPitcherStats({ pitcherId: opposingPitcherId })
        .then((data) => {
          // Use pitcher data to get venue id
          let venueId = 0;

          if (data && typeof data.currentTeam === "object") {
            const team = data.currentTeam as Record<string, any>;
            if (team && "venueId" in team) {
              venueId = Number(team.venueId);
            }
          }

          if (!venueId) return null;
          return getBallparkRunFactor(venueId).catch(() => null);
        })
        .catch(() => null),
    ]);

    // Baseline runs per game from player's season stats or MLB average
    let baselineRunsPerGame = playerStats?.runsPerGame || 0.5; // Default to MLB average

    // If we have career data, blend with current season for more stability
    if (careerProfile && careerProfile.careerRunsPerGame) {
      // Weight current season more heavily, but include career data
      baselineRunsPerGame =
        (baselineRunsPerGame * 2 + careerProfile.careerRunsPerGame) / 3;
    }

    // Apply lineup position factor
    let lineupFactor = 1.0;
    if (lineupContext && lineupContext.lineupPosition) {
      // Get the factor from our lookup table
      const position = lineupContext.lineupPosition;
      lineupFactor =
        LINEUP_RUN_WEIGHTS[position as keyof typeof LINEUP_RUN_WEIGHTS] || 1.0;
    }

    // Apply team offense factor
    let teamFactor = 1.0;
    if (teamContext) {
      // Better offensive teams create more run opportunities for all batters
      teamFactor = teamContext.teamOffensiveRating / 50; // 50 is average
    }

    // Apply pitcher factor
    let pitcherFactor = 1.0;
    if (pitcherData) {
      // Inverse of pitcher quality: worse pitchers allow more runs
      pitcherFactor = pitcherData.runAllowanceRating / 5; // 5 is average
    }

    // Apply ballpark factor
    let ballparkFactor = 1.0;
    if (ballparkData) {
      ballparkFactor = ballparkData.runFactor;
    }

    // Apply game context factor (like weather, divisional game, etc)
    // This would be more sophisticated in a real implementation
    const gameContextFactor = 1.0;

    // Calculate final expected runs
    const expectedRuns =
      baselineRunsPerGame *
      lineupFactor *
      teamFactor *
      pitcherFactor *
      ballparkFactor *
      gameContextFactor;

    // Calculate confidence score
    let confidence = 70; // Start with baseline confidence

    // Adjust confidence based on data quality and player consistency
    if (lineupContext?.lineupPosition) confidence += 10;
    if (careerProfile?.seasonToSeasonVariance) {
      // More consistent players get higher confidence
      confidence += (1 - careerProfile.seasonToSeasonVariance) * 10;
    }

    // Return the projection
    return {
      expectedRuns,
      confidenceScore: Math.min(100, Math.max(0, confidence)),
      factors: {
        playerBaseline: baselineRunsPerGame,
        lineupPosition: lineupFactor,
        teamOffense: teamFactor,
        pitcherQuality: pitcherFactor,
        ballpark: ballparkFactor,
        gameContext: gameContextFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating expected runs for player ${batterId}:`,
      error
    );

    // Return conservative default values
    return {
      expectedRuns: 0.5, // MLB average
      confidenceScore: 50,
      factors: {
        playerBaseline: 0.5,
        lineupPosition: 1.0,
        teamOffense: 1.0,
        pitcherQuality: 1.0,
        ballpark: 1.0,
        gameContext: 1.0,
      },
    };
  }
}

/**
 * Calculate expected RBIs for a player in a specific game
 */
export async function calculateExpectedRBIs(
  batterId: number,
  gameId: string,
  opposingPitcherId: number,
  isHome: boolean
): Promise<{
  expectedRBIs: number;
  confidenceScore: number; // 0-100
  factors: {
    playerBaseline: number;
    lineupPosition: number;
    teamOffense: number;
    pitcherQuality: number;
    ballpark: number;
    battingSkill: number;
    gameContext: number;
  };
}> {
  try {
    // Gather all required data in parallel
    const [
      playerStats,
      careerProfile,
      lineupContext,
      pitcherData,
      teamContext,
      ballparkData,
    ] = await Promise.all([
      getPlayerRunProductionStats(batterId).catch(() => null),
      getCareerRunProductionProfile(batterId).catch(() => null),
      getLineupContext(batterId, gameId).catch(() => null),
      getPitcherRunAllowance(opposingPitcherId).catch(() => null),
      // Get player data to find the team
      getBatterStats({ batterId })
        .then((data) => {
          // Use batter data to get team id
          let teamId = 0;

          if (data && typeof data.currentTeam === "object") {
            const team = data.currentTeam as Record<string, any>;
            if (team && "id" in team) {
              teamId = Number(team.id);
            }
          }

          if (!teamId) return null;
          return getTeamOffensiveContext(teamId).catch(() => null);
        })
        .catch(() => null),
      // Get pitcher data to find the venue
      getPitcherStats({ pitcherId: opposingPitcherId })
        .then((data) => {
          // Use pitcher data to get venue id
          let venueId = 0;

          if (data && typeof data.currentTeam === "object") {
            const team = data.currentTeam as Record<string, any>;
            if (team && "venueId" in team) {
              venueId = Number(team.venueId);
            }
          }

          if (!venueId) return null;
          return getBallparkRunFactor(venueId).catch(() => null);
        })
        .catch(() => null),
    ]);

    // Baseline RBIs per game from player's season stats or MLB average
    let baselineRBIsPerGame = playerStats?.rbiPerGame || 0.5; // Default to MLB average

    // If we have career data, blend with current season for more stability
    if (careerProfile && careerProfile.careerRBIPerGame) {
      // Weight current season more heavily, but include career data
      baselineRBIsPerGame =
        (baselineRBIsPerGame * 2 + careerProfile.careerRBIPerGame) / 3;
    }

    // Apply lineup position factor
    let lineupFactor = 1.0;
    if (lineupContext && lineupContext.lineupPosition) {
      // Get the factor from our lookup table
      const position = lineupContext.lineupPosition;
      lineupFactor =
        LINEUP_RBI_WEIGHTS[position as keyof typeof LINEUP_RBI_WEIGHTS] || 1.0;
    }

    // Apply team offense factor
    let teamFactor = 1.0;
    if (teamContext) {
      // Better offensive teams get more runners on base for RBI opportunities
      teamFactor = teamContext.teamOffensiveRating / 50; // 50 is average
    }

    // Apply pitcher factor
    let pitcherFactor = 1.0;
    if (pitcherData) {
      // Inverse of pitcher quality: worse pitchers allow more runs
      pitcherFactor = pitcherData.runAllowanceRating / 5; // 5 is average
    }

    // Apply ballpark factor
    let ballparkFactor = 1.0;
    if (ballparkData) {
      ballparkFactor = ballparkData.rbiFactor;
    }

    // Apply batting skill factor (for RBIs, power and average with RISP are key)
    let battingSkillFactor = 1.0;
    if (playerStats) {
      // Calculate from player's stats
      // Higher slugging % players deliver more RBIs
      battingSkillFactor = (playerStats.sluggingPct / 0.4) * 0.7 + 0.3;
    }

    // Apply game context factor (like weather, divisional game, etc)
    // This would be more sophisticated in a real implementation
    const gameContextFactor = 1.0;

    // Calculate final expected RBIs
    const expectedRBIs =
      baselineRBIsPerGame *
      lineupFactor *
      teamFactor *
      pitcherFactor *
      ballparkFactor *
      battingSkillFactor *
      gameContextFactor;

    // Calculate confidence score
    let confidence = 70; // Start with baseline confidence

    // Adjust confidence based on data quality and player consistency
    if (lineupContext?.lineupPosition) confidence += 10;
    if (careerProfile?.seasonToSeasonVariance) {
      // More consistent players get higher confidence
      confidence += (1 - careerProfile.seasonToSeasonVariance) * 10;
    }

    // Return the projection
    return {
      expectedRBIs,
      confidenceScore: Math.min(100, Math.max(0, confidence)),
      factors: {
        playerBaseline: baselineRBIsPerGame,
        lineupPosition: lineupFactor,
        teamOffense: teamFactor,
        pitcherQuality: pitcherFactor,
        ballpark: ballparkFactor,
        battingSkill: battingSkillFactor,
        gameContext: gameContextFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating expected RBIs for player ${batterId}:`,
      error
    );

    // Return conservative default values
    return {
      expectedRBIs: 0.5, // MLB average
      confidenceScore: 50,
      factors: {
        playerBaseline: 0.5,
        lineupPosition: 1.0,
        teamOffense: 1.0,
        pitcherQuality: 1.0,
        ballpark: 1.0,
        battingSkill: 1.0,
        gameContext: 1.0,
      },
    };
  }
}

/**
 * Calculate expected DFS points from runs and RBIs for a player in a specific game
 */
export async function calculateRunProductionProjection(
  batterId: number,
  gameId: string,
  opposingPitcherId: number,
  isHome: boolean
): Promise<{
  runs: {
    expected: number;
    points: number;
    confidence: number;
  };
  rbis: {
    expected: number;
    points: number;
    confidence: number;
  };
  total: {
    expected: number;
    points: number;
    confidence: number;
  };
}> {
  try {
    // Get both runs and RBIs projections
    const [runsProjection, rbisProjection] = await Promise.all([
      calculateExpectedRuns(batterId, gameId, opposingPitcherId, isHome),
      calculateExpectedRBIs(batterId, gameId, opposingPitcherId, isHome),
    ]);

    // Calculate expected points (2 points per run and RBI)
    const runPoints = runsProjection.expectedRuns * RUN_POINTS;
    const rbiPoints = rbisProjection.expectedRBIs * RBI_POINTS;

    // Calculate total expected points
    const totalPoints = runPoints + rbiPoints;

    // Use weighted average of confidences based on point contribution
    const totalConfidence =
      (runsProjection.confidenceScore * runPoints +
        rbisProjection.confidenceScore * rbiPoints) /
      Math.max(0.001, totalPoints);

    return {
      runs: {
        expected: runsProjection.expectedRuns,
        points: runPoints,
        confidence: runsProjection.confidenceScore,
      },
      rbis: {
        expected: rbisProjection.expectedRBIs,
        points: rbiPoints,
        confidence: rbisProjection.confidenceScore,
      },
      total: {
        expected: runsProjection.expectedRuns + rbisProjection.expectedRBIs,
        points: totalPoints,
        confidence: Math.min(100, Math.max(0, totalConfidence)),
      },
    };
  } catch (error) {
    console.error(
      `Error calculating run production projection for player ${batterId}:`,
      error
    );

    // Return conservative default values
    return {
      runs: {
        expected: 0.5,
        points: 1.0,
        confidence: 50,
      },
      rbis: {
        expected: 0.5,
        points: 1.0,
        confidence: 50,
      },
      total: {
        expected: 1.0,
        points: 2.0,
        confidence: 50,
      },
    };
  }
}
