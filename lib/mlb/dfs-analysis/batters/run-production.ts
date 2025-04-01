/**
 * Specialized functions for analyzing run production (Runs and RBIs)
 * Each run and RBI is worth +2 points in DraftKings
 */

import { getGameFeed } from "../game/game-feed";
import { getBallparkFactors } from "../index";
import { getBatterStats } from "../player/batter-stats";
import { getPitcherStats } from "../player/pitcher-stats";
import { getTeamStats } from "../schedule/schedule";
import { RunProductionStats } from "../types/analysis/batter";
import { BallparkHitFactor } from "../types/analysis/events";
import {
  CareerRunProductionProfile,
  ExpectedRBIs,
  ExpectedRuns,
  LineupContext,
  PitcherRunAllowance,
  RunProductionPoints,
  TeamOffensiveContext,
} from "../types/analysis/run-production";
import { BallparkFactors } from "../types/environment/ballpark";
import { MLBGame } from "../types/game";
import { Batter } from "../types/domain/player";

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

// Constants for lineup position weights
const BASE_RUN_OPPORTUNITIES: Record<number, number> = {
  1: 1.2, // Leadoff gets more opportunities
  2: 1.1,
  3: 1.1,
  4: 1.0,
  5: 0.9,
  6: 0.9,
  7: 0.8,
  8: 0.8,
  9: 0.7,
};

const BASE_RBI_OPPORTUNITIES: Record<number, number> = {
  1: 0.8, // Leadoff gets fewer RBI opportunities
  2: 0.9,
  3: 1.2,
  4: 1.3, // Cleanup gets most RBI opportunities
  5: 1.1,
  6: 1.0,
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
): Promise<RunProductionStats | null> {
  try {
    // Fetch full player stats
    const playerData = await getBatterStats({
      batterId: playerId,
      season,
    });

    // Skip pitchers unless they have significant batting stats
    if (
      playerData.position === "P" &&
      playerData.currentSeason.atBats < 20
    ) {
      return null;
    }

    // Extract season batting stats from domain model
    const batting = playerData.currentSeason;

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
export async function getCareerRunProductionProfile(
  playerId: number
): Promise<CareerRunProductionProfile | null> {
  try {
    // Get player stats with historical data
    const playerData = await getBatterStats({
      batterId: playerId,
    });

    if (
      !playerData ||
      !playerData.careerByYear ||
      Object.keys(playerData.careerByYear).length === 0
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

    // Process each season from careerByYear in the domain model
    Object.entries(playerData.careerByYear).forEach(([seasonYear, seasonStats]) => {
      const seasonRuns = seasonStats.runs || 0;
      const seasonRBI = seasonStats.rbi || 0;
      const seasonGames = seasonStats.gamesPlayed || 0;

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
        const year = parseInt(seasonYear);
        if (year >= currentYear - 3) {
          recentSeasons.push({
            season: seasonYear,
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
): Promise<TeamOffensiveContext | null> {
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
export async function getBallparkRunFactor(
  factors: BallparkFactors
): Promise<BallparkHitFactor> {
  return {
    singles: factors.types.singles,
    doubles: factors.types.doubles,
    triples: factors.types.triples,
    homeRuns: factors.types.homeRuns,
    runFactor: factors.types.runs,
    overall: factors.overall,
    rbiFactor: factors.types.runs, // Using run factor for RBIs
  };
}

/**
 * Get lineup position and batting order context for a player
 */
export function getLineupContext(
  position: number,
  gameData: MLBGame,
  isHome: boolean
): LineupContext {
  try {
    // Get the lineup data
    const lineup = gameData.lineups;
    if (!lineup) {
      console.warn("No lineup data available, using default values");
      return getDefaultLineupContext(position);
    }

    // Get team stats from game data
    const team = isHome ? gameData.teams?.home : gameData.teams?.away;
    if (!team || !team.team.id) {
      console.warn(
        `No team data available for ${
          isHome ? "home" : "away"
        } team, using default values`
      );
      return getDefaultLineupContext(position);
    }

    // Calculate expected opportunities based on lineup position
    const baseRunOpportunities = BASE_RUN_OPPORTUNITIES[position] || 1.0;
    const baseRbiOpportunities = BASE_RBI_OPPORTUNITIES[position] || 1.0;

    // Get team stats
    const teamStats = isHome
      ? gameData.teamStats?.home
      : gameData.teamStats?.away;
    const onBasePercentage = (teamStats?.hitting?.obp as number) || 0.33; // League average OBP if no stats

    // Calculate expected opportunities
    const runsPerGame = (teamStats?.hitting?.runs as number) || 0;
    const gamesPlayed = (teamStats?.hitting?.gamesPlayed as number) || 162;
    const lineupRuns =
      runsPerGame > 0 && gamesPlayed > 0 ? runsPerGame / gamesPlayed : 4.5; // League average if no stats
    const rbis = (teamStats?.hitting?.rbi as number) || 0;
    const lineupRBIs = rbis > 0 && gamesPlayed > 0 ? rbis / gamesPlayed : 4.3; // League average if no stats
    const expectedRunOpportunities = baseRunOpportunities * lineupRuns;
    const expectedRbiOpportunities = baseRbiOpportunities * lineupRBIs;

    return {
      position,
      isTopOfOrder: position <= 3,
      isBottomOfOrder: position >= 7,
      runnersOnBaseFrequency: onBasePercentage,
      rbiOpportunities: expectedRbiOpportunities,
      runScoringOpportunities: expectedRunOpportunities,
    };
  } catch (error) {
    console.warn("Error getting lineup context:", error);
    return getDefaultLineupContext(position);
  }
}

/**
 * Get default lineup context values when data is unavailable
 */
function getDefaultLineupContext(position: number): LineupContext {
  return {
    position,
    isTopOfOrder: position <= 3,
    isBottomOfOrder: position >= 7,
    runnersOnBaseFrequency: 0.33, // League average
    rbiOpportunities: 4.0,
    runScoringOpportunities: 4.0,
  };
}

/**
 * Get pitcher's propensity to allow runs
 */
export async function getPitcherRunAllowance(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<PitcherRunAllowance | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    if (!pitcherData) {
      return null;
    }

    // Use currentSeason from the domain model
    // PitcherStats are already properly typed with numerical values
    const stats = pitcherData.currentSeason || {
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

    // Use values directly - they're already numbers in the domain model
    const ip = stats.inningsPitched;
    const era = stats.era || 4.5; // MLB average if not available 
    const whip = stats.whip || 1.3; // MLB average if not available

    // Estimate earned runs and total runs
    const earnedRuns = Math.round((era * ip) / 9);
    const runsAllowed = Math.round(earnedRuns * 1.1); // ~10% of runs are unearned

    // Calculate runs per 9 innings
    const runsPer9 = ip > 0 ? (runsAllowed / ip) * 9 : null;

    // Calculate opportunity rate from WHIP
    // WHIP correlates with runners getting on base (opportunities for runs)
    const runScoringOpportunityRate = whip * 0.25; // Estimated rate of runners in scoring position

    // Calculate run allowance rating on 0-10 scale where 5 is average
    // 4.5 ERA is approximately average
    const runAllowanceRating = 5 * (era / 4.5);

    return {
      runsAllowedPerGame: runsPer9,
      earnedRunAverage: era,
      runPreventionRating: runAllowanceRating,
      qualityStartPercentage: 1.0, // Assuming 100% quality starts
      runScoringVulnerability: {
        early: 0.0, // Assuming no vulnerability in early innings
        middle: 0.0, // Assuming no vulnerability in middle innings
        late: 0.0, // Assuming no vulnerability in late innings
      },
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
  gameData: MLBGame,
  isHome: boolean
): Promise<ExpectedRuns> {
  try {
    const [
      runStats,
      careerProfile,
      lineupContext,
      pitcherData,
      playerData,
      ballparkData,
    ] = await Promise.all([
      getPlayerRunProductionStats(batterId).catch(() => null),
      getCareerRunProductionProfile(batterId).catch(() => null),
      Promise.resolve(
        getLineupContext(
          findLineupPosition(batterId, gameData, isHome),
          gameData,
          isHome
        )
      ),
      getPitcherRunAllowance(getOpposingPitcherId(gameData, isHome)).catch(
        () => null
      ),
      getBatterStats({ batterId }).catch(() => null),
      getBallparkFactors({
        venueId: gameData.venue.id,
        season: new Date().getFullYear().toString(),
      })
        .then((factors) => getBallparkRunFactor(factors))
        .catch(() => null),
    ]);

    // Baseline runs per game from player's season stats or MLB average
    let baselineRunsPerGame = runStats?.runsPerGame || 0.5; // Default to MLB average

    // If we have career data, blend with current season for more stability
    if (careerProfile && careerProfile.careerRunsPerGame) {
      // Weight current season more heavily, but include career data
      baselineRunsPerGame =
        (baselineRunsPerGame * 2 + careerProfile.careerRunsPerGame) / 3;
    }

    // Apply lineup position factor
    let lineupFactor = 1.0;
    if (lineupContext && lineupContext.position) {
      // Get the factor from our lookup table
      const position = lineupContext.position;
      lineupFactor =
        LINEUP_RUN_WEIGHTS[position as keyof typeof LINEUP_RUN_WEIGHTS] || 1.0;
    }

    // Apply team offense factor
    let teamFactor = 1.0;
    if (playerData) {
      // Better offensive teams create more run opportunities for all batters
      // Get teamId from the domain model
      const teamId = playerData.teamId || 0;
      const teamContext = await getTeamOffensiveContext(teamId);
      teamFactor = (teamContext?.teamOffensiveRating || 50) / 50; // 50 is average
    }

    // Apply pitcher factor
    let pitcherFactor = 1.0;
    if (pitcherData) {
      // Inverse of pitcher quality: worse pitchers allow more runs
      pitcherFactor = pitcherData.runPreventionRating / 5; // 5 is average
    }

    // Apply ballpark factor
    let ballparkFactor = 1.0;
    if (ballparkData) {
      ballparkFactor = ballparkData.overall;
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
    if (lineupContext?.position) confidence += 10;
    if (careerProfile?.seasonToSeasonVariance) {
      // More consistent players get higher confidence
      confidence += (1 - careerProfile.seasonToSeasonVariance) * 10;
    }

    // Return the projection
    return {
      expected: expectedRuns,
      ceiling: expectedRuns * 1.3,
      floor: expectedRuns * 0.7,
      runFactors: {
        playerSkill: lineupFactor,
        lineupContext: lineupFactor,
        opposingPitcher: pitcherFactor,
        ballparkFactor: ballparkFactor,
      },
      confidence: Math.min(100, Math.max(0, confidence)),
    };
  } catch (error) {
    console.error(
      `Error calculating expected runs for player ${batterId}:`,
      error
    );

    // Return conservative default values
    return {
      expected: 0.5, // MLB average
      ceiling: 0.5 * 1.3,
      floor: 0.5 * 0.7,
      runFactors: {
        playerSkill: 1.0,
        lineupContext: 1.0,
        opposingPitcher: 1.0,
        ballparkFactor: 1.0,
      },
      confidence: 50,
    };
  }
}

// Helper function to find lineup position
function findLineupPosition(
  batterId: number,
  gameData: MLBGame,
  isHome: boolean
): number {
  const lineup = gameData.lineups;
  if (!lineup) {
    return 5; // Default to middle of lineup if no data
  }

  const batters = isHome ? lineup.homeBatters : lineup.awayBatters;
  if (!batters) {
    return 5;
  }

  const position = batters.findIndex((batter) => batter.id === batterId);
  return position >= 0 ? position + 1 : 5;
}

// Helper function to get opposing pitcher ID
function getOpposingPitcherId(gameData: MLBGame, isHome: boolean): number {
  const pitcher = isHome
    ? gameData.teams.away.probablePitcher
    : gameData.teams.home.probablePitcher;

  return pitcher?.id || 0;
}

/**
 * Helper function to get game data from a game ID
 */
async function getGameData(gamePk: string): Promise<MLBGame> {
  try {
    const gameFeed = await getGameFeed({ gamePk });

    // Transform the API response to our MLBGame structure
    return {
      gamePk: parseInt(gamePk),
      gameDate: new Date().toISOString(), // Default date
      status: {
        abstractGameState: gameFeed?.gameData?.status?.abstractGameState,
        detailedState: gameFeed?.gameData?.status?.detailedState,
        statusCode: gameFeed?.gameData?.status?.codedGameState,
      },
      teams: {
        away: {
          team: {
            id: gameFeed?.gameData?.teams?.away?.team?.id || 0,
            name: gameFeed?.gameData?.teams?.away?.team?.name || "",
          },
          probablePitcher: {
            id: 0,
            fullName: "",
          },
        },
        home: {
          team: {
            id: gameFeed?.gameData?.teams?.home?.team?.id || 0,
            name: gameFeed?.gameData?.teams?.home?.team?.name || "",
          },
          probablePitcher: {
            id: 0,
            fullName: "",
          },
        },
      },
      venue: {
        id: gameFeed?.gameData?.venue?.id || 0,
        name: gameFeed?.gameData?.venue?.name || "",
      },
    };
  } catch (error) {
    console.error(`Error fetching game data for gamePk ${gamePk}:`, error);
    // Return a minimal valid game object
    return {
      gamePk: parseInt(gamePk),
      gameDate: new Date().toISOString(),
      status: {},
      teams: {
        away: { team: { id: 0, name: "" } },
        home: { team: { id: 0, name: "" } },
      },
      venue: { id: 0, name: "" },
    };
  }
}

/**
 * Calculate expected RBIs for a player in a specific game
 */
export async function calculateExpectedRBIs(
  batterId: number,
  gameData: MLBGame,
  isHome: boolean
): Promise<ExpectedRBIs> {
  try {
    const [
      runStats,
      careerProfile,
      lineupContext,
      pitcherData,
      playerData,
      ballparkData,
    ] = await Promise.all([
      getPlayerRunProductionStats(batterId).catch(() => null),
      getCareerRunProductionProfile(batterId).catch(() => null),
      Promise.resolve(
        getLineupContext(
          findLineupPosition(batterId, gameData, isHome),
          gameData,
          isHome
        )
      ),
      getPitcherRunAllowance(getOpposingPitcherId(gameData, isHome)).catch(
        () => null
      ),
      getBatterStats({ batterId }).catch(() => null),
      getBallparkFactors({
        venueId: gameData.venue.id,
        season: new Date().getFullYear().toString(),
      })
        .then((factors) => getBallparkRunFactor(factors))
        .catch(() => null),
    ]);

    // Baseline RBIs per game from player's season stats or MLB average
    let baselineRBIsPerGame = runStats?.rbiPerGame || 0.5; // Default to MLB average

    // If we have career data, blend with current season for more stability
    if (careerProfile && careerProfile.careerRBIPerGame) {
      // Weight current season more heavily, but include career data
      baselineRBIsPerGame =
        (baselineRBIsPerGame * 2 + careerProfile.careerRBIPerGame) / 3;
    }

    // Apply lineup position factor
    let lineupFactor = 1.0;
    if (lineupContext && lineupContext.position) {
      // Get the factor from our lookup table
      const position = lineupContext.position;
      lineupFactor =
        LINEUP_RBI_WEIGHTS[position as keyof typeof LINEUP_RBI_WEIGHTS] || 1.0;
    }

    // Apply team offense factor
    let teamFactor = 1.0;
    if (playerData) {
      // Better offensive teams get more runners on base for RBI opportunities
      // Get teamId from the domain model
      const teamId = playerData.teamId || 0;
      const teamContext = await getTeamOffensiveContext(teamId);
      teamFactor = (teamContext?.teamOffensiveRating || 50) / 50;
    }

    // Apply pitcher factor
    let pitcherFactor = 1.0;
    if (pitcherData) {
      // Inverse of pitcher quality: worse pitchers allow more runs
      pitcherFactor = pitcherData.runPreventionRating / 5; // 5 is average
    }

    // Apply ballpark factor
    let ballparkFactor = 1.0;
    if (ballparkData) {
      ballparkFactor = ballparkData.overall;
    }

    // Apply batting skill factor (for RBIs, power and average with RISP are key)
    let battingSkillFactor = 1.0;
    if (runStats) {
      // Calculate from player's stats
      // Higher slugging % players deliver more RBIs
      battingSkillFactor = (runStats.sluggingPct / 0.4) * 0.7 + 0.3;
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
    if (lineupContext?.position) confidence += 10;
    if (careerProfile?.seasonToSeasonVariance) {
      // More consistent players get higher confidence
      confidence += (1 - careerProfile.seasonToSeasonVariance) * 10;
    }

    // Return the projection
    return {
      expected: expectedRBIs,
      ceiling: expectedRBIs * 1.3,
      floor: expectedRBIs * 0.7,
      rbiFactors: {
        playerSkill: lineupFactor,
        lineupContext: lineupFactor,
        opposingPitcher: pitcherFactor,
        ballparkFactor: ballparkFactor,
      },
      confidence: Math.min(100, Math.max(0, confidence)),
    };
  } catch (error) {
    console.error(
      `Error calculating expected RBIs for player ${batterId}:`,
      error
    );

    // Return conservative default values
    return {
      expected: 0.5, // MLB average
      ceiling: 0.5 * 1.3,
      floor: 0.5 * 0.7,
      rbiFactors: {
        playerSkill: 1.0,
        lineupContext: 1.0,
        opposingPitcher: 1.0,
        ballparkFactor: 1.0,
      },
      confidence: 50,
    };
  }
}

/**
 * Calculate expected DFS points from runs and RBIs for a player in a specific game
 */
export async function calculateRunProductionPoints(
  batterId: number,
  gamePk: string,
  pitcherId: number,
  isHome: boolean
): Promise<RunProductionPoints> {
  try {
    // Get both runs and RBIs projections
    // Fetch game data based on gamePk
    const gameData = await getGameData(gamePk);

    // Get both runs and RBIs projections
    const [runsProjection, rbisProjection] = await Promise.all([
      calculateExpectedRuns(batterId, gameData, isHome),
      calculateExpectedRBIs(batterId, gameData, isHome),
    ]);

    // Calculate points (2 points per run and RBI)
    const runPoints = runsProjection.expected * RUN_POINTS;
    const rbiPoints = rbisProjection.expected * RBI_POINTS;

    // Calculate total expected points
    const totalPoints = runPoints + rbiPoints;

    // Use weighted average of confidences based on point contribution
    const totalConfidence =
      (runsProjection.confidence * runPoints +
        rbisProjection.confidence * rbiPoints) /
      Math.max(0.001, totalPoints);

    return {
      runs: {
        expected: runsProjection.expected,
        points: runPoints,
        confidence: runsProjection.confidence,
      },
      rbis: {
        expected: rbisProjection.expected,
        points: rbiPoints,
        confidence: rbisProjection.confidence,
      },
      total: {
        expected: runsProjection.expected + rbisProjection.expected,
        points: totalPoints,
        confidence: Math.min(100, Math.max(0, totalConfidence)),
      },
    };
  } catch (error) {
    console.error(
      `Error calculating run production points for player ${batterId}:`,
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