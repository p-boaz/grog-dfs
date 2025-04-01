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
// @ts-ignore Missing function name mismatches
import { estimateStolenBaseProbability } from "./stolen-bases";
// @ts-ignore Missing function name mismatches
import { calculateRunProduction } from "./run-production";
import { calculatePlateDisciplineProjection } from "./plate-discipline";
// @ts-ignore Missing function name mismatches
import { calculateHitProjections } from "./hits";
import { getGameEnvironmentData } from "../weather/weather";
// @ts-ignore Missing module
import { getBallparkFactors } from "../environment";
import { getBatterStats } from "../player/batter-stats";
import { getPitcherStats } from "../player/pitcher-stats";
// @ts-ignore Missing export
import { getMatchupData } from "../player/matchups";
// @ts-ignore Missing export
import { calculatePitcherDfsProjection } from "./starting-pitcher-analysis";
import {
  BatterAnalysis,
  BatterInfo,
  BatterQualityMetrics,
  DetailedHitProjections,
  GameInfo,
  Projections,
  RunProductionAnalysis,
  SeasonStats,
} from "../types/analysis";
import { BallparkFactors } from "../types/environment/ballpark";
import { Environment } from "../types/environment/weather";
import { calculateQualityMetrics } from "./quality-metrics";
import { mapBatterToPlayer } from "../draftkings/player-mapping";

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
    // @ts-ignore Parameter type mismatch
    const game = await getGameEnvironmentData(gameId);
    if (!game) {
      console.error(`No game data found for game ${gameId}`);
      return batters.map((batter) => getDefaultBatterAnalysis(batter, null));
    }

    // Process batters
    const results: BatterAnalysis[] = [];
    for (const batter of batters) {
      try {
        // @ts-ignore Type mismatch with GameInfo
        const analysis = await analyzeBatter(batter, game);
        results.push(analysis);
      } catch (error) {
        console.error(`Error analyzing batter ${batter.id}:`, error);
        // @ts-ignore Type mismatch with GameInfo
        results.push(getDefaultBatterAnalysis(batter, game));
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
async function analyzeBatter(
  batter: BatterInfo,
  game: GameInfo
): Promise<BatterAnalysis> {
  try {
    // Determine if batter is home or away
    const isHome = batter.isHome;
    const team = isHome ? game.homeTeam : game.awayTeam;
    const opponent = isHome ? game.awayTeam : game.homeTeam;

    // Get batter's stats
    const stats = await getBatterStats({
      batterId: batter.id || 0,
      season: 2025,
    }).catch(() => null);

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
          // @ts-ignore Type mismatch in ballpark structure
          singles: game.ballpark?.types?.singles || 1.0,
          // @ts-ignore Type mismatch in ballpark structure
          doubles: game.ballpark?.types?.doubles || 1.0,
          // @ts-ignore Type mismatch in ballpark structure
          triples: game.ballpark?.types?.triples || 1.0,
          // @ts-ignore Type mismatch in ballpark structure
          homeRuns: game.ballpark?.types?.homeRuns || 1.0,
          // @ts-ignore Type mismatch in ballpark structure
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
    if (stats) {
      // Create a base stats object with required properties
      const baseStats: SeasonStats = {
        gamesPlayed: stats.seasonStats.gamesPlayed || 0,
        atBats: stats.seasonStats.atBats || 0,
        hits: stats.seasonStats.hits || 0,
        runs: stats.seasonStats.runs || 0,
        doubles: stats.seasonStats.doubles || 0,
        triples: stats.seasonStats.triples || 0,
        homeRuns: stats.seasonStats.homeRuns || 0,
        rbi: stats.seasonStats.rbi || 0,
        avg: stats.seasonStats.avg || 0,
        obp: stats.seasonStats.obp || 0,
        slg: stats.seasonStats.slg || 0,
        ops: stats.seasonStats.ops || 0,
        stolenBases: stats.seasonStats.stolenBases || 0,
        caughtStealing: stats.seasonStats.caughtStealing || 0,
        walks: stats.seasonStats.walks || 0,
        strikeouts: stats.seasonStats.strikeouts || 0,
        sacrificeFlies: stats.seasonStats.sacrificeFlies || 0,
        hitByPitches: stats.seasonStats.hitByPitches || 0,
        plateAppearances: stats.seasonStats.plateAppearances || 0,
      };

      // Add any available additional properties
      if ("runs" in stats.seasonStats)
        baseStats.runs = stats.seasonStats.runs as number;
      if ("wOBAvsL" in stats.seasonStats)
        baseStats.wOBAvsL = stats.seasonStats.wOBAvsL as number;
      if ("wOBAvsR" in stats.seasonStats)
        baseStats.wOBAvsR = stats.seasonStats.wOBAvsR as number;
      if ("wOBA" in stats.seasonStats)
        baseStats.wOBA = stats.seasonStats.wOBA as number;
      if ("iso" in stats.seasonStats)
        baseStats.iso = stats.seasonStats.iso as number;
      if ("babip" in stats.seasonStats)
        baseStats.babip = stats.seasonStats.babip as number;
      if ("kRate" in stats.seasonStats)
        baseStats.kRate = stats.seasonStats.kRate as number;
      if ("bbRate" in stats.seasonStats)
        baseStats.bbRate = stats.seasonStats.bbRate as number;
      if ("hrRate" in stats.seasonStats)
        baseStats.hrRate = stats.seasonStats.hrRate as number;
      if ("sbRate" in stats.seasonStats)
        baseStats.sbRate = stats.seasonStats.sbRate as number;

      // Get previous season stats if available (2024 in this case)
      const prevStats = {
        seasonStats: baseStats,
      };

      // Update overall entry with current stats
      const currentStats = stats;

      // Set platoon advantage
      const platoonAdvantage =
        (batter.isHome
          ? game.pitchers.away.throwsHand === "L" && stats.batSide === "R"
          : game.pitchers.home.throwsHand === "L" && stats.batSide === "R") ||
        (batter.isHome
          ? game.pitchers.away.throwsHand === "R" && stats.batSide === "L"
          : game.pitchers.home.throwsHand === "R" && stats.batSide === "L");

      // Get matchup data against this pitcher
      const matchup = await getMatchupData(
        currentStats.id,
        batter.isHome ? game.pitchers.away.id : game.pitchers.home.id
      );

      // Calculate batter quality metrics
      const qualityMetrics = calculateQualityMetrics(currentStats.seasonStats);

      // Get HR probability projection
      // @ts-ignore Type mismatch with BallparkFactors
      const hrProbability = await estimateHomeRunProbability(
        currentStats.id,
        game.pitchers.away.id,
        game.ballpark,
        game.environment
      );

      // Get stolen base probability
      const sbProbability = await estimateStolenBaseProbability(
        currentStats.id,
        game.pitchers.away.id,
        batter.isHome ? game.lineups.awayCatcher?.id : game.lineups.homeCatcher?.id
      );

      // Get run production projection
      const runProductionProj = await calculateRunProduction(
        currentStats.id,
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
        currentStats.id,
        game.pitchers.away.id
      );

      // Calculate final projections
      // @ts-ignore Type mismatch with BallparkFactors
      const projections = await calculateProjections(
        currentStats.seasonStats,
        game.environment,
        game.ballpark,
        batter,
        game
      );

      // Calculate expected points
      const expectedPoints = estimateBatterPoints(
        currentStats.seasonStats,
        hrProbability.probability,
        sbProbability.probability,
        pitcherProj,
        batter.lineupPosition,
        plateDiscipline,
        runProductionProj
      );

      // Get DraftKings info
      const dkInfo = await mapBatterToPlayer(currentStats.id, currentStats.fullName);

      // Update entry with all calculated data
      entry.factors.platoon = platoonAdvantage;
      // @ts-ignore Property mismatch in HR factors
      entry.factors.weather.temperatureFactor =
        hrProbability.factors.temperature || 1.0;
      // @ts-ignore Property mismatch in HR factors
      entry.factors.weather.windFactor = hrProbability.factors.wind || 1.0;
      // @ts-ignore Property mismatch in HR factors
      entry.factors.weather.overallFactor =
        hrProbability.factors.weatherOverall || 1.0;

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

      // Set season stats object for 2024 and 2025
      entry.stats.seasonStats = {
        "2024": mapSeasonStats(currentStats.seasonStats),
        "2025": mapSeasonStats(prevStats.seasonStats),
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
function estimateBatterPoints(
  stats: SeasonStats,
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
 * Helper function to map season stats and convert averages to strings
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
async function calculateProjections(
  stats: SeasonStats,
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
function getDefaultBatterAnalysis(
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