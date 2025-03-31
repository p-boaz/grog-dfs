// batter-analysis.ts

import { makeMLBApiRequest } from "../core/api-client";
import { getTeamAbbrev } from "../core/team-mapping";
import { DailyMLBData } from "../core/types";
import { findPlayerByNameFuzzy } from "../draftkings/player-mapping";
import { getBatterStats } from "../player/batter-stats";
import { getPitcherStats } from "../player/pitcher-stats";
import { DetailedHitProjection } from "../types/analysis";
import { calculatePitcherDfsProjection } from "./aggregate-scoring";
import {
  calculateHitProjection,
  getBallparkHitFactor,
  getCareerHitProfile,
  getPlayerHitStats,
  getWeatherHitImpact,
} from "./hits";
import { estimateHomeRunProbability } from "./home-runs";
import { calculatePlateDisciplineProjection } from "./plate-discipline";
import { calculateRunProductionPoints } from "./run-production";
import {
  getCareerStolenBaseProfile,
  getCatcherStolenBaseDefense,
  getPlayerSeasonStats,
} from "./stolen-bases";

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
  lineupPosition?: number;
  factors: {
    weather: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
      temperatureFactor: number;
      windFactor: number;
      overallFactor: number;
      byHitType: {
        singles: number;
        doubles: number;
        triples: number;
        homeRuns: number;
      };
    };
    ballpark: {
      overall: number;
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      runs: number;
    };
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
  consistency?: number;
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
  environment?: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballpark?: {
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
  pitchers: {
    away: {
      id: number;
      name: string;
      throwsHand: string;
    };
    home: {
      id: number;
      name: string;
      throwsHand: string;
    };
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

interface DKPlayer {
  id: number;
  name: string;
  position: string;
  salary: number;
  avgPointsPerGame: number;
  team?: string;
  lineupPosition?: number;
}

function mapDKPlayerToMLBId(dkPlayer: DKPlayer): DKPlayer {
  // Find the MLB ID by fuzzy matching the player name
  const player = findPlayerByNameFuzzy(dkPlayer.name);
  const id = player?.id || dkPlayer.id; // Keep existing ID if no match found

  if (!player?.id) {
    console.warn(`No MLB ID found for player: ${dkPlayer.name}`);
  }

  return {
    ...dkPlayer,
    id,
  };
}

/**
 * Analyze all batters for a given set of games
 */
export async function analyzeBatters(
  games: DailyMLBData["games"],
  dkBatters: Array<{
    id: number;
    name: string;
    position: string;
    salary: number;
    avgPointsPerGame: number;
    team?: string;
  }>
): Promise<BatterAnalysis[]> {
  // Map DraftKings players to include MLB IDs
  const mappedBatters = dkBatters.map(mapDKPlayerToMLBId);

  // Filter out players without MLB IDs
  const validBatters = mappedBatters.filter(
    (batter) => batter.id !== undefined
  );

  const analysis: BatterAnalysis[] = [];

  // Create maps for easy lookup by team
  const battersByTeam = new Map<string, DKPlayer[]>();

  // Group batters by team
  validBatters.forEach((batter) => {
    if (batter.team) {
      const team = batter.team.toUpperCase();
      if (!battersByTeam.has(team)) {
        battersByTeam.set(team, []);
      }
      battersByTeam.get(team)?.push(batter);
    }
  });

  // Process each game
  for (const game of games) {
    // Create factors structure from existing data
    const gameFactors = {
      weather: {
        temperature: game.environment?.temperature || 0,
        windSpeed: game.environment?.windSpeed || 0,
        windDirection: game.environment?.windDirection || "",
        isOutdoor: game.environment?.isOutdoor || true,
        temperatureFactor: 1,
        windFactor: 1,
        overallFactor: 1,
        byHitType: {
          singles: 1,
          doubles: 1,
          triples: 1,
          homeRuns: 1,
        },
      },
      ballpark: {
        overall: game.ballpark?.overall || 1,
        singles: 1,
        doubles: 1,
        triples: 1,
        homeRuns: game.ballpark?.types?.homeRuns || 1,
        runs: game.ballpark?.types?.runs || 1,
      },
    };

    // Get standardized team abbreviations
    const homeTeamAbbrev = getTeamAbbrev(game.homeTeam.name).toUpperCase();
    const awayTeamAbbrev = getTeamAbbrev(game.awayTeam.name).toUpperCase();

    // Get batters for this game
    const gameHomeBatters = battersByTeam.get(homeTeamAbbrev) || [];
    const gameAwayBatters = battersByTeam.get(awayTeamAbbrev) || [];

    console.log(
      `Processing game: ${game.awayTeam.name} @ ${game.homeTeam.name}`
    );
    console.log(
      `Found ${gameHomeBatters.length} home batters and ${gameAwayBatters.length} away batters`
    );

    // Process each batter
    for (const batter of [...gameHomeBatters, ...gameAwayBatters]) {
      const isHome = gameHomeBatters.includes(batter);
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
      };

      // Create analysis entry
      const entry: BatterAnalysis = {
        batterId: batter.id,
        name: batter.name,
        position: batter.position,
        team: team.name,
        opponent: opponent.name,
        opposingPitcher: {
          id: game.pitchers?.[isHome ? "away" : "home"]?.id || 0,
          name: game.pitchers?.[isHome ? "away" : "home"]?.fullName || "",
          throwsHand:
            game.pitchers?.[isHome ? "away" : "home"]?.throwsHand || "R",
        },
        gameId: game.gameId,
        venue: game.venue.name,
        stats: {
          seasonStats: {
            "2024": emptySeasonStats,
            "2025": emptySeasonStats,
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
          advantageScore: 0,
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
          weather: gameFactors.weather,
          ballpark: gameFactors.ballpark,
          platoon: false,
          career: null,
        },
        draftKings: {
          draftKingsId: null,
          salary: batter.salary,
          positions: batter.position ? [batter.position] : [],
          avgPointsPerGame: batter.avgPointsPerGame,
        },
      };

      // Get the batter information and opposing pitcher for analysis
      const batterInfo: BatterInfo = {
        id: batter.id,
        name: batter.name,
        position: batter.position,
        lineupPosition: batter.lineupPosition || 0,
        isHome: isHome,
        opposingPitcher: {
          id: game.pitchers?.[isHome ? "away" : "home"]?.id || 0,
          name: game.pitchers?.[isHome ? "away" : "home"]?.fullName || "",
          throwsHand:
            game.pitchers?.[isHome ? "away" : "home"]?.throwsHand || "R",
        },
      };

      // Get game information for analysis
      const gameInfo: GameInfo = {
        gameId: game.gameId,
        venue: game.venue,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        environment: game.environment,
        ballpark: game.ballpark,
        lineups: {
          homeCatcher: game.lineups?.home
            ? { id: 0 } // Placeholder with default value
            : undefined,
          awayCatcher: game.lineups?.away
            ? { id: 0 } // Placeholder with default value
            : undefined,
        },
        pitchers: {
          away: {
            id: game.pitchers?.away?.id || 0,
            name: game.pitchers?.away?.fullName || "",
            throwsHand: game.pitchers?.away?.throwsHand || "R",
          },
          home: {
            id: game.pitchers?.home?.id || 0,
            name: game.pitchers?.home?.fullName || "",
            throwsHand: game.pitchers?.home?.throwsHand || "R",
          },
        },
      };

      // Calculate quality metrics
      const quality = await calculateQualityMetrics(
        { id: batter.id, seasonStats: entry.stats.seasonStats["2025"] } as any,
        { id: batter.id, seasonStats: entry.stats.seasonStats["2024"] } as any,
        null
      );
      entry.stats.quality = quality;

      // Calculate hit projections
      const hitProjections = await calculateDetailedHitProjections(
        batter.id,
        game.gameId.toString(),
        gameInfo.pitchers[isHome ? "away" : "home"].id,
        isHome,
        game.venue.id
      );
      if (hitProjections) {
        entry.projections.expectedHits = {
          total: hitProjections.total,
          singles: hitProjections.byType.singles.expected,
          doubles: hitProjections.byType.doubles.expected,
          triples: hitProjections.byType.triples.expected,
          homeRuns: hitProjections.byType.homeRuns.expected,
          confidence: hitProjections.confidence,
        };
        entry.factors.weather = hitProjections.factors.weather;
        entry.factors.ballpark = hitProjections.factors.ballpark;
        entry.factors.career = hitProjections.factors.career;
      }

      // Calculate home run probability
      const hrProbability = await estimateHomeRunProbability(
        batter.id,
        parseInt(game.gameId.toString()),
        game.venue.id,
        isHome,
        gameInfo.pitchers[isHome ? "away" : "home"].id
      );
      if (hrProbability) {
        entry.projections.homeRunProbability =
          hrProbability.probability || 0.05;
      }

      // Calculate stolen base probability
      try {
        const catcherId =
          (isHome
            ? gameInfo.lineups.awayCatcher?.id
            : gameInfo.lineups.homeCatcher?.id) || 0;
        const sbProbability = await calculateStolenBaseProbability(
          batter.id,
          catcherId,
          entry.stats.seasonStats["2025"]
        );
        if (sbProbability) {
          entry.projections.stolenBaseProbability = sbProbability.probability;
        }
      } catch (error) {
        console.warn(
          `Error calculating stolen base probability for ${batter.name} (${batter.id}):`,
          error
        );
        // Default value for stolen base probability
        entry.projections.stolenBaseProbability =
          entry.stats.seasonStats["2025"].stolenBases > 0 ? 0.08 : 0.03;
      }

      // Calculate historical matchup stats
      try {
        const historicalMatchup = await getHistoricalMatchupStats(
          batter.id,
          gameInfo.pitchers[isHome ? "away" : "home"].id
        );
        if (historicalMatchup) {
          entry.matchup.historicalStats = historicalMatchup;
        }
      } catch (error) {
        console.warn(
          `Error getting historical matchup for ${batter.name} (${
            batter.id
          }) vs pitcher ${gameInfo.pitchers[isHome ? "away" : "home"].id}:`,
          error
        );
        // Keep default values from initialization
      }

      // Calculate DFS projection
      const runProductionProj = await calculateRunProductionPoints(
        batter.id,
        game.gameId.toString(),
        gameInfo.pitchers[isHome ? "away" : "home"].id,
        isHome
      ).catch(() => ({
        runs: { expected: 0.5, points: 1.0, confidence: 50 },
        rbis: { expected: 0.5, points: 1.0, confidence: 50 },
        total: { expected: 1.0, points: 2.0, confidence: 50 },
      }));

      const disciplineProj = await calculatePlateDisciplineProjection(
        batter.id,
        gameInfo.pitchers[isHome ? "away" : "home"].id
      ).catch(() => ({
        walks: { expected: 0.4, points: 0.8, confidence: 50 },
        hbp: { expected: 0.04, points: 0.08, confidence: 40 },
        total: { expected: 0.44, points: 0.88, confidence: 50 },
      }));

      // Calculate expected points
      const hitPoints = hitProjections
        ? hitProjections.byType.singles.points +
          hitProjections.byType.doubles.points +
          hitProjections.byType.triples.points +
          hitProjections.byType.homeRuns.points
        : 3.0;

      const hrPoints = entry.projections.homeRunProbability * 10;
      const sbPoints = entry.projections.stolenBaseProbability * 5;
      const runPoints = runProductionProj.runs.expected * 2;
      const rbiPoints = runProductionProj.rbis.expected * 2;
      const walkPoints = disciplineProj.walks.expected * 2;

      const totalPoints =
        hitPoints + hrPoints + sbPoints + runPoints + rbiPoints + walkPoints;

      entry.projections.dfsProjection = {
        expectedPoints: totalPoints,
        upside: totalPoints * 1.5,
        floor: totalPoints * 0.5,
        breakdown: {
          hits: hitProjections ? hitProjections.total : 0.7,
          singles: hitProjections
            ? hitProjections.byType.singles.expected
            : 0.5,
          doubles: hitProjections
            ? hitProjections.byType.doubles.expected
            : 0.15,
          triples: hitProjections
            ? hitProjections.byType.triples.expected
            : 0.05,
          homeRuns: entry.projections.homeRunProbability,
          runs: runProductionProj.runs.expected,
          rbi: runProductionProj.rbis.expected,
          stolenBases: entry.projections.stolenBaseProbability,
          walks: disciplineProj.walks.expected,
        },
      };

      // Update stats if available
      if (stats) {
        // Create a base stats object with required properties
        const baseStats: SeasonStats = {
          gamesPlayed: stats.seasonStats.gamesPlayed || 0,
          atBats: stats.seasonStats.atBats || 0,
          hits: stats.seasonStats.hits || 0,
          runs: 0, // Default value
          doubles: 0, // Default value
          triples: 0, // Default value
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
        };

        // Add any available additional properties
        if ("runs" in stats.seasonStats)
          baseStats.runs = stats.seasonStats.runs as number;
        if ("doubles" in stats.seasonStats)
          baseStats.doubles = stats.seasonStats.doubles as number;
        if ("triples" in stats.seasonStats)
          baseStats.triples = stats.seasonStats.triples as number;

        entry.stats.seasonStats["2025"] = baseStats;
      }

      // Update pitcher handedness if available
      const opposingPitcher = game.pitchers?.[isHome ? "away" : "home"];
      if (opposingPitcher) {
        const pitcherStats = await getBatterStats({
          batterId: opposingPitcher.id,
          season: 2025,
        }).catch(() => null);
        if (pitcherStats?.batSide) {
          entry.matchup.platoonAdvantage =
            pitcherStats.batSide === "L" && batter.position === "L";
        }
      }

      analysis.push(entry);
    }
  }

  return analysis;
}

// Update interfaces for multi-season support
interface BatterStats {
  id: number;
  fullName: string;
  currentTeam: string;
  primaryPosition: string;
  batSide: string;
  seasonStats: SeasonStats;
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
  lastGameStats?: SeasonStats;
  lastFiveGames?: SeasonStats[];
}

interface SeasonStats {
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
  wOBAvsL?: number;
  wOBAvsR?: number;
  runs: number;
  doubles: number;
  triples: number;
  walks: number;
  strikeouts: number;
  sacrificeFlies: number;
  wOBA?: number;
  iso?: number;
  babip?: number;
  kRate?: number;
  bbRate?: number;
  hrRate?: number;
  sbRate?: number;
}

interface Projections {
  runs: number;
  rbi: number;
  expectedPoints: number;
  hitProjections: {
    total: number;
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    confidence: number;
  };
  upside: number;
  floor: number;
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
      wOBA: 0,
      iso: 0,
      babip: 0,
      kRate: 0,
      bbRate: 0,
      hrRate: 0,
      sbRate: 0,
    };
  }

  return {
    ...stats,
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
    wOBA: stats.wOBA || 0,
    iso: stats.iso || 0,
    babip: stats.babip || 0,
    kRate: stats.kRate || 0,
    bbRate: stats.bbRate || 0,
    hrRate: stats.hrRate || 0,
    sbRate: stats.sbRate || 0,
  };
}

interface BatterStatsResponse {
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
    runs: number;
    doubles: number;
    triples: number;
    walks: number;
    strikeouts: number;
    sacrificeFlies: number;
    wOBA: number;
    iso: number;
    babip: number;
    kRate: number;
    bbRate: number;
    hrRate: number;
    sbRate: number;
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
  lastGameStats?: SeasonStats;
  lastFiveGames?: SeasonStats[];
}

const getPlayerStats = async (
  batterId: number,
  season: number
): Promise<BatterStats> => {
  try {
    const stats = (await getBatterStats({
      batterId,
      season,
    })) as unknown as BatterStatsResponse;
    return {
      id: batterId,
      fullName: stats.fullName || "",
      currentTeam: stats.currentTeam || "",
      primaryPosition: stats.primaryPosition || "",
      batSide: stats.batSide || "",
      seasonStats: {
        gamesPlayed: stats.seasonStats.gamesPlayed || 0,
        atBats: stats.seasonStats.atBats || 0,
        hits: stats.seasonStats.hits || 0,
        homeRuns: stats.seasonStats.homeRuns || 0,
        rbi: stats.seasonStats.rbi || 0,
        avg: stats.seasonStats.avg || 0,
        obp: stats.seasonStats.obp || 0,
        slg: stats.seasonStats.slg || 0,
        ops: stats.seasonStats.ops || 0,
        stolenBases: stats.seasonStats.stolenBases || 0,
        caughtStealing: stats.seasonStats.caughtStealing || 0,
        runs: stats.seasonStats.runs || 0,
        doubles: stats.seasonStats.doubles || 0,
        triples: stats.seasonStats.triples || 0,
        walks: stats.seasonStats.walks || 0,
        strikeouts: stats.seasonStats.strikeouts || 0,
        sacrificeFlies: stats.seasonStats.sacrificeFlies || 0,
        wOBA: stats.seasonStats.wOBA || 0,
        iso: stats.seasonStats.iso || 0,
        babip: stats.seasonStats.babip || 0,
        kRate: stats.seasonStats.kRate || 0,
        bbRate: stats.seasonStats.bbRate || 0,
        hrRate: stats.seasonStats.hrRate || 0,
        sbRate: stats.seasonStats.sbRate || 0,
      },
      careerStats: stats.careerStats || [],
      lastGameStats: stats.lastGameStats,
      lastFiveGames: stats.lastFiveGames,
    };
  } catch (error) {
    console.error(`Error getting player stats for ${batterId}:`, error);
    return {
      id: batterId,
      fullName: "",
      currentTeam: "",
      primaryPosition: "",
      batSide: "",
      seasonStats: {
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
        wOBA: 0,
        iso: 0,
        babip: 0,
        kRate: 0,
        bbRate: 0,
        hrRate: 0,
        sbRate: 0,
      },
      careerStats: [],
      lastGameStats: undefined,
      lastFiveGames: undefined,
    };
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
    // Get current and previous season stats
    const currentStats = await getPlayerStats(batter.id, 2024);
    const prevStats = await getPlayerStats(batter.id, 2023);
    const careerStats = await getCareerStats(batter.id);

    // Calculate quality metrics
    const qualityMetrics = await calculateQualityMetrics(
      currentStats,
      prevStats,
      careerStats as any
    );

    // Get historical matchup stats
    const historicalMatchup = await getHistoricalMatchupStats(
      batter.id,
      game.pitchers.away.id
    );

    // Calculate hit projections
    const hitProjections = await calculateDetailedHitProjections(
      batter.id,
      game.gameId.toString(),
      game.pitchers.away.id,
      batter.isHome,
      game.venue.id
    );

    // Calculate home run probability
    const hrProbability = await estimateHomeRunProbability(
      batter.id,
      parseInt(game.gameId.toString()),
      game.venue.id,
      batter.isHome,
      game.pitchers.away.id
    );

    // Calculate stolen base probability
    const sbProbability = await calculateStolenBaseProbability(
      batter.id,
      game.lineups.homeCatcher?.id || game.lineups.awayCatcher?.id || 0,
      currentStats.seasonStats
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
      hitProjections
    );

    return {
      batterId: batter.id,
      name: batter.name || "",
      team: batter.isHome ? game.homeTeam.name : game.awayTeam.name,
      opponent: batter.isHome ? game.awayTeam.name : game.homeTeam.name,
      opposingPitcher: {
        id: game.pitchers.away.id,
        name: game.pitchers.away.name,
        throwsHand: game.pitchers.away.throwsHand,
      },
      position: batter.position,
      gameId: game.gameId,
      venue: game.venue.name,
      stats: {
        seasonStats: {
          "2024": mapSeasonStats(currentStats.seasonStats),
          "2025": mapSeasonStats(prevStats.seasonStats),
        },
        quality: qualityMetrics,
      },
      matchup: {
        advantageScore: calculateMatchupAdvantage(
          currentStats,
          pitcherProj,
          batter.isHome
        ),
        platoonAdvantage: isPlatoonAdvantage(
          currentStats.batSide,
          game.pitchers.away.throwsHand
        ),
        historicalStats: historicalMatchup,
      },
      projections: {
        homeRunProbability: hrProbability.probability,
        stolenBaseProbability: sbProbability.probability,
        expectedHits: {
          total: hitProjections.total,
          singles: hitProjections.byType.singles.expected,
          doubles: hitProjections.byType.doubles.expected,
          triples: hitProjections.byType.triples.expected,
          homeRuns: hitProjections.byType.homeRuns.expected,
          confidence: hitProjections.confidence,
        },
        dfsProjection: {
          expectedPoints,
          upside: calculateUpside(expectedPoints, hitProjections),
          floor: calculateFloor(expectedPoints, hitProjections),
          breakdown: {
            hits: hitProjections.total,
            singles: hitProjections.byType.singles.expected,
            doubles: hitProjections.byType.doubles.expected,
            triples: hitProjections.byType.triples.expected,
            homeRuns: hitProjections.byType.homeRuns.expected,
            runs: projections.runs,
            rbi: projections.rbi,
            stolenBases: sbProbability.probability,
            walks: plateDiscipline.walks.expected,
          },
        },
      },
      lineupPosition: batter.lineupPosition,
      factors: {
        weather: {
          temperature: game.environment?.temperature || 0,
          windSpeed: game.environment?.windSpeed || 0,
          windDirection: game.environment?.windDirection || "",
          isOutdoor: game.environment?.isOutdoor || true,
          temperatureFactor: 1,
          windFactor: 1,
          overallFactor: 1,
          byHitType: {
            singles: 1,
            doubles: 1,
            triples: 1,
            homeRuns: 1,
          },
        },
        ballpark: {
          overall: game.ballpark?.overall || 1,
          singles: 1,
          doubles: 1,
          triples: 1,
          homeRuns: game.ballpark?.types?.homeRuns || 1,
          runs: game.ballpark?.types?.runs || 1,
        },
        platoon: false,
        career: hitProjections.factors.career,
      },
      draftKings: {
        draftKingsId: null,
        salary: null,
        positions: [batter.position],
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
): Promise<Projections> {
  try {
    // Get run production projection
    const runProductionProj = await calculateRunProductionPoints(
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
      runProductionProj.total.points +
      (disciplineProj.walks.expected * 2 + disciplineProj.hbp.expected * 2);

    return {
      runs: runProductionProj.runs.expected,
      rbi: runProductionProj.rbis.expected,
      expectedPoints: totalPoints,
      hitProjections: {
        total: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        confidence: 0,
      },
      upside: totalPoints * 1.5,
      floor: totalPoints * 0.5,
    };
  } catch (error) {
    console.error(
      `Error calculating projections for batter ${batter.id}:`,
      error
    );

    // Return default projections
    return {
      runs: 0.5,
      rbi: 0.5,
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
  const expectedWalks = (stats.obp - stats.avg) * avgPlateAppearances;

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

  const analyses = await analyzeBatters(games, []);

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
      `   Environment: ${batter.factors.weather.temperature}°F, ${batter.factors.weather.windSpeed}mph ${batter.factors.weather.windDirection}`
    );
    console.log(
      `   Ballpark Factors: ${batter.factors.ballpark.overall} overall, ${batter.factors.ballpark.homeRuns} HR\n`
    );
  });
}

/**
 * Calculate stolen base probability considering multiple factors
 */
async function calculateStolenBaseProbability(
  batterId: number,
  catcherId: number,
  stats: SeasonStats
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
    // Get season stolen base stats - handle potential nulls/errors
    let seasonStats = null;
    try {
      seasonStats = await getPlayerSeasonStats(batterId);
    } catch (error) {
      console.warn(
        `Error fetching season stolen base stats for player ${batterId}:`,
        error
      );
    }

    // Get career stolen base profile - handle potential nulls/errors
    let careerProfile = 0;
    try {
      const profileData = await getCareerStolenBaseProfile(batterId);
      careerProfile =
        profileData && typeof profileData === "object"
          ? profileData.careerRate || 0
          : 0;
    } catch (error) {
      console.warn(
        `Error fetching career stolen base profile for player ${batterId}:`,
        error
      );
      // Set a baseline value based on current stats if available
      if (stats && stats.stolenBases > 0) {
        careerProfile = 0.3;
      }
    }

    // Get catcher stolen base defense - handle potential nulls/errors
    let catcherDefense = 0.5; // Default middle value
    if (catcherId > 0) {
      try {
        const defenseData = await getCatcherStolenBaseDefense(catcherId);
        catcherDefense =
          defenseData && typeof defenseData === "object"
            ? defenseData.defensiveRating || 0.5
            : 0.5;
      } catch (error) {
        console.warn(
          `Error fetching catcher defense metrics for ${catcherId}:`,
          error
        );
      }
    }

    // Calculate season tendency
    const seasonTendency = calculateSeasonTendency(stats);

    // Calculate game state factor
    const gameState = calculateGameStateFactor(stats);

    // Calculate final probability
    const probability = calculateFinalProbability(
      seasonTendency,
      careerProfile,
      catcherDefense,
      gameState
    );

    return {
      probability,
      factors: {
        seasonTendency,
        careerProfile,
        catcherDefense,
        gameState,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating stolen base probability for player ${batterId}:`,
      error
    );

    // Create a default estimate based on any available data
    const hasStealHistory = stats && stats.stolenBases > 0;

    return {
      probability: hasStealHistory ? 0.08 : 0.02, // 8% chance for players with SB history, 2% for others
      factors: {
        seasonTendency: hasStealHistory ? 0.2 : 0,
        careerProfile: hasStealHistory ? 0.2 : 0,
        catcherDefense: 0.5,
        gameState: 0.2,
      },
    };
  }
}

function calculateSeasonTendency(stats: SeasonStats | null): number {
  if (!stats) return 0;

  const sbRate = stats.sbRate || 0;
  const successRate =
    stats.stolenBases && stats.stolenBases + stats.caughtStealing > 0
      ? stats.stolenBases / (stats.stolenBases + stats.caughtStealing)
      : 0;
  return sbRate * 0.6 + successRate * 0.4;
}

function calculateGameStateFactor(stats: SeasonStats | null): number {
  if (!stats) return 0.2; // Default baseline value

  const obp = stats.obp || 0;
  const avg = stats.avg || 0;
  return obp * 0.7 + avg * 0.3;
}

function calculateFinalProbability(
  seasonTendency: number,
  careerProfile: number,
  catcherDefense: number,
  gameState: number
): number {
  return (
    seasonTendency * 0.4 +
    careerProfile * 0.3 +
    catcherDefense * 0.2 +
    gameState * 0.1
  );
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

    const typedHitProjection = hitProjection as DetailedHitProjection;
    return {
      total: typedHitProjection.expectedHits,
      byType: typedHitProjection.byType,
      confidence: typedHitProjection.confidence,
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
    wOBAvsL: 0,
    wOBAvsR: 0,
    wOBA: 0,
    iso: 0,
    babip: 0,
    kRate: 0,
    bbRate: 0,
    hrRate: 0,
    sbRate: 0,
  };

  return {
    batterId: batter.id,
    name: batter.name || "",
    team: batter.isHome ? game.homeTeam.name : game.awayTeam.name,
    opponent: batter.isHome ? game.awayTeam.name : game.homeTeam.name,
    opposingPitcher: {
      id: game.pitchers.away.id,
      name: game.pitchers.away.name,
      throwsHand: game.pitchers.away.throwsHand,
    },
    position: batter.position,
    gameId: game.gameId,
    venue: game.venue.name,
    stats: {
      seasonStats: {
        "2024": emptySeasonStats,
        "2025": emptySeasonStats,
      },
      quality: {},
    },
    matchup: {
      advantageScore: 0,
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
        temperature: 0,
        windSpeed: 0,
        windDirection: "",
        isOutdoor: true,
        temperatureFactor: 1,
        windFactor: 1,
        overallFactor: 1,
        byHitType: {
          singles: 1,
          doubles: 1,
          triples: 1,
          homeRuns: 1,
        },
      },
      ballpark: {
        overall: 1,
        singles: 1,
        doubles: 1,
        triples: 1,
        homeRuns: 1,
        runs: 1,
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

async function calculateQualityMetrics(
  currentStats: BatterStats,
  prevStats: BatterStats | undefined,
  careerStats: BatterStats | undefined
): Promise<BatterQualityMetrics> {
  // Calculate batted ball quality
  const battedBallQuality = calculateBattedBallQuality(currentStats);

  // Calculate power metrics
  const power = calculatePowerMetrics(currentStats);

  // Calculate contact rate
  const contactRate = calculateContactRate(currentStats);

  // Calculate plate approach
  const plateApproach = calculatePlateApproach(currentStats);

  // Calculate speed metrics
  const speed = calculateSpeedMetrics(
    currentStats,
    careerStats?.careerStats || []
  );

  // Calculate consistency
  const consistency = calculateConsistency(currentStats, prevStats);

  return {
    battedBallQuality,
    power,
    contactRate,
    plateApproach,
    speed,
    consistency,
  };
}

function calculateConsistency(
  currentStats: BatterStats,
  prevStats: BatterStats | undefined
): number {
  if (!prevStats) return 0;

  const currentAvg = currentStats.seasonStats.avg;
  const prevAvg = prevStats.seasonStats.avg;
  const currentOPS = currentStats.seasonStats.ops;
  const prevOPS = prevStats.seasonStats.ops;

  // Calculate the difference between current and previous season stats
  const avgDiff = Math.abs(currentAvg - prevAvg);
  const opsDiff = Math.abs(currentOPS - prevOPS);

  // Normalize the differences to a 0-100 scale
  const avgConsistency = Math.max(0, 100 - avgDiff * 1000);
  const opsConsistency = Math.max(0, 100 - opsDiff * 100);

  // Weight the metrics
  return avgConsistency * 0.6 + opsConsistency * 0.4;
}

async function getHistoricalMatchupStats(
  batterId: number,
  pitcherId: number
): Promise<{
  atBats: number;
  hits: number;
  avg: number;
  homeRuns: number;
  ops: number;
  careerVsType: {
    atBats: number;
    avg: number;
    ops: number;
  };
  recentForm: {
    last10: {
      atBats: number;
      avg: number;
      ops: number;
    };
    last30: {
      atBats: number;
      avg: number;
      ops: number;
    };
  };
}> {
  try {
    // Get direct head-to-head matchup data
    const directMatchupEndpoint = `/people/${batterId}/stats?stats=vsPlayer&opposingPlayerId=${pitcherId}&group=hitting&sportId=1`;
    const directMatchupData = await makeMLBApiRequest<any>(
      directMatchupEndpoint,
      "V1"
    );

    // Get pitcher info to determine handedness
    const pitcherInfo = await getPitcherStats({ pitcherId });
    const pitcherHand = pitcherInfo?.pitchHand || "R";

    // Get batter's career stats vs this type of pitcher
    const vsTypeEndpoint = `/people/${batterId}/stats?stats=vsPitchHand&group=hitting&opposingPitchHand=${pitcherHand}&sportId=1`;
    const vsTypeData = await makeMLBApiRequest<any>(vsTypeEndpoint, "V1");

    // Get batter's recent performance (last 10 and 30 games)
    const recentEndpoint = `/people/${batterId}/stats?stats=byDateRange&group=hitting&season=${new Date().getFullYear()}&sportId=1`;
    const recentData = await makeMLBApiRequest<any>(recentEndpoint, "V1");

    // Parse direct matchup data
    let directStats = {
      atBats: 0,
      hits: 0,
      avg: 0,
      homeRuns: 0,
      ops: 0,
    };

    if (
      directMatchupData.stats?.length > 0 &&
      directMatchupData.stats[0].splits?.length > 0
    ) {
      const stats = directMatchupData.stats[0].splits[0].stat;
      directStats = {
        atBats: stats.atBats || 0,
        hits: stats.hits || 0,
        avg: stats.avg || 0,
        homeRuns: stats.homeRuns || 0,
        ops: stats.ops || 0,
      };
    }

    // Parse career vs type data
    let careerVsType = {
      atBats: 0,
      avg: 0,
      ops: 0,
    };

    if (
      vsTypeData.stats?.length > 0 &&
      vsTypeData.stats[0].splits?.length > 0
    ) {
      const stats = vsTypeData.stats[0].splits[0].stat;
      careerVsType = {
        atBats: stats.atBats || 0,
        avg: stats.avg || 0,
        ops: stats.ops || 0,
      };
    }

    // Parse recent performance data
    let recentForm = {
      last10: {
        atBats: 0,
        avg: 0,
        ops: 0,
      },
      last30: {
        atBats: 0,
        avg: 0,
        ops: 0,
      },
    };

    if (
      recentData.stats?.length > 0 &&
      recentData.stats[0].splits?.length > 0
    ) {
      const stats = recentData.stats[0].splits[0].stat;
      recentForm = {
        last10: {
          atBats: stats.last10AtBats || 0,
          avg: stats.last10Avg || 0,
          ops: stats.last10Ops || 0,
        },
        last30: {
          atBats: stats.last30AtBats || 0,
          avg: stats.last30Avg || 0,
          ops: stats.last30Ops || 0,
        },
      };
    }

    return {
      ...directStats,
      careerVsType,
      recentForm,
    };
  } catch (error) {
    console.error("Error fetching historical matchup stats:", error);
    return {
      atBats: 0,
      hits: 0,
      avg: 0,
      homeRuns: 0,
      ops: 0,
      careerVsType: {
        atBats: 0,
        avg: 0,
        ops: 0,
      },
      recentForm: {
        last10: {
          atBats: 0,
          avg: 0,
          ops: 0,
        },
        last30: {
          atBats: 0,
          avg: 0,
          ops: 0,
        },
      },
    };
  }
}

function calculateBattedBallQuality(stats: BatterStats): number {
  const babip = stats.seasonStats.babip || 0;
  const iso = stats.seasonStats.iso || 0;
  return (babip + iso) / 2;
}

function calculatePowerMetrics(stats: BatterStats): number {
  const hrRate = stats.seasonStats.hrRate || 0;
  const iso = stats.seasonStats.iso || 0;
  return (hrRate + iso) / 2;
}

function calculateContactRate(stats: BatterStats): number {
  const kRate = stats.seasonStats.kRate || 0;
  const babip = stats.seasonStats.babip || 0;
  return 1 - (kRate + (1 - babip)) / 2;
}

function calculatePlateApproach(stats: BatterStats): number {
  const bbRate = stats.seasonStats.bbRate || 0;
  const kRate = stats.seasonStats.kRate || 0;
  return (bbRate + (1 - kRate)) / 2;
}

function calculateSpeedMetrics(
  currentStats: BatterStats,
  careerStats: Array<{
    stolenBases: number;
    caughtStealing: number;
  }>
): number {
  const currentSbRate = currentStats.seasonStats.sbRate || 0;
  const careerSbRate =
    careerStats.reduce(
      (acc, stat) =>
        acc + stat.stolenBases / (stat.stolenBases + stat.caughtStealing || 1),
      0
    ) / careerStats.length;
  return (currentSbRate + careerSbRate) / 2;
}

function calculateMatchupAdvantage(
  batterStats: BatterStats,
  pitcherProj: any,
  isHome: boolean
): number {
  // Calculate matchup advantage based on:
  // 1. Batter's quality metrics
  // 2. Pitcher's projected performance
  // 3. Home/away advantage
  const batterQuality = calculateBattedBallQuality(batterStats);
  const pitcherQuality = pitcherProj.quality || 0.5;
  const homeAdvantage = isHome ? 0.05 : 0;

  return (batterQuality - pitcherQuality + homeAdvantage) * 100;
}

function isPlatoonAdvantage(
  batterHandedness: string,
  pitcherHandedness: string
): boolean {
  return (
    (batterHandedness === "L" && pitcherHandedness === "R") ||
    (batterHandedness === "R" && pitcherHandedness === "L")
  );
}

function calculateUpside(
  expectedPoints: number,
  hitProjections: DetailedHitProjections
): number {
  // Calculate upside based on:
  // 1. Expected points
  // 2. Hit projections
  // 3. Confidence in projections
  const maxPoints = Object.values(hitProjections.byType).reduce(
    (acc, { points }) => acc + points,
    0
  );
  return (
    expectedPoints + (maxPoints - expectedPoints) * hitProjections.confidence
  );
}

function calculateFloor(
  expectedPoints: number,
  hitProjections: DetailedHitProjections
): number {
  // Calculate floor based on:
  // 1. Expected points
  // 2. Hit projections
  // 3. Confidence in projections
  const minPoints = Math.min(
    ...Object.values(hitProjections.byType).map(({ points }) => points)
  );
  return (
    expectedPoints - (expectedPoints - minPoints) * hitProjections.confidence
  );
}
