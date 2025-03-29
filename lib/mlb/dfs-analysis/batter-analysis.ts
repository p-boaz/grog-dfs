// batter-analysis.ts

import { getBatterStats } from "../player/batter-stats";
import { estimateHomeRunProbability } from "./home-runs";
import { calculatePitcherDfsProjection } from "./aggregate-scoring";
import {
  getPlayerSeasonStats,
  getCareerStolenBaseProfile,
  getCatcherStolenBaseDefense,
} from "./stolen-bases";
import {
  calculateHitProjection,
  getPlayerHitStats,
  getCareerHitProfile,
  getWeatherHitImpact,
  getBallparkHitFactor,
  HIT_TYPE_POINTS,
  HitType,
} from "./hits";
import {
  calculateExpectedRuns,
  calculateExpectedRBIs,
  calculateRunProductionProjection,
} from "./run-production";
import { calculatePlateDisciplineProjection } from "./plate-discipline";

// Constants for placeholder values - matching daily-data-collector.ts
const PLACEHOLDER = {
  NUMERIC: 0,
  TEXT: "TBD",
  BOOLEAN: false,
  UNKNOWN: undefined,
};

interface BatterAnalysis {
  batterId: number;
  name: string;
  team: string;
  opponent: string;
  opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
  position: string;
  gameId: number;
  venue: string;
  stats: {
    seasonStats: {
      "2024": SeasonStats;
      "2025": SeasonStats;
    };
    quality: BatterQualityMetrics;
  };
  matchup: {
    advantageScore: number;
    platoonAdvantage: boolean;
    historicalStats: {
      atBats: number;
      hits: number;
      avg: number;
      homeRuns: number;
      ops: number;
    };
  };
  projections: {
    homeRunProbability: number;
    stolenBaseProbability: number;
    expectedHits: {
      total: number;
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      confidence: number;
    };
    dfsProjection: {
      expectedPoints: number;
      upside: number;
      floor: number;
      breakdown: {
        hits: number;
        singles: number;
        doubles: number;
        triples: number;
        homeRuns: number;
        runs: number;
        rbi: number;
        stolenBases: number;
        walks: number;
      };
    };
  };
  environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballparkFactors: {
    overall: number;
    homeRuns: number;
    runs: number;
  };
  lineupPosition?: number;
  factors: {
    weather: any;
    ballpark: any;
    platoon: boolean;
    career: any;
  };
  draftKings: {
    draftKingsId: number | null;
    salary: number | null;
    positions: string[];
    avgPointsPerGame: number;
  };
}

interface BatterQualityMetrics {
  battedBallQuality?: number;
  power?: number;
  contactRate?: number;
  plateApproach?: number;
  speed?: number;
}

interface HitProjection {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  total: number;
  confidence: number;
}

interface BatterProjections {
  homeRunProbability: number;
  stolenBaseProbability: number;
  expectedHits: HitProjection;
  dfsProjection: {
    expectedPoints: number;
    floor: number;
    ceiling: number;
    breakdown: {
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      stolenBases: number;
      walks: number;
    };
  };
}

interface DetailedHitProjections {
  total: number;
  byType: {
    singles: { expected: number; points: number };
    doubles: { expected: number; points: number };
    triples: { expected: number; points: number };
    homeRuns: { expected: number; points: number };
  };
  confidence: number;
  factors: {
    weather: any;
    ballpark: any;
    career: any;
  };
}

// Add missing interfaces
interface BatterInfo {
  id: number;
  name?: string;
  position: string;
  lineupPosition: number;
  isHome: boolean;
  opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
}

interface GameInfo {
  gameId: number;
  venue: {
    id: number;
    name: string;
  };
  homeTeam: {
    name: string;
  };
  awayTeam: {
    name: string;
  };
  environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballpark: {
    overall: number;
    types: {
      homeRuns: number;
      runs: number;
    };
  };
  lineups: {
    homeCatcher?: { id: number };
    awayCatcher?: { id: number };
  };
}

interface Environment {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  isOutdoor: boolean;
}

interface BallparkFactors {
  overall: number;
  types: {
    homeRuns: number;
    runs: number;
  };
}

/**
 * Analyze all batters for a given set of games
 */
export async function analyzeBatters(games: any[]): Promise<BatterAnalysis[]> {
  const analyses: BatterAnalysis[] = [];

  for (const game of games) {
    const homeLineup = game.lineups.homeBatters || [];
    const awayLineup = game.lineups.awayBatters || [];

    // Skip if no lineups available
    if (homeLineup.length === 0 || awayLineup.length === 0) {
      console.warn(`Missing lineup data for game ${game.gameId}`);
      continue;
    }

    // Extract pitcher info for matchup analysis
    const homePitcher = game.pitchers.home
      ? {
          id: game.pitchers.home.id,
          name: game.pitchers.home.fullName,
          throwsHand: game.pitchers.home.throwsHand || "R", // Default to right-handed if unknown
        }
      : null;

    const awayPitcher = game.pitchers.away
      ? {
          id: game.pitchers.away.id,
          name: game.pitchers.away.fullName,
          throwsHand: game.pitchers.away.throwsHand || "R", // Default to right-handed if unknown
        }
      : null;

    // Filter function to exclude pitchers and check for valid position
    const isValidBatter = (player: any) => {
      // Exclude pitchers (position code 'P' or '1')
      if (player.position === "P" || player.position === "1") {
        return false;
      }

      // Include only valid batting positions
      const validPositions = [
        "C",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "DH",
      ];
      return validPositions.includes(player.position);
    };

    // Analyze home team batters (excluding pitchers)
    if (homeLineup.length > 0 && awayPitcher) {
      for (let i = 0; i < homeLineup.length; i++) {
        const batter = homeLineup[i];
        if (!isValidBatter(batter)) {
          continue;
        }
        try {
          const batterAnalysis = await analyzeBatter(
            {
              id: batter.id,
              name: batter.fullName,
              position: batter.position,
              lineupPosition: i + 1,
              isHome: true,
              opposingPitcher: awayPitcher,
            },
            game
          );
          analyses.push(batterAnalysis);
        } catch (error) {
          console.error(`Error analyzing home batter ${batter.id}:`, error);
        }
      }
    }

    // Analyze away team batters (excluding pitchers)
    if (awayLineup.length > 0 && homePitcher) {
      for (let i = 0; i < awayLineup.length; i++) {
        const batter = awayLineup[i];
        if (!isValidBatter(batter)) {
          continue;
        }
        try {
          const batterAnalysis = await analyzeBatter(
            {
              id: batter.id,
              name: batter.fullName,
              position: batter.position,
              lineupPosition: i + 1,
              isHome: false,
              opposingPitcher: homePitcher,
            },
            game
          );
          analyses.push(batterAnalysis);
        } catch (error) {
          console.error(`Error analyzing away batter ${batter.id}:`, error);
        }
      }
    }
  }

  return analyses;
}

// Update interfaces for multi-season support
interface BatterStats {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  batSide: string;
  seasonStats: {
    gamesPlayed: number;
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    stolenBases: number;
    caughtStealing: number;
  };
  careerStats: Array<{
    season: string;
    team: string;
    gamesPlayed: number;
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    stolenBases: number;
    caughtStealing: number;
  }>;
}

interface SeasonStats {
  gamesPlayed: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  stolenBases: number;
  caughtStealing: number;
}

// Helper function to format averages as strings
function formatAverage(value: number | undefined): string {
  if (!value) return ".000";
  const str = value.toString();
  return str.startsWith(".") ? str : `.${str.split(".")[1] || "000"}`;
}

// Helper function to parse string averages back to numbers for calculations
function parseAverage(value: string): number {
  return parseFloat(value) || 0;
}

// Helper function to map season stats and convert averages to strings
function mapSeasonStats(
  stats: BatterStats["seasonStats"] | undefined
): SeasonStats {
  if (!stats) {
    return {
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      homeRuns: 0,
      rbi: 0,
      avg: ".000",
      obp: ".000",
      slg: ".000",
      ops: ".000",
      stolenBases: 0,
      caughtStealing: 0,
    };
  }

  return {
    gamesPlayed: stats.gamesPlayed || 0,
    atBats: stats.atBats || 0,
    hits: stats.hits || 0,
    homeRuns: stats.homeRuns || 0,
    rbi: stats.rbi || 0,
    avg: formatAverage(stats.avg),
    obp: formatAverage(stats.obp),
    slg: formatAverage(stats.slg),
    ops: formatAverage(stats.ops),
    stolenBases: stats.stolenBases || 0,
    caughtStealing: stats.caughtStealing || 0,
  };
}

// Update the getPlayerStats function signature
const getPlayerStats = async (batterId: number, season: number) => {
  try {
    const stats = await getBatterStats({ batterId, season });
    return stats;
  } catch (error) {
    console.log(
      `Using career averages for player ${batterId} due to missing ${season} stats`
    );
    return getCareerStats(batterId);
  }
};

// Update the getCareerStats function signature
const getCareerStats = async (batterId: number) => {
  try {
    const currentYear = new Date().getFullYear();
    const stats = await getBatterStats({ batterId, season: currentYear });
    return stats;
  } catch (error) {
    console.warn(`No career stats found for player ${batterId}`);
    return null;
  }
};

// Update the analyzeBatter function to handle multiple seasons
const analyzeBatter = async (
  batter: BatterInfo,
  game: GameInfo
): Promise<BatterAnalysis> => {
  try {
    // Get stats for both seasons
    const [stats2024, stats2025] = await Promise.all([
      getBatterStats({ batterId: batter.id, season: 2024 }),
      getBatterStats({ batterId: batter.id, season: 2025 }),
    ]);

    // Map season stats for both years, ensuring we use the correct season's data
    const seasonStats = {
      "2024": mapSeasonStats(stats2024?.seasonStats),
      "2025": mapSeasonStats(stats2025?.seasonStats),
    };

    // Use 2025 as primary stats for calculations if available, otherwise fall back to 2024
    const primaryStats =
      stats2025?.seasonStats?.gamesPlayed > 0
        ? mapSeasonStats(stats2025.seasonStats)
        : mapSeasonStats(stats2024?.seasonStats);

    // Get batter handedness
    const handedness = stats2025?.batSide || stats2024?.batSide || "R";

    // Get quality metrics from Statcast data or other sources
    const qualityMetrics = {
      battedBallQuality: 0,
      power: 0,
      contactRate: 0,
      plateApproach: 0,
      speed: 0,
    };

    // Calculate projections based on primary stats
    const projections = await calculateProjections(
      primaryStats,
      game.environment,
      game.ballpark,
      batter,
      game
    );

    return {
      batterId: batter.id,
      name: batter.name || `Batter ${batter.id}`,
      team: batter.isHome ? game.homeTeam.name : game.awayTeam.name,
      opponent: batter.isHome ? game.awayTeam.name : game.homeTeam.name,
      opposingPitcher: {
        id: batter.opposingPitcher.id,
        name: batter.opposingPitcher.name,
        throwsHand: batter.opposingPitcher.throwsHand,
      },
      position: batter.position,
      gameId: game.gameId,
      venue: game.venue.name,
      stats: {
        seasonStats,
        quality: qualityMetrics,
      },
      matchup: {
        advantageScore: 50,
        platoonAdvantage: false,
        historicalStats: {
          atBats: 0,
          hits: 0,
          avg: 0,
          homeRuns: 0,
          ops: 0,
        },
      },
      projections,
      environment: {
        temperature: game.environment.temperature,
        windSpeed: game.environment.windSpeed,
        windDirection: game.environment.windDirection,
        isOutdoor: game.environment.isOutdoor,
      },
      ballparkFactors: {
        overall: game.ballpark.overall,
        homeRuns: game.ballpark.types.homeRuns,
        runs: game.ballpark.types.runs,
      },
      lineupPosition: batter.lineupPosition,
      factors: {
        weather: null,
        ballpark: null,
        platoon: false,
        career: null,
      },
      draftKings: {
        draftKingsId: null,
        salary: null,
        positions: [],
        avgPointsPerGame: 0,
      },
    };
  } catch (error) {
    console.error(`Error analyzing batter ${batter.id}:`, error);
    return getDefaultBatterAnalysis(batter, game);
  }
};

// Helper function to calculate projections
async function calculateProjections(
  stats: SeasonStats,
  environment: Environment,
  ballpark: BallparkFactors,
  batter: BatterInfo,
  game: GameInfo
) {
  try {
    // Get run production projection
    const runProductionProj = await calculateRunProductionProjection(
      batter.id,
      game.gameId.toString(),
      batter.opposingPitcher.id,
      batter.isHome
    ).catch(() => ({
      runs: { expected: 0.5, points: 1.0, confidence: 50 },
      rbis: { expected: 0.5, points: 1.0, confidence: 50 },
      total: { expected: 1.0, points: 2.0, confidence: 50 },
    }));

    // Get plate discipline projection
    const disciplineProj = await calculatePlateDisciplineProjection(
      batter.id,
      batter.opposingPitcher.id
    ).catch(() => ({
      walks: { expected: 0.4, points: 0.8, confidence: 50 },
      hbp: { expected: 0.04, points: 0.08, confidence: 40 },
      total: { expected: 0.44, points: 0.88, confidence: 50 },
    }));

    // Calculate estimated DFS points
    const totalPoints =
      runProductionProj.total.points + disciplineProj.total.points;

    return {
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
        expectedPoints: totalPoints,
        upside: totalPoints * 1.5,
        floor: totalPoints * 0.5,
        breakdown: {
          hits: 0,
          singles: 0,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          runs: runProductionProj.runs.expected,
          rbi: runProductionProj.rbis.expected,
          stolenBases: 0,
          walks: disciplineProj.walks.expected,
        },
      },
    };
  } catch (error) {
    console.error(
      `Error calculating projections for batter ${batter.id}:`,
      error
    );

    // Return default projections
    return {
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
    };
  }
}

// Helper function to estimate batter points
function estimateBatterPoints(
  stats: SeasonStats,
  hrProb: number,
  sbProb: number,
  pitcherProj: any,
  lineupPosition: number,
  hitProjections: any
): number {
  const avgPlateAppearances = 4.2;

  // Use detailed hit projections
  const hitPoints =
    hitProjections.byType.singles.points +
    hitProjections.byType.doubles.points +
    hitProjections.byType.triples.points;

  const expectedRuns = lineupPosition <= 4 ? 0.6 : 0.4;
  const expectedRbi = lineupPosition >= 3 && lineupPosition <= 5 ? 0.7 : 0.4;
  const expectedWalks =
    (parseAverage(stats.obp) - parseAverage(stats.avg)) * avgPlateAppearances;

  return (
    hitPoints +
    hrProb * 10 +
    expectedRuns * 2 +
    expectedRbi * 2 +
    sbProb * 5 +
    expectedWalks * 2
  );
}

/**
 * Run analysis for today's games and print results
 */
export async function analyzeBattersForToday(games: any[]): Promise<void> {
  console.log("Analyzing batters for today's games...");

  const analyses = await analyzeBatters(games);

  // Sort batters by expected DFS points
  const sortedBatters = analyses.sort(
    (a, b) =>
      b.projections.dfsProjection.expectedPoints -
      a.projections.dfsProjection.expectedPoints
  );

  // Print analysis results
  console.log("\nTop Batter Rankings (by projected DFS points):\n");

  // Show top 20 batters
  const topBatters = sortedBatters.slice(0, 20);

  topBatters.forEach((batter, index) => {
    console.log(
      `${index + 1}. ${batter.name} (${batter.position}, ${batter.team} vs ${
        batter.opponent
      })`
    );
    console.log(`   Batting ${batter.lineupPosition || "N/A"} | Matchup: 
  ${batter.opposingPitcher.name} (${batter.opposingPitcher.throwsHand})`);
    console.log(
      `   Season Stats: ${batter.stats.seasonStats["2025"].avg} AVG, ${batter.stats.seasonStats["2025"].ops} OPS, 
  ${batter.stats.seasonStats["2025"].homeRuns} HR, ${batter.stats.seasonStats["2025"].stolenBases} SB`
    );
    console.log(`   Matchup Advantage: ${batter.matchup.advantageScore.toFixed(
      1
    )}/100 
  ${batter.matchup.platoonAdvantage ? "[Platoon Advantage]" : ""}`);

    if (batter.matchup.historicalStats.atBats > 0) {
      console.log(
        `   vs. This Pitcher: ${batter.matchup.historicalStats.avg} AVG, 
  ${batter.matchup.historicalStats.ops} OPS (${batter.matchup.historicalStats.atBats} AB)`
      );
    }

    console.log(`   Projections:`);
    console.log(
      `   - HR Probability: ${(
        batter.projections.homeRunProbability * 100
      ).toFixed(1)}%`
    );
    console.log(
      `   - SB Probability: ${(
        batter.projections.stolenBaseProbability * 100
      ).toFixed(1)}%`
    );
    console.log(
      `   - Expected Hits: ${batter.projections.expectedHits.total.toFixed(1)}`
    );
    console.log(
      `   - DFS Points: ${batter.projections.dfsProjection.expectedPoints.toFixed(
        1
      )} (Floor: 
  ${batter.projections.dfsProjection.floor.toFixed(1)}, Ceiling: 
  ${batter.projections.dfsProjection.upside.toFixed(1)})`
    );
    console.log(
      `   Environment: ${batter.environment.temperature}°F, ${batter.environment.windSpeed}mph 
  ${batter.environment.windDirection}`
    );
    console.log(
      `   Ballpark Factors: ${batter.ballparkFactors.overall} overall, 
  ${batter.ballparkFactors.homeRuns} HR\n`
    );
  });
}

/**
 * Calculate stolen base probability considering multiple factors
 */
async function calculateStolenBaseProbability(
  batterId: number,
  catcherId: number,
  seasonStats: any
): Promise<{
  probability: number;
  factors: {
    seasonTendency: number;
    careerProfile: number;
    catcherDefense: number;
    gameState: number;
  };
}> {
  try {
    const [seasonSBStats, careerProfile, catcherDefense] = await Promise.all([
      getPlayerSeasonStats(batterId),
      getCareerStolenBaseProfile(batterId),
      getCatcherStolenBaseDefense(catcherId),
    ]);

    // Base probability from season stats
    const seasonTendency = seasonSBStats?.stolenBaseRate || 0.02;

    // Career factor (0.8-1.2 multiplier)
    const careerFactor = careerProfile
      ? careerProfile.recentTrend === "increasing"
        ? 1.2
        : careerProfile.recentTrend === "decreasing"
        ? 0.8
        : 1.0
      : 1.0;

    // Catcher defense factor (0.7-1.3 multiplier)
    const catcherFactor = catcherDefense
      ? catcherDefense.caughtStealingPercentage > 0.35
        ? 0.7 // Strong catcher
        : catcherDefense.caughtStealingPercentage < 0.25
        ? 1.3 // Weak catcher
        : 1.0
      : 1.0;

    // Game state factor (simplified - could consider score, inning, etc.)
    const gameStateFactor = 1.0;

    // Calculate final probability
    const probability = Math.min(
      1,
      seasonTendency * careerFactor * catcherFactor * gameStateFactor
    );

    return {
      probability,
      factors: {
        seasonTendency: seasonTendency,
        careerProfile: careerFactor,
        catcherDefense: catcherFactor,
        gameState: gameStateFactor,
      },
    };
  } catch (error) {
    console.error(`Error calculating SB probability for ${batterId}:`, error);
    return {
      probability: 0.02,
      factors: {
        seasonTendency: 0,
        careerProfile: 1,
        catcherDefense: 1,
        gameState: 1,
      },
    };
  }
}

/**
 * Calculate detailed hit projections for a batter
 */
async function calculateDetailedHitProjections(
  batterId: number,
  gameId: string,
  opposingPitcherId: number,
  isHome: boolean,
  venueId: number
): Promise<DetailedHitProjections> {
  try {
    // Gather all hit-related data in parallel
    const [
      hitProjection,
      playerHitStats,
      careerProfile,
      weatherImpact,
      ballparkFactors,
    ] = await Promise.all([
      calculateHitProjection(batterId, gameId, opposingPitcherId, isHome),
      getPlayerHitStats(batterId),
      getCareerHitProfile(batterId),
      getWeatherHitImpact(gameId),
      getBallparkHitFactor(venueId),
    ]);

    if (!hitProjection) {
      throw new Error("Failed to calculate hit projection");
    }

    return {
      total: hitProjection.expectedHits,
      byType: hitProjection.byType,
      confidence: hitProjection.confidence,
      factors: {
        weather: weatherImpact,
        ballpark: ballparkFactors,
        career: careerProfile,
      },
    };
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

// Add getDefaultBatterAnalysis function
function getDefaultBatterAnalysis(
  batter: BatterInfo,
  game: GameInfo
): BatterAnalysis {
  return {
    batterId: batter.id,
    name: batter.name || `Batter ${batter.id}`,
    team: batter.isHome ? game.homeTeam.name : game.awayTeam.name,
    opponent: batter.isHome ? game.awayTeam.name : game.homeTeam.name,
    opposingPitcher: {
      id: batter.opposingPitcher.id,
      name: batter.opposingPitcher.name,
      throwsHand: batter.opposingPitcher.throwsHand,
    },
    position: batter.position,
    gameId: game.gameId,
    venue: game.venue.name,
    stats: {
      seasonStats: {
        "2024": {
          gamesPlayed: 0,
          atBats: 0,
          hits: 0,
          homeRuns: 0,
          rbi: 0,
          avg: ".000",
          obp: ".000",
          slg: ".000",
          ops: ".000",
          stolenBases: 0,
          caughtStealing: 0,
        },
        "2025": {
          gamesPlayed: 0,
          atBats: 0,
          hits: 0,
          homeRuns: 0,
          rbi: 0,
          avg: ".000",
          obp: ".000",
          slg: ".000",
          ops: ".000",
          stolenBases: 0,
          caughtStealing: 0,
        },
      },
      quality: {
        battedBallQuality: 0,
        power: 0,
        contactRate: 0,
        plateApproach: 0,
        speed: 0,
      },
    },
    matchup: {
      advantageScore: 50,
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
    environment: {
      temperature: game.environment.temperature,
      windSpeed: game.environment.windSpeed,
      windDirection: game.environment.windDirection,
      isOutdoor: game.environment.isOutdoor,
    },
    ballparkFactors: {
      overall: game.ballpark.overall,
      homeRuns: game.ballpark.types.homeRuns,
      runs: game.ballpark.types.runs,
    },
    lineupPosition: batter.lineupPosition,
    factors: {
      weather: null,
      ballpark: null,
      platoon: false,
      career: null,
    },
    draftKings: {
      draftKingsId: null,
      salary: null,
      positions: [],
      avgPointsPerGame: 0,
    },
  };
}
