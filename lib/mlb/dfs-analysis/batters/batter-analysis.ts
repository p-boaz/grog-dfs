/**
 * Batter analysis module for DFS projections
 * Handles comprehensive projections for batters including:
 * - Hit probability by type
 * - Home run projections
 * - Stolen base projections
 * - Run production analysis
 * - Plate discipline metrics
 */

import { estimateHomeRunProbability } from "./home-runs";
import { estimateStolenBaseProbability } from "./stolen-bases";
import { calculateRunProduction } from "./run-production";
import { calculatePlateDisciplineProjection } from "../shared/plate-discipline";
import { calculateHitProjections } from "./hits";
import { getGameEnvironmentData, getBallparkFactors } from "../../weather/weather";
import { getBatterStats } from "../../player/batter-stats";
import { getPitcherStats } from "../../player/pitcher-stats";
import { calculatePitcherDfsProjection } from "../shared/aggregate-scoring";
import {
  BatterAnalysis,
  BatterInfo,
  BatterQualityMetrics,
  DetailedHitProjections,
  GameInfo,
  Projections,
  RunProductionAnalysis,
  SeasonStats,
} from "../../types/analysis";
import { BallparkFactors } from "../../types/environment/ballpark";
import { Environment } from "../../types/environment/weather";
import { calculateQualityMetrics } from "../shared/quality-metrics";
import { mapBatterToPlayer } from "../../draftkings/player-mapping";
import { Batter, BatterStats, isBatterStats } from "../../types/domain/player";
import { getEnhancedBatterData } from "../../services/batter-data-service";

/**
 * Analyze batters for the specified game
 * @param gameId Game ID
 * @param batters Array of batters to analyze
 * @returns Array of BatterAnalysis objects
 */
export async function analyzeBatters(
  gameId: string,
  batters: BatterInfo[]
): Promise<BatterAnalysis[]> {
  try {
    // Get game environment data
    const game = await getGameEnvironmentData({ gamePk: gameId });
    if (!game) {
      console.error(`No game data found for game ${gameId}`);
      return batters.map((batter) => getDefaultBatterAnalysis(batter, null));
    }

    // Convert environment data to GameInfo interface
    const gameInfo: GameInfo = {
      gameId: parseInt(gameId),
      venue: {
        id: game.venueId || 0,
        name: game.venueName || "Unknown"
      },
      homeTeam: { name: "Home Team" },
      awayTeam: { name: "Away Team" },
      environment: {
        temperature: game.temperature,
        windSpeed: game.windSpeed,
        windDirection: game.windDirection,
        isOutdoor: game.isOutdoor
      }
    };

    // Process batters
    const results: BatterAnalysis[] = [];
    for (const batter of batters) {
      try {
        const analysis = await analyzeBatter(batter, gameInfo);
        results.push(analysis);
      } catch (error) {
        console.error(`Error analyzing batter ${batter.id}:`, error);
        results.push(getDefaultBatterAnalysis(batter, gameInfo));
      }
    }

    // Sort by projected points (descending)
    return results.sort(
      (a, b) =>
        b.projections.dfsProjection.expectedPoints -
        a.projections.dfsProjection.expectedPoints
    );
  } catch (error) {
    console.error(`Error analyzing batters for game ${gameId}:`, error);
    return batters.map((batter) => getDefaultBatterAnalysis(batter, null));
  }
}

/**
 * Analyze a single batter
 * @param batter Batter info
 * @param game Game info
 * @returns BatterAnalysis object
 */
export async function analyzeBatter(
  batter: BatterInfo,
  game: GameInfo
): Promise<BatterAnalysis> {
  try {
    // Determine if batter is home or away
    const isHome = batter.isHome;
    const team = isHome ? game.homeTeam : game.awayTeam;
    const opponent = isHome ? game.awayTeam : game.homeTeam;

    // Get enhanced batter's stats with domain model types
    const enhancedBatterData: Batter = await getEnhancedBatterData(batter.id);

    // Create empty season stats
    const emptySeasonStats: SeasonStats = {
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      runs: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      rbi: 0,
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
      stolenBases: 0,
      caughtStealing: 0,
      wOBAvsL: 0,
      wOBAvsR: 0,
      walks: 0,
      strikeouts: 0,
      sacrificeFlies: 0,
      hitByPitches: 0,
      plateAppearances: 0,
    };

    // Create analysis entry
    const entry: BatterAnalysis = {
      batterId: batter.id,
      name: batter.name || `Batter ${batter.id}`,
      team: team?.name || "",
      opponent: opponent?.name || "",
      opposingPitcher: {
        id: game.pitchers.away.id,
        name: game.pitchers.away.name,
        throwsHand: game.pitchers.away.throwsHand,
      },
      position: batter.position,
      gameId: parseInt(game.gameId.toString()),
      venue: game.venue?.name || "",
      stats: {
        seasonStats: {
          "2024": emptySeasonStats,
          "2025": emptySeasonStats,
        },
        quality: getDefaultQualityMetrics(),
      },
      matchup: {
        advantageScore: 0.5,
        platoonAdvantage: false,
        historicalStats: {
          atBats: 0,
          hits: 0,
          avg: 0,
          homeRuns: 0,
          ops: 0,
        },
      },
      projections: {
        homeRunProbability: 0,
        stolenBaseProbability: 0,
        expectedHits: {
          total: 0,
          singles: 0,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          confidence: 0,
        },
        dfsProjection: {
          expectedPoints: 0,
          upside: 0,
          floor: 0,
          breakdown: {
            hits: 0,
            singles: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            runs: 0,
            rbi: 0,
            stolenBases: 0,
            walks: 0,
          },
        },
      },
      lineupPosition: batter.lineupPosition,
      factors: {
        weather: {
          temperature: game.environment?.temperature || 70,
          windSpeed: game.environment?.windSpeed || 0,
          windDirection: game.environment?.windDirection || "None",
          isOutdoor: game.environment?.isOutdoor || false,
          temperatureFactor: 1.0,
          windFactor: 1.0,
          overallFactor: 1.0,
          byHitType: {
            singles: 1.0,
            doubles: 1.0,
            triples: 1.0,
            homeRuns: 1.0,
          },
        },
        ballpark: {
          overall: game.ballpark?.overall || 1.0,
          singles: game.ballpark?.types?.singles || 1.0,
          doubles: game.ballpark?.types?.doubles || 1.0,
          triples: game.ballpark?.types?.triples || 1.0,
          homeRuns: game.ballpark?.types?.homeRuns || 1.0,
          runs: game.ballpark?.types?.runs || 1.0,
        },
        platoon: false,
        career: null,
      },
      draftKings: {
        draftKingsId: null,
        salary: null,
        positions: [batter.position],
        avgPointsPerGame: 0,
      },
    };

    // Update stats if available
    if (enhancedBatterData) {
      // Get current season stats from domain model
      const currentStats = enhancedBatterData.currentSeason;

      // Make sure the stats is valid using the type guard
      if (!isBatterStats(currentStats)) {
        console.warn(`Invalid batter stats for player ${batter.id}`);
        return entry; // Return the default entry
      }

      // Set platoon advantage
      const platoonAdvantage =
        (batter.isHome
          ? game.pitchers.away.throwsHand === "L" && enhancedBatterData.handedness === "R"
          : game.pitchers.home.throwsHand === "L" && enhancedBatterData.handedness === "R") ||
        (batter.isHome
          ? game.pitchers.away.throwsHand === "R" && enhancedBatterData.handedness === "L"
          : game.pitchers.home.throwsHand === "R" && enhancedBatterData.handedness === "L");

      // Get matchup data against this pitcher
      const matchup = await getMatchupData(
        enhancedBatterData.id,
        batter.isHome ? game.pitchers.away.id : game.pitchers.home.id
      );

      // Calculate batter quality metrics
      const qualityMetrics = calculateQualityMetrics(currentStats);

      // Get HR probability projection
      // Call with the correct parameter format
      const hrProbability = await estimateHomeRunProbability(
        enhancedBatterData.id,
        batter.isHome ? game.pitchers.away.id : game.pitchers.home.id,
        game.venue.id,
        batter.isHome,
        game.environment
      );

      // Get stolen base probability
      const sbProbability = await estimateStolenBaseProbability(
        enhancedBatterData.id,
        game.pitchers.away.id,
        batter.isHome ? game.lineups.awayCatcher?.id : game.lineups.homeCatcher?.id
      );

      // Get run production projection
      const runProductionProj = await calculateRunProduction(
        enhancedBatterData.id,
        game.pitchers.away.id,
        game.gameId.toString()
      );

      // Calculate pitcher projections
      const pitcherProj = await calculatePitcherDfsProjection(
        game.pitchers.away.id,
        game.gameId.toString()
      );

      // Calculate plate discipline
      const plateDiscipline = await calculatePlateDisciplineProjection(
        enhancedBatterData.id,
        game.pitchers.away.id
      );

      // Calculate final projections
      // Create a properly structured BallparkFactors object
      const ballparkFactors: BallparkFactors = {
        overall: game.ballpark?.overall || 1.0,
        handedness: {
          rHB: 1.0,
          lHB: 1.0
        },
        types: {
          singles: game.ballpark?.types?.singles || 1.0,
          doubles: game.ballpark?.types?.doubles || 1.0,
          triples: game.ballpark?.types?.triples || 1.0,
          homeRuns: game.ballpark?.types?.homeRuns || 1.0,
          runs: game.ballpark?.types?.runs || 1.0
        }
      };
      
      const projections = await calculateProjections(
        currentStats,
        game.environment,
        ballparkFactors,
        batter,
        game
      );

      // Calculate expected points
      const expectedPoints = estimateBatterPoints(
        currentStats,
        hrProbability.probability,
        sbProbability.probability,
        pitcherProj,
        batter.lineupPosition,
        plateDiscipline,
        runProductionProj
      );

      // Get DraftKings info
      const dkInfo = await mapBatterToPlayer(enhancedBatterData.id, enhancedBatterData.fullName);

      // Update entry with all calculated data
      entry.factors.platoon = platoonAdvantage;
      
      // Safely update weather factors from HR probability
      if (entry.factors.weather && hrProbability.factors) {
        entry.factors.weather.temperatureFactor = 
          hrProbability.factors.temperature || 1.0;
        entry.factors.weather.windFactor = 
          hrProbability.factors.wind || 1.0;
        entry.factors.weather.overallFactor = 
          hrProbability.factors.weatherOverall || 1.0;
      }

      entry.matchup = {
        advantageScore: matchup ? matchup.advantageScore : 0.5,
        platoonAdvantage: platoonAdvantage,
        historicalStats: matchup
          ? {
              atBats: matchup.atBats || 0,
              hits: matchup.hits || 0,
              avg: matchup.avg || 0,
              homeRuns: matchup.homeRuns || 0,
              ops: matchup.ops || 0,
            }
          : {
              atBats: 0,
              hits: 0,
              avg: 0,
              homeRuns: 0,
              ops: 0,
            },
      };

      entry.projections = {
        homeRunProbability: hrProbability.probability,
        stolenBaseProbability: sbProbability.probability,
        expectedHits: projections.hitProjections,
        dfsProjection: {
          expectedPoints: expectedPoints,
          upside: expectedPoints * 1.5, // 50% above expected
          floor: expectedPoints * 0.6, // 40% below expected
          breakdown: {
            hits: projections.hitProjections.total * 3, // Simplification
            singles:
              (projections.hitProjections.total -
                projections.hitProjections.doubles -
                projections.hitProjections.triples -
                projections.hitProjections.homeRuns) *
              3,
            doubles: projections.hitProjections.doubles * 5,
            triples: projections.hitProjections.triples * 8,
            homeRuns: projections.hitProjections.homeRuns * 10,
            runs: runProductionProj.runs.expected,
            rbi: runProductionProj.rbis.expected,
            stolenBases: sbProbability.probability * 5,
            walks: plateDiscipline.walks.expected,
          },
        },
      };

      // Set DraftKings info
      if (dkInfo) {
        entry.draftKings = {
          draftKingsId: dkInfo.dkPlayerId || null,
          salary: dkInfo.salary || null,
          positions: dkInfo.position ? [dkInfo.position] : [batter.position],
          avgPointsPerGame: dkInfo.avgPointsPerGame || 0,
        };
      }

      // Add quality metrics
      entry.stats.quality = qualityMetrics;

      // Convert domain model BatterStats to SeasonStats for 2024 and 2025
      // Most of the SeasonStats properties match directly with BatterStats
      // For 2024 (CurrentSeason)
      entry.stats.seasonStats = {
        "2024": mapSeasonStatsFromBatterStats(enhancedBatterData.currentSeason),
        "2025": mapSeasonStatsFromBatterStats(enhancedBatterData.currentSeason), // Using same data for both years for testing
      };
    }

    return entry;
  } catch (error) {
    console.error(`Error analyzing batter ${batter.id}:`, error);
    return getDefaultBatterAnalysis(batter, game);
  }
}

/**
 * Estimate fantasy points for a batter
 */
export function estimateBatterPoints(
  stats: BatterStats,
  hrProb: number,
  sbProb: number,
  pitcherProj: any,
  lineupPos: number,
  discipline: any,
  runProduction: RunProductionAnalysis
): number {
  try {
    // Home run points (10 pts each)
    const hrPoints = hrProb * 10;

    // Stolen base points (5 pts each)
    const sbPoints = sbProb * 5;

    // Run points (2 pts each)
    const runPoints = runProduction.runs.points;

    // RBI points (2 pts each)
    const rbiPoints = runProduction.rbis.points;

    // Walk points (2 pts each)
    const walkPoints = discipline.walks.expected * 2;

    // Hit points (3 pts for singles)
    const hitPoints = discipline.hits.expected * 3;

    // Calculate total
    const totalPoints =
      hrPoints + sbPoints + runPoints + rbiPoints + walkPoints + hitPoints;

    return totalPoints;
  } catch (error) {
    console.error("Error estimating batter points:", error);
    return 0;
  }
}

/**
 * Format decimal value to two decimal places
 * @param value Value to format
 * @returns Formatted decimal string
 */
function formatDecimal(value: number): string {
  const str = value.toString();
  return str.startsWith(".") ? str : `.${str.split(".")[1] || "000"}`;
}

/**
 * Helper function to parse string averages back to numbers for calculations
 */
function parseAverage(value: string): number {
  return parseFloat(value) || 0;
}

/**
 * Helper function to map domain model BatterStats to SeasonStats
 */
function mapSeasonStatsFromBatterStats(stats: BatterStats): SeasonStats {
  if (!stats) {
    return {
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      homeRuns: 0,
      rbi: 0,
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
      stolenBases: 0,
      caughtStealing: 0,
      runs: 0,
      doubles: 0,
      triples: 0,
      walks: 0,
      strikeouts: 0,
      sacrificeFlies: 0,
      hitByPitches: 0,
      plateAppearances: 0,
      wOBA: 0,
      iso: 0,
      babip: 0,
      kRate: 0,
      bbRate: 0,
      hrRate: 0,
      sbRate: 0,
    };
  }

  // Map the domain model BatterStats to SeasonStats
  // Most field names match directly
  return {
    gamesPlayed: stats.gamesPlayed || 0,
    atBats: stats.atBats || 0,
    hits: stats.hits || 0,
    homeRuns: stats.homeRuns || 0,
    rbi: stats.rbi || 0,
    avg: stats.avg || 0,
    obp: stats.obp || 0,
    slg: stats.slg || 0,
    ops: stats.ops || 0,
    stolenBases: stats.stolenBases || 0,
    caughtStealing: stats.caughtStealing || 0,
    runs: stats.runs || 0,
    doubles: stats.doubles || 0,
    triples: stats.triples || 0,
    walks: stats.walks || 0,
    strikeouts: stats.strikeouts || 0,
    sacrificeFlies: stats.sacrificeFlies || 0,
    hitByPitches: stats.hitByPitches || 0,
    plateAppearances: stats.plateAppearances || 0,
    wOBA: stats.wOBA || 0,
    iso: stats.iso || 0,
    babip: stats.babip || 0,
    kRate: stats.kRate || 0,
    bbRate: stats.bbRate || 0,
    hrRate: stats.hrRate || 0,
    sbRate: stats.sbRate || 0,
  };
}

/**
 * Helper function to map old-style season stats objects
 */
function mapSeasonStats(stats: SeasonStats | undefined): SeasonStats {
  if (!stats) {
    return {
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      homeRuns: 0,
      rbi: 0,
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
      stolenBases: 0,
      caughtStealing: 0,
      runs: 0,
      doubles: 0,
      triples: 0,
      walks: 0,
      strikeouts: 0,
      sacrificeFlies: 0,
      hitByPitches: 0,
      plateAppearances: 0,
      wOBA: 0,
      iso: 0,
      babip: 0,
      kRate: 0,
      bbRate: 0,
      hrRate: 0,
      sbRate: 0,
    };
  }

  // Return stats object with all values as is
  return stats;
}

/**
 * Calculate projections for a batter
 */
export async function calculateProjections(
  stats: BatterStats,
  environment: Environment,
  ballpark: BallparkFactors,
  batter: BatterInfo,
  game: GameInfo
): Promise<Projections> {
  try {
    // Calculate hit projections
    const hitProjections = await calculateHitProjections(
      batter.id,
      batter.isHome
        ? game.pitchers.away.id
        : game.pitchers.home.id,
      game.gameId.toString(),
      game.environment,
      game.ballpark
    );

    // Expected runs
    const expectedRuns = 0.8; // Average for a starting player

    // Expected RBIs
    const expectedRBIs = 0.8; // Average for a starting player

    // Return projection data
    return {
      runs: expectedRuns,
      rbi: expectedRBIs,
      expectedPoints: hitProjections.total * 3.5, // Rough average of hit points
      hitProjections: {
        total: hitProjections.total,
        singles: hitProjections.byType.singles.expected,
        doubles: hitProjections.byType.doubles.expected,
        triples: hitProjections.byType.triples.expected,
        homeRuns: hitProjections.byType.homeRuns.expected,
        confidence: hitProjections.confidence,
      },
      upside: hitProjections.total * 5, // Higher ceiling
      floor: hitProjections.total * 2, // Lower floor
    };
  } catch (error) {
    console.error(
      `Error calculating projections for batter ${batter.id}:`,
      error
    );
    return {
      runs: 0,
      rbi: 0,
      expectedPoints: 0,
      hitProjections: {
        total: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        confidence: 0,
      },
      upside: 0,
      floor: 0,
    };
  }
}

/**
 * Calculate detailed hit projections
 */
async function calculateDetailedHitProjections(
  batterId: number,
  pitcherId: number,
  gameId: string,
  environment: Environment,
  ballpark: BallparkFactors
): Promise<DetailedHitProjections> {
  try {
    // Get hit projections from hits module
    const hitRates = await calculateHitProjections(
      batterId,
      pitcherId,
      gameId,
      environment,
      ballpark
    );

    return hitRates;
  } catch (error) {
    console.error(
      `Error calculating hit projections for batter ${batterId}:`,
      error
    );
    return {
      total: 0,
      byType: {
        singles: { expected: 0, points: 0 },
        doubles: { expected: 0, points: 0 },
        triples: { expected: 0, points: 0 },
        homeRuns: { expected: 0, points: 0 },
      },
      confidence: 0,
      factors: {
        weather: null,
        ballpark: null,
        career: null,
      },
    };
  }
}

/**
 * Create default batter analysis for missing data
 */
export function getDefaultBatterAnalysis(
  batter: BatterInfo,
  game: GameInfo
): BatterAnalysis {
  const emptySeasonStats: SeasonStats = {
    gamesPlayed: 0,
    atBats: 0,
    hits: 0,
    homeRuns: 0,
    rbi: 0,
    avg: 0,
    obp: 0,
    slg: 0,
    ops: 0,
    stolenBases: 0,
    caughtStealing: 0,
    runs: 0,
    doubles: 0,
    triples: 0,
    walks: 0,
    strikeouts: 0,
    sacrificeFlies: 0,
    hitByPitches: 0,
    plateAppearances: 0,
  };

  // Create default analysis object
  return {
    batterId: batter.id,
    name: batter.name || `Batter ${batter.id}`,
    team: "Unknown",
    opponent: "Unknown",
    opposingPitcher: {
      id: game?.pitchers?.away?.id || 0,
      name: game?.pitchers?.away?.name || "Unknown",
      throwsHand: game?.pitchers?.away?.throwsHand || "R",
    },
    position: batter.position,
    gameId: parseInt(game?.gameId?.toString() || "0"),
    venue: game?.venue?.name || "Unknown",
    stats: {
      seasonStats: {
        "2024": emptySeasonStats,
        "2025": emptySeasonStats,
      },
      quality: getDefaultQualityMetrics(),
    },
    matchup: {
      advantageScore: 0.5,
      platoonAdvantage: false,
      historicalStats: {
        atBats: 0,
        hits: 0,
        avg: 0,
        homeRuns: 0,
        ops: 0,
      },
    },
    projections: {
      homeRunProbability: 0,
      stolenBaseProbability: 0,
      expectedHits: {
        total: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        confidence: 0,
      },
      dfsProjection: {
        expectedPoints: 0,
        upside: 0,
        floor: 0,
        breakdown: {
          hits: 0,
          singles: 0,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          runs: 0,
          rbi: 0,
          stolenBases: 0,
          walks: 0,
        },
      },
    },
    lineupPosition: batter.lineupPosition,
    factors: {
      weather: {
        temperature: game?.environment?.temperature || 70,
        windSpeed: game?.environment?.windSpeed || 0,
        windDirection: game?.environment?.windDirection || "None",
        isOutdoor: game?.environment?.isOutdoor || false,
        temperatureFactor: 1.0,
        windFactor: 1.0,
        overallFactor: 1.0,
        byHitType: {
          singles: 1.0,
          doubles: 1.0,
          triples: 1.0,
          homeRuns: 1.0,
        },
      },
      ballpark: {
        overall: game?.ballpark?.overall || 1.0,
        singles: game?.ballpark?.types?.singles || 1.0,
        doubles: game?.ballpark?.types?.doubles || 1.0,
        triples: game?.ballpark?.types?.triples || 1.0,
        homeRuns: game?.ballpark?.types?.homeRuns || 1.0,
        runs: game?.ballpark?.types?.runs || 1.0,
      },
      platoon: false,
      career: null,
    },
    draftKings: {
      draftKingsId: null,
      salary: null,
      positions: [batter.position],
      avgPointsPerGame: 0,
    },
  };
}

/**
 * Get default quality metrics
 */
function getDefaultQualityMetrics(): BatterQualityMetrics {
  return {
    battedBallQuality: 0.3,
    power: 0.3,
    contactRate: 0.3,
    plateApproach: 0.3,
    speed: 0.3,
    consistency: 30,
  };
}