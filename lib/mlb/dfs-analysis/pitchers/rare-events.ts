/**
 * Specialized functions for analyzing rare high-value events in MLB DFS scoring
 * Including complete games, shutouts, no-hitters, and perfect games
 */

import { getGameFeed } from "../../game/game-feed";
import { getGameEnvironmentData } from "../../weather/weather";
import { getTeamStats } from "../../schedule/schedule";
import { RareEventAnalysis } from "../../types/analysis/events";
import { EnhancedPitcherData } from "../../services/pitcher-data-service";
import { getEnhancedPitcherData } from "../../services/pitcher-data-service";
import { Pitcher } from "../../types/domain/player";

/**
 * Calculate rare event potential and expected DFS points
 * This is a comprehensive function that combines various rare events
 */
export async function calculateRareEventPotential(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear()
): Promise<RareEventAnalysis> {
  try {
    // Get pitcher stats for both current and previous season using enhanced data service
    const [currentSeasonStats, previousSeasonStats] = await Promise.all([
      getEnhancedPitcherData(pitcherId, season),
      getEnhancedPitcherData(pitcherId, season - 1).catch(() => null),
    ]);

    // Use current season stats if available, otherwise fall back to previous season
    const pitcherStats = currentSeasonStats || previousSeasonStats;

    if (!pitcherStats) {
      // If no data is available for either season, return conservative default values
      return {
        eventProbabilities: {
          completeGame: 1.0,
          qualityStart: 50.0,
          shutout: 0.5,
          noHitter: 0.1,
          perfectGame: 0.01,
        },
        expectedRareEventPoints: 0.05,
        riskRewardRating: 5.0,
        confidenceScore: 30,
        confidence: 30,
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

    // Get opponent team stats
    const opponentStats = opponentId
      ? await getTeamStats(opponentId, season)
      : null;

    // Extract stats directly from the pitcherStats using the domain model
    const stats = pitcherStats.seasonStats;

    const inningsPitched = stats.inningsPitched || 0;
    const era = stats.era || 4.5; // League average ERA
    const whip = stats.whip || 1.3; // League average WHIP

    // Calculate complete game probability
    let completeGameProb = 1.0; // Base 1% chance
    if (inningsPitched > 0) {
      // Adjust based on pitcher efficiency
      if (whip < 1.1) completeGameProb *= 1.5;
      if (era < 3.0) completeGameProb *= 1.5;

      // Adjust based on innings pitched
      const avgInningsPerStart = inningsPitched / (stats.gamesPlayed || 1);
      if (avgInningsPerStart > 6.0) completeGameProb *= 1.5;
    }

    // Calculate quality start probability
    let qualityStartProb = 50.0; // Base 50% chance
    if (inningsPitched > 0) {
      // Adjust based on pitcher performance
      if (era < 3.5) qualityStartProb *= 1.2;
      if (whip < 1.2) qualityStartProb *= 1.2;

      // Adjust based on opponent strength
      if (opponentStats) {
        // Get hitting stats for runs scored
        const runsScored = opponentStats.hitting?.runs || 0;
        const gamesPlayed = opponentStats.hitting?.gamesPlayed || 1;

        const runsPerGame = runsScored / gamesPlayed;
        if (runsPerGame > 5.0) qualityStartProb *= 0.8;
        if (runsPerGame < 4.0) qualityStartProb *= 1.2;
      }
    }

    // Calculate shutout probability
    let shutoutProb = completeGameProb * 0.5; // Half of complete game probability
    if (inningsPitched > 0) {
      // Adjust based on pitcher dominance
      if (era < 2.5) shutoutProb *= 1.5;
      if (whip < 1.0) shutoutProb *= 1.5;
    }

    // Calculate no-hitter probability
    let noHitterProb = shutoutProb * 0.2; // 20% of shutout probability
    if (inningsPitched > 0) {
      // Adjust based on pitcher dominance
      if (whip < 1.0) noHitterProb *= 2.0;
      if (whip < 1.2) noHitterProb *= 1.5;
    }

    // Calculate perfect game probability
    let perfectGameProb = noHitterProb * 0.1; // 10% of no-hitter probability
    if (inningsPitched > 0) {
      // Adjust based on control
      const bb9 = (stats.walks || 0) / (inningsPitched / 9);
      if (bb9 < 2.0) perfectGameProb *= 2.0;
    }

    // Calculate expected DFS points from rare events
    const expectedRareEventPoints =
      (completeGameProb / 100) * 2.5 + // Complete game bonus
      (shutoutProb / 100) * 2.5 + // Shutout bonus
      (noHitterProb / 100) * 5.0 + // No-hitter bonus
      (perfectGameProb / 100) * 10.0; // Perfect game bonus

    // Calculate risk-reward rating
    let riskRewardRating = 5.0;
    if (inningsPitched > 0) {
      // Higher rating for more dominant pitchers
      if (era < 3.0) riskRewardRating += 1.0;
      if (whip < 1.1) riskRewardRating += 1.0;
      if (stats.strikeouts / inningsPitched > 1.0) riskRewardRating += 1.0;
    }
    riskRewardRating = Math.max(1.0, Math.min(10.0, riskRewardRating));

    // Calculate confidence score
    let confidenceScore = 50;
    if (inningsPitched > 30) {
      confidenceScore += 20;
    } else if (inningsPitched > 15) {
      confidenceScore += 10;
    }
    if (opponentStats && opponentStats.hitting?.gamesPlayed > 10) {
      confidenceScore += 10;
    }
    if (gameEnvironment) {
      confidenceScore += 10;
    }
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    return {
      eventProbabilities: {
        completeGame: Math.min(100, completeGameProb),
        qualityStart: Math.min(100, qualityStartProb),
        shutout: Math.min(100, shutoutProb),
        noHitter: Math.min(100, noHitterProb),
        perfectGame: Math.min(100, perfectGameProb),
      },
      expectedRareEventPoints,
      riskRewardRating,
      confidenceScore,
      confidence: confidenceScore,
    };
  } catch (error) {
    console.error(
      `Error calculating rare event potential for pitcher ${pitcherId}:`,
      error
    );
    // Return conservative default values on error
    return {
      eventProbabilities: {
        completeGame: 1.0,
        qualityStart: 50.0,
        shutout: 0.5,
        noHitter: 0.1,
        perfectGame: 0.01,
      },
      expectedRareEventPoints: 0.05,
      riskRewardRating: 5.0,
      confidenceScore: 30,
      confidence: 30,
    };
  }
}

/**
 * Analyze historical rare events by pitcher to identify tendencies
 */
export async function analyzeHistoricalRareEvents(
  pitcherId: number,
  season: number = new Date().getFullYear()
): Promise<{
  pitcher: {
    id: number;
    name: string;
    team: string;
  };
  careerStats: {
    completeGames: number;
    shutouts: number;
    noHitters: number;
    perfectGames: number;
    qualityStarts: number;
    totalGames: number;
    completionRate: number;
  };
  seasonStats: {
    completeGames: number;
    shutouts: number;
    noHitters: number;
    perfectGames: number;
    qualityStarts: number;
    totalGames: number;
    completionRate: number;
  };
}> {
  try {
    // Get pitcher data from enhanced data service
    const pitcherData = await getEnhancedPitcherData(pitcherId, season);

    if (!pitcherData) {
      throw new Error(`Could not get pitcher data for ID ${pitcherId}`);
    }

    // For this function, we would ideally query a database with historical rare events
    // In absence of that, we'll simulate based on available data

    // Extract career stats - use careerStats array from enhanced data
    const careerGames = pitcherData.careerStats.reduce(
      (sum, seasonData) => sum + seasonData.gamesPlayed,
      0
    );

    // Estimate rare events based on career stats and ERA
    // These are approximations and would be replaced with actual data in production
    const careerEra = 
      careerGames > 0 
        ? pitcherData.careerStats.reduce(
            (sum, seasonData) => sum + (seasonData.era * seasonData.gamesPlayed),
            0
          ) / careerGames
        : pitcherData.seasonStats.era || 4.5;

    // Better pitchers have more rare events
    const rareEventFactor = Math.max(
      0.3,
      Math.min(3, 4.5 / Math.max(1, careerEra))
    );

    // Calculate estimated career stats
    // MLB averages: ~1% of starts are CG, ~0.3% are shutouts, ~0.02% are no-hitters
    const careerCGs = Math.round(careerGames * 0.01 * rareEventFactor);
    const careerShutouts = Math.round(careerGames * 0.003 * rareEventFactor);
    const careerNoHitters =
      careerGames > 100
        ? Math.round(careerGames * 0.0002 * rareEventFactor)
        : 0;
    const careerPerfectGames = 0; // Extremely rare, default to 0

    // Quality starts occur in ~40-60% of starts depending on pitcher quality
    const qualityStartRate = 0.4 + rareEventFactor * 0.1;
    const careerQualityStarts = Math.round(careerGames * qualityStartRate);

    // Calculate season stats using the current season data from the enhanced data service
    const seasonGamesValue = pitcherData.seasonStats.gamesPlayed || 0;

    // Season stats are more variable due to smaller sample
    const seasonCGs = Math.min(
      Math.round(seasonGamesValue * 0.01 * rareEventFactor * 1.5),
      2
    );
    const seasonShutouts = Math.min(seasonCGs, 1);
    const seasonNoHitters =
      seasonGamesValue > 20 && rareEventFactor > 2 ? 1 : 0;
    const seasonPerfectGames = 0;
    const seasonQualityStarts = Math.round(seasonGamesValue * qualityStartRate);

    return {
      pitcher: {
        id: pitcherId,
        name: pitcherData.fullName,
        team: pitcherData.currentTeam,
      },
      careerStats: {
        completeGames: careerCGs,
        shutouts: careerShutouts,
        noHitters: careerNoHitters,
        perfectGames: careerPerfectGames,
        qualityStarts: careerQualityStarts,
        totalGames: careerGames,
        completionRate: careerCGs / Math.max(1, careerGames),
      },
      seasonStats: {
        completeGames: seasonCGs,
        shutouts: seasonShutouts,
        noHitters: seasonNoHitters,
        perfectGames: seasonPerfectGames,
        qualityStarts: seasonQualityStarts,
        totalGames: seasonGamesValue,
        completionRate: seasonCGs / Math.max(1, seasonGamesValue),
      },
    };
  } catch (error) {
    console.error(
      `Error analyzing historical rare events for pitcher ${pitcherId}:`,
      error
    );

    // Return default values
    return {
      pitcher: {
        id: pitcherId,
        name: `Pitcher ${pitcherId}`,
        team: "",
      },
      careerStats: {
        completeGames: 0,
        shutouts: 0,
        noHitters: 0,
        perfectGames: 0,
        qualityStarts: 0,
        totalGames: 0,
        completionRate: 0,
      },
      seasonStats: {
        completeGames: 0,
        shutouts: 0,
        noHitters: 0,
        perfectGames: 0,
        qualityStarts: 0,
        totalGames: 0,
        completionRate: 0,
      },
    };
  }
}
