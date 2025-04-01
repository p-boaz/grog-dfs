import {
  getPitcherHomeRunVulnerability,
  getPitcherStats,
} from "../../player/pitcher-stats";
import { calculateExpectedStrikeouts } from "../strikeouts";
import { calculatePitcherDfsProjection } from "./aggregate-scoring";
import { calculateExpectedInnings } from "./innings-pitched";
import { calculateControlProjection } from "./pitcher-control";
import { calculatePitcherWinProbability } from "./pitcher-win";
import { calculateRareEventPotential } from "./rare-events";

// Constants for placeholder values
const PLACEHOLDER = {
  NUMERIC: null as number | null,
  TEXT: "TBD" as string,
  BOOLEAN: false as boolean,
};

// Add multi-season support
const SUPPORTED_SEASONS = ["2024", "2025"];

interface PitcherSeasonStats {
  gamesPlayed: number | null;
  inningsPitched: number | null;
  wins: number | null;
  losses: number | null;
  era: number | null;
  whip: number | null;
  strikeouts: number | null;
  walks: number | null;
  saves: number | null;
  homeRunsAllowed?: number | null;
}

interface PitcherStats {
  seasonStats: {
    [season: string]: PitcherSeasonStats;
  };
}

interface StartingPitcherAnalysis {
  pitcherId: number;
  name: string;
  team: string;
  opponent: string;
  gameId: number;
  venue: string;
  stats: {
    seasonStats: {
      gamesPlayed: number | null;
      inningsPitched: number | null;
      wins: number | null;
      losses: number | null;
      era: number | null;
      whip: number | null;
      strikeouts: number | null;
      walks: number | null;
      saves: number | null;
      homeRunsAllowed?: number | null;
    };
    homeRunVulnerability?: {
      hrPer9: number | null;
      flyBallPct?: number | null;
      hrPerFlyBall?: number | null;
      homeRunVulnerability: number | null;
    };
  };
  projections: {
    winProbability: number | null;
    expectedStrikeouts: number | null;
    expectedInnings: number | null;
    dfsProjection: {
      expectedPoints: number | null;
      upside: number | null;
      floor: number | null;
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
  };
  draftKings: {
    draftKingsId: number | null;
    salary: number | null;
    positions: string[];
    avgPointsPerGame: number;
  };
}

/**
 * Analyze all starting pitchers for a given set of games
 */
export async function analyzeStartingPitchers(
  games: any[]
): Promise<StartingPitcherAnalysis[]> {
  const analyses: StartingPitcherAnalysis[] = [];

  for (const game of games) {
    if (!game.pitchers?.home || !game.pitchers?.away) {
      console.warn(`Missing pitcher data for game ${game.gameId}`);
      continue;
    }

    // Analyze home pitcher
    try {
      const homePitcherAnalysis = await analyzePitcher({
        pitcherId: game.pitchers.home.id,
        isHome: true,
        game,
      });
      analyses.push(homePitcherAnalysis);
    } catch (error) {
      console.error(
        `Error analyzing home pitcher for game ${game.gameId}:`,
        error
      );
    }

    // Analyze away pitcher
    try {
      const awayPitcherAnalysis = await analyzePitcher({
        pitcherId: game.pitchers.away.id,
        isHome: false,
        game,
      });
      analyses.push(awayPitcherAnalysis);
    } catch (error) {
      console.error(
        `Error analyzing away pitcher for game ${game.gameId}:`,
        error
      );
    }
  }

  return analyses;
}

/**
 * Analyze a single starting pitcher
 */
async function analyzePitcher({
  pitcherId,
  isHome,
  game,
}: {
  pitcherId: number;
  isHome: boolean;
  game: any;
}): Promise<StartingPitcherAnalysis> {
  try {
    // Get stats for both seasons
    const [stats2024, stats2025] = await Promise.all([
      getPitcherStats({ pitcherId, season: 2024 }),
      getPitcherStats({ pitcherId, season: 2025 }),
    ]);

    // Combine stats with preference for 2025 data
    const combinedStats = {
      seasonStats: {
        "2024": stats2024?.seasonStats || {},
        "2025": stats2025?.seasonStats || {},
      },
    };

    // Use 2025 stats as primary, fall back to 2024 if needed
    const seasonStats2025 = combinedStats.seasonStats["2025"];
    const seasonStats2024 = combinedStats.seasonStats["2024"];
    const primaryStats =
      typeof seasonStats2025.gamesPlayed === "number" &&
      seasonStats2025.gamesPlayed > 0
        ? seasonStats2025
        : seasonStats2024;

    // Get home run vulnerability data for both seasons
    const [hrVulnerability2024, hrVulnerability2025] = await Promise.all([
      getPitcherHomeRunVulnerability(pitcherId, 2024),
      getPitcherHomeRunVulnerability(pitcherId, 2025),
    ]);

    // Use the most recent HR vulnerability data
    const hrVulnerability = hrVulnerability2025 || hrVulnerability2024;

    // Initialize projections with placeholders
    let projections = {
      winProbability: PLACEHOLDER.NUMERIC,
      expectedStrikeouts: PLACEHOLDER.NUMERIC,
      expectedInnings: PLACEHOLDER.NUMERIC,
      dfsProjection: {
        expectedPoints: PLACEHOLDER.NUMERIC,
        upside: PLACEHOLDER.NUMERIC,
        floor: PLACEHOLDER.NUMERIC,
      },
    };

    try {
      const winProb = await calculatePitcherWinProbability(
        pitcherId,
        game.gameId.toString(),
        2025
      );
      projections.winProbability = winProb.overallWinProbability;
    } catch (error) {
      console.warn(
        `Could not calculate win probability for pitcher ${pitcherId}:`,
        error
      );
    }

    try {
      const expectedKData = await calculateExpectedStrikeouts(
        pitcherId,
        isHome ? game.awayTeam.id : game.homeTeam.id,
        game.gameId.toString()
      );
      projections.expectedStrikeouts = expectedKData.expectedStrikeouts;
    } catch (error) {
      console.warn(
        `Could not calculate expected strikeouts for pitcher ${pitcherId}:`,
        error
      );
    }

    try {
      const expectedIPData = await calculateExpectedInnings(
        pitcherId,
        game.gameId.toString(),
        2025
      );
      projections.expectedInnings = expectedIPData.expectedInnings;
    } catch (error) {
      console.warn(
        `Could not calculate expected innings for pitcher ${pitcherId}:`,
        error
      );
    }

    try {
      // Get standard DFS projection with opposing team ID
      const dfsProjData = await calculatePitcherDfsProjection(
        pitcherId,
        game.gameId.toString(),
        2025,
        isHome ? game.awayTeam.id : game.homeTeam.id
      );

      // Get control projection (hits/walks/HBP allowed)
      const controlProj = await calculateControlProjection(
        pitcherId,
        isHome
          ? game.lineups?.away?.map((b) => b) || []
          : game.lineups?.home?.map((b) => b) || []
      ).catch(() => ({
        overall: { controlRating: 50 },
      }));

      // Get rare events projection
      const rareEventsProj = await calculateRareEventPotential(
        pitcherId,
        game.gameId.toString(),
        2025
      ).catch(() => ({
        expectedRareEventPoints: 0.05,
        confidenceScore: 20,
        eventProbabilities: {
          completeGame: 1,
          qualityStart: 50,
          shutout: 0.5,
          noHitter: 0.1,
          perfectGame: 0.01,
        },
        riskRewardRating: 5,
      }));

      // Combine all projections
      const totalPoints =
        (dfsProjData.points.total || 0) +
        (controlProj.overall?.controlRating || 0) +
        (rareEventsProj.expectedRareEventPoints || 0);

      projections.dfsProjection = {
        expectedPoints: totalPoints,
        upside: totalPoints * 1.2,
        floor: totalPoints * 0.8,
      };
    } catch (error) {
      console.warn(
        `Could not calculate DFS projection for pitcher ${pitcherId}:`,
        error
      );
    }

    // Convert primaryStats to required format for StartingPitcherAnalysis
    const formattedStats = {
      gamesPlayed:
        typeof primaryStats.gamesPlayed === "number"
          ? primaryStats.gamesPlayed
          : null,
      inningsPitched:
        typeof primaryStats.inningsPitched === "number"
          ? primaryStats.inningsPitched
          : null,
      wins: typeof primaryStats.wins === "number" ? primaryStats.wins : null,
      losses:
        typeof primaryStats.losses === "number" ? primaryStats.losses : null,
      era: typeof primaryStats.era === "number" ? primaryStats.era : null,
      whip: typeof primaryStats.whip === "number" ? primaryStats.whip : null,
      strikeouts:
        typeof primaryStats.strikeouts === "number"
          ? primaryStats.strikeouts
          : null,
      walks: typeof primaryStats.walks === "number" ? primaryStats.walks : null,
      saves: typeof primaryStats.saves === "number" ? primaryStats.saves : null,
      homeRunsAllowed:
        typeof primaryStats.homeRunsAllowed === "number"
          ? primaryStats.homeRunsAllowed
          : null,
    };

    return {
      pitcherId,
      name: isHome ? game.pitchers.home.fullName : game.pitchers.away.fullName,
      team: isHome ? game.homeTeam.name : game.awayTeam.name,
      opponent: isHome ? game.awayTeam.name : game.homeTeam.name,
      gameId: game.gameId,
      venue: game.venue.name,
      stats: {
        seasonStats: formattedStats,
        homeRunVulnerability: hrVulnerability || undefined,
      },
      projections,
      environment: {
        temperature: game.environment?.temperature ?? PLACEHOLDER.NUMERIC,
        windSpeed: game.environment?.windSpeed ?? PLACEHOLDER.NUMERIC,
        windDirection: game.environment?.windDirection ?? PLACEHOLDER.TEXT,
        isOutdoor: game.environment?.isOutdoor ?? PLACEHOLDER.BOOLEAN,
      },
      ballparkFactors: {
        overall: game.ballpark?.overall ?? PLACEHOLDER.NUMERIC,
        homeRuns: game.ballpark?.types?.homeRuns ?? PLACEHOLDER.NUMERIC,
      },
      draftKings: {
        draftKingsId: null,
        salary: null,
        positions: [],
        avgPointsPerGame: 0,
      },
    };
  } catch (error) {
    console.error(`Error analyzing pitcher ${pitcherId}:`, error);
    return getDefaultPitcherAnalysis(pitcherId, isHome, game);
  }
}

// Add helper function for default analysis
const getDefaultPitcherAnalysis = (
  pitcherId: number,
  isHome: boolean,
  game: any
): StartingPitcherAnalysis => ({
  pitcherId,
  name: isHome
    ? game.pitchers?.home?.fullName || `Pitcher ${pitcherId}`
    : game.pitchers?.away?.fullName || `Pitcher ${pitcherId}`,
  team: isHome
    ? game.homeTeam?.name || "Unknown"
    : game.awayTeam?.name || "Unknown",
  opponent: isHome
    ? game.awayTeam?.name || "Unknown"
    : game.homeTeam?.name || "Unknown",
  gameId: game.gameId,
  venue: game.venue?.name || "Unknown",
  stats: {
    seasonStats: {
      gamesPlayed: PLACEHOLDER.NUMERIC,
      inningsPitched: PLACEHOLDER.NUMERIC,
      wins: PLACEHOLDER.NUMERIC,
      losses: PLACEHOLDER.NUMERIC,
      era: PLACEHOLDER.NUMERIC,
      whip: PLACEHOLDER.NUMERIC,
      strikeouts: PLACEHOLDER.NUMERIC,
      walks: PLACEHOLDER.NUMERIC,
      saves: PLACEHOLDER.NUMERIC,
      homeRunsAllowed: PLACEHOLDER.NUMERIC,
    },
  },
  projections: {
    winProbability: PLACEHOLDER.NUMERIC,
    expectedStrikeouts: PLACEHOLDER.NUMERIC,
    expectedInnings: PLACEHOLDER.NUMERIC,
    dfsProjection: {
      expectedPoints: PLACEHOLDER.NUMERIC,
      upside: PLACEHOLDER.NUMERIC,
      floor: PLACEHOLDER.NUMERIC,
    },
  },
  environment: {
    temperature: game.environment?.temperature ?? PLACEHOLDER.NUMERIC,
    windSpeed: game.environment?.windSpeed ?? PLACEHOLDER.NUMERIC,
    windDirection: game.environment?.windDirection ?? PLACEHOLDER.TEXT,
    isOutdoor: game.environment?.isOutdoor ?? PLACEHOLDER.BOOLEAN,
  },
  ballparkFactors: {
    overall: game.ballpark?.overall ?? PLACEHOLDER.NUMERIC,
    homeRuns: game.ballpark?.types?.homeRuns ?? PLACEHOLDER.NUMERIC,
  },
  draftKings: {
    draftKingsId: null,
    salary: null,
    positions: [],
    avgPointsPerGame: 0,
  },
});

/**
 * Run analysis for today's games
 */
export async function analyzeStartingPitchersForToday(
  games: any[]
): Promise<void> {
  console.log("Analyzing starting pitchers for today's games...");

  const analyses = await analyzeStartingPitchers(games);

  // Sort pitchers by expected DFS points
  const sortedPitchers = analyses.sort((a, b) => {
    const pointsA = a.projections.dfsProjection.expectedPoints ?? 0;
    const pointsB = b.projections.dfsProjection.expectedPoints ?? 0;
    return pointsB - pointsA;
  });

  // Print analysis results
  console.log("\nStarting Pitcher Rankings (by projected DFS points):\n");

  sortedPitchers.forEach((pitcher, index) => {
    console.log(
      `${index + 1}. ${pitcher.name} (${pitcher.team} vs ${pitcher.opponent})`
    );
    console.log(`   Venue: ${pitcher.venue}`);

    // Season Stats
    const ip = pitcher.stats.seasonStats.inningsPitched ?? "TBD";
    const era = pitcher.stats.seasonStats.era ?? "TBD";
    const whip = pitcher.stats.seasonStats.whip ?? "TBD";
    console.log(`   Season Stats: ${ip} IP, ${era} ERA, ${whip} WHIP`);

    // Projections
    console.log(`   Projections:`);
    const winProb =
      pitcher.projections.winProbability !== null
        ? `${(pitcher.projections.winProbability * 100).toFixed(1)}%`
        : "TBD";
    console.log(`   - Win Probability: ${winProb}`);

    const expectedK =
      pitcher.projections.expectedStrikeouts !== null
        ? pitcher.projections.expectedStrikeouts.toFixed(1)
        : "TBD";
    console.log(`   - Expected K's: ${expectedK}`);

    const expectedIP =
      pitcher.projections.expectedInnings !== null
        ? pitcher.projections.expectedInnings.toFixed(1)
        : "TBD";
    console.log(`   - Expected IP: ${expectedIP}`);

    const dfsPoints =
      pitcher.projections.dfsProjection.expectedPoints !== null
        ? pitcher.projections.dfsProjection.expectedPoints.toFixed(1)
        : "TBD";
    const dfsFloor =
      pitcher.projections.dfsProjection.floor !== null
        ? pitcher.projections.dfsProjection.floor.toFixed(1)
        : "TBD";
    const dfsUpside =
      pitcher.projections.dfsProjection.upside !== null
        ? pitcher.projections.dfsProjection.upside.toFixed(1)
        : "TBD";
    console.log(
      `   - DFS Points: ${dfsPoints} (Floor: ${dfsFloor}, Ceiling: ${dfsUpside})`
    );

    // Environment
    const temp = pitcher.environment.temperature ?? "TBD";
    const wind = pitcher.environment.windSpeed ?? "TBD";
    const windDir = pitcher.environment.windDirection ?? "TBD";
    console.log(`   Environment: ${temp}°F, ${wind}mph ${windDir}`);

    // Ballpark
    const overall = pitcher.ballparkFactors.overall ?? "TBD";
    const hr = pitcher.ballparkFactors.homeRuns ?? "TBD";
    console.log(`   Ballpark Factors: ${overall} overall, ${hr} HR\n`);
  });
}

export function sortPitchersByProjectedPoints(
  pitchers: StartingPitcherAnalysis[]
): StartingPitcherAnalysis[] {
  return [...pitchers].sort((a, b) => {
    const pointsA = a.projections.dfsProjection.expectedPoints ?? 0;
    const pointsB = b.projections.dfsProjection.expectedPoints ?? 0;
    return pointsB - pointsA;
  });
}

export function filterPitchersByWinProbability(
  pitchers: StartingPitcherAnalysis[],
  minWinProbability: number
): StartingPitcherAnalysis[] {
  return pitchers.filter(
    (pitcher) => (pitcher.projections.winProbability ?? 0) >= minWinProbability
  );
}

export function filterPitchersByExpectedStrikeouts(
  pitchers: StartingPitcherAnalysis[],
  minStrikeouts: number
): StartingPitcherAnalysis[] {
  return pitchers.filter(
    (pitcher) => (pitcher.projections.expectedStrikeouts ?? 0) >= minStrikeouts
  );
}
