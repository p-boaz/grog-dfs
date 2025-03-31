/**
 * Specialized functions for analyzing pitcher win probability and DFS win points
 */

import { makeMLBApiRequest } from "../core/api-client";
import { getGameFeed } from "../game/game-feed";
import { getGameEnvironmentData } from "../index";
import { getPitcherStats } from "../player/pitcher-stats";
import { getTeamStats } from "../schedule/schedule";

/**
 * Get pitcher's win statistics and performance metrics
 */
export async function getPitcherWinStats(
  pitcherId: number,
  season: number = new Date().getFullYear()
): Promise<{
  name?: string;
  teamName?: string;
  gamesStarted: number;
  wins: number;
  losses: number;
  winPercentage: number;
  teamWinPct: number;
  qualityStarts: number;
  qualityStartPct: number;
  era: number;
  whip: number;
  inningsPitched: number;
  avgInningsPerStart: number;
} | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({ pitcherId, season });

    // Get current team - skip team lookup if no team data
    const currentTeam = pitcherData.currentTeam;
    let teamWinPct = 0.5; // Default value if we can't get team data
    let teamId = null;

    if (currentTeam) {
      teamId = await getTeamIdByName(currentTeam);
      if (teamId) {
        try {
          const teamData = await getTeamStats(teamId, season);
          // Extract hitting stats which should contain games played
          const hittingStats = teamData.hitting || {};
          // Extract pitching stats which should contain wins and losses
          const pitchingStats = teamData.pitching || {};

          const gamesPlayed = hittingStats.gamesPlayed || 0;
          const wins = pitchingStats.wins || 0;
          const losses = pitchingStats.losses || 0;

          if (gamesPlayed > 0) {
            teamWinPct = wins / (wins + losses);
          }
        } catch (error) {
          console.warn(`Error fetching team stats for ${currentTeam}:`, error);
        }
      }
    }

    // Extract pitching stats
    const stats = pitcherData.seasonStats[season.toString()] || {
      gamesPlayed: 0,
      gamesStarted: 0,
      inningsPitched: 0,
      wins: 0,
      losses: 0,
      era: 0,
      whip: 0,
      strikeouts: 0,
      walks: 0,
      saves: 0,
      hitBatsmen: 0,
    };

    // Calculate quality starts (estimated)
    let estimatedQualityStarts = 0;
    if (stats.gamesPlayed > 0) {
      const qualityStartPct =
        stats.era < 3.75
          ? 0.6
          : stats.era < 4.5
          ? 0.45
          : stats.era < 5.25
          ? 0.3
          : 0.2;
      estimatedQualityStarts = Math.round(stats.gamesPlayed * qualityStartPct);
    }

    // Calculate average innings per start
    const avgInningsPerStart =
      stats.gamesPlayed > 0 ? stats.inningsPitched / stats.gamesPlayed : 0;

    return {
      name: pitcherData.fullName,
      gamesStarted: stats.gamesPlayed,
      wins: stats.wins,
      losses: stats.losses,
      winPercentage:
        stats.wins + stats.losses > 0
          ? stats.wins / (stats.wins + stats.losses)
          : 0,
      teamWinPct,
      teamName: currentTeam,
      qualityStarts: estimatedQualityStarts,
      qualityStartPct:
        stats.gamesPlayed > 0 ? estimatedQualityStarts / stats.gamesPlayed : 0,
      era: stats.era,
      whip: stats.whip,
      inningsPitched: stats.inningsPitched,
      avgInningsPerStart,
    };
  } catch (error) {
    console.error(`Error fetching win stats for pitcher ${pitcherId}:`, error);
    return null;
  }
}

/**
 * Helper function to get team ID by name
 */
async function getTeamIdByName(teamName: string): Promise<number | null> {
  if (!teamName) {
    console.warn("Empty team name provided to getTeamIdByName");
    return null;
  }

  // Direct mapping of team names to IDs
  const teamIds: Record<string, number> = {
    Yankees: 147,
    "Red Sox": 111,
    "Blue Jays": 141,
    Rays: 139,
    Orioles: 110,
    "White Sox": 145,
    Guardians: 114,
    Tigers: 116,
    Royals: 118,
    Twins: 142,
    Astros: 117,
    Angels: 108,
    Athletics: 133,
    Mariners: 136,
    Rangers: 140,
    Braves: 144,
    Marlins: 146,
    Mets: 121,
    Phillies: 143,
    Nationals: 120,
    Cubs: 112,
    Reds: 113,
    Brewers: 158,
    Pirates: 134,
    Cardinals: 138,
    Diamondbacks: 109,
    Rockies: 115,
    Dodgers: 119,
    Padres: 135,
    Giants: 137,
  };

  // Try to match the team name directly
  if (teamIds[teamName]) {
    return teamIds[teamName];
  }

  // Try to match partial team name
  for (const [name, id] of Object.entries(teamIds)) {
    if (teamName.includes(name)) {
      return id;
    }
  }

  console.warn(`Could not find team ID for team name: ${teamName}`);
  return null;
}

/**
 * Get offensive support metrics for a pitcher's team
 */
export async function getTeamOffensiveSupport(
  teamId: number,
  season = new Date().getFullYear()
): Promise<{
  runsPerGame: number;
  teamOPS: number;
  runSupportRating: number; // 1-10 scale where 5 is average
} | null> {
  try {
    // Try to get stats using modified approach first
    const teamData = await getSeasonTeamStats(teamId, season);

    if (!teamData || !teamData.stats.gamesPlayed) {
      return null;
    }

    const runsPerGame =
      teamData.stats.gamesPlayed > 0
        ? teamData.stats.runsScored / teamData.stats.gamesPlayed
        : 0;

    // League average runs per game is ~4.5
    const runSupportRating = Math.min(10, Math.max(1, (runsPerGame / 4.5) * 5));

    return {
      runsPerGame,
      teamOPS: teamData.stats.ops,
      runSupportRating,
    };
  } catch (error) {
    console.error(
      `Error fetching team offensive support for team ${teamId}:`,
      error
    );
    return null;
  }
}

/**
 * Get season-specific team stats, handling the unique MLB API structure
 */
async function getSeasonTeamStats(
  teamId: number,
  season: number
): Promise<any> {
  try {
    // Make direct API request
    const response = await makeMLBApiRequest<any>(
      `/teams/${teamId}/stats?season=${season}&group=hitting,pitching&sportId=1&stats=yearByYear`
    );

    // Basic response validation
    if (
      !response.stats ||
      !Array.isArray(response.stats) ||
      response.stats.length < 2
    ) {
      console.log(`Invalid stats array for team ${teamId}`);
      return null;
    }

    // When logging the response, we properly see the data structure
    console.log(`Response has stats groups: ${response.stats.length}`);

    // Check the first item in each group to determine which is hitting/pitching
    const group0Keys = Object.keys(response.stats[0]);
    const group1Keys = Object.keys(response.stats[1]);

    console.log(`Group 0 keys: ${group0Keys.join(", ")}`);
    console.log(`Group 1 keys: ${group1Keys.join(", ")}`);

    // Determine which group is hitting and which is pitching
    let hittingStatsGroup: any = null;
    let pitchingStatsGroup: any = null;

    if (
      response.stats[0].group === "hitting" ||
      (response.stats[0].splits &&
        response.stats[0].splits[0] &&
        response.stats[0].splits[0].stat &&
        response.stats[0].splits[0].stat.avg)
    ) {
      hittingStatsGroup = response.stats[0];
      pitchingStatsGroup = response.stats[1];
    } else {
      hittingStatsGroup = response.stats[1];
      pitchingStatsGroup = response.stats[0];
    }

    // Verify we have valid splits arrays
    if (
      !hittingStatsGroup.splits ||
      !Array.isArray(hittingStatsGroup.splits) ||
      !pitchingStatsGroup.splits ||
      !Array.isArray(pitchingStatsGroup.splits)
    ) {
      console.log(`Missing splits arrays for team ${teamId}`);
      return null;
    }

    // Find the current season's stats in the splits array
    const hittingSplit = hittingStatsGroup.splits.find(
      (s: any) => s.season === season.toString()
    );

    const pitchingSplit = pitchingStatsGroup.splits.find(
      (s: any) => s.season === season.toString()
    );

    if (!hittingSplit || !pitchingSplit) {
      console.log(
        `Could not find ${season} season data in splits for team ${teamId}`
      );
      return null;
    }

    // Verify we have stat objects
    if (!hittingSplit.stat || !pitchingSplit.stat) {
      console.log(`Missing stat objects for team ${teamId}, season ${season}`);
      return null;
    }

    // Log what we found to verify
    console.log(`Found team stats for ${teamId}, season ${season}:`);
    console.log(
      `- Hitting: Games=${hittingSplit.stat.gamesPlayed}, AVG=${hittingSplit.stat.avg}, OPS=${hittingSplit.stat.ops}`
    );
    console.log(
      `- Pitching: W=${pitchingSplit.stat.wins}, L=${pitchingSplit.stat.losses}, ERA=${pitchingSplit.stat.era}`
    );

    // Extract stats from the correct season
    const hittingStats = hittingSplit.stat;
    const pitchingStats = pitchingSplit.stat;

    return {
      id: teamId,
      name: hittingSplit.team?.name || "",
      season: season.toString(),
      stats: {
        gamesPlayed: hittingStats.gamesPlayed || 0,
        wins: pitchingStats.wins || 0,
        losses: pitchingStats.losses || 0,
        runsScored: hittingStats.runs || 0,
        runsAllowed: pitchingStats.runs || 0,
        avg: hittingStats.avg || 0,
        obp: hittingStats.obp || 0,
        slg: hittingStats.slg || 0,
        ops: hittingStats.ops || 0,
        era: pitchingStats.era || 0,
        whip: pitchingStats.whip || 0,
      },
    };
  } catch (error) {
    console.error(`Error in getSeasonTeamStats for team ${teamId}:`, error);
    return null;
  }
}

/**
 * Get bullpen strength metrics for a pitcher's team
 */
export async function getTeamBullpenStrength(
  teamId: number,
  season = new Date().getFullYear()
): Promise<{
  bullpenERA: number;
  bullpenWHIP: number;
  bullpenRating: number; // 1-10 scale where 5 is average
} | null> {
  try {
    // Try to get stats using modified approach first
    const teamData = await getSeasonTeamStats(teamId, season);

    if (!teamData || typeof teamData.stats.era === "undefined") {
      return null;
    }

    const bullpenERA = teamData.stats.era;
    const bullpenWHIP = teamData.stats.whip;

    // League average ERA is ~4.5
    const bullpenRating = Math.min(
      10,
      Math.max(1, (4.5 / Math.max(1, bullpenERA)) * 5)
    );

    return {
      bullpenERA,
      bullpenWHIP,
      bullpenRating,
    };
  } catch (error) {
    console.error(`Error fetching bullpen strength for team ${teamId}:`, error);
    return null;
  }
}

/**
 * Calculate win probability for a pitcher in a specific game
 */
export async function calculatePitcherWinProbability(
  pitcherId: number,
  gamePk: string,
  season: number = new Date().getFullYear()
): Promise<{
  pitcherFactors: {
    pitcherQuality: number; // 1-10 scale
    durability: number; // 1-10 scale
    recentForm: number; // 1-10 scale
  };
  teamFactors: {
    teamQuality: number; // 1-10 scale
    runSupport: number; // 1-10 scale
    bullpenStrength: number; // 1-10 scale
  };
  gameFactors: {
    opposingTeam: number; // 1-10 scale (higher means tougher opponent)
    homeAway: number; // -1 to +1 scale
    weather: number; // -1 to +1 scale
  };
  overallWinProbability: number; // 0-100%
  expectedDfsPoints: number; // Expected DFS points from a win (4 points in DK)
  confidenceScore: number; // 1-100, how confident we are in this prediction
}> {
  try {
    // Get pitcher stats
    const pitcherStats = await getPitcherWinStats(pitcherId, season);

    // Get pitcher's team ID
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    const pitcherTeam = pitcherData?.currentTeam || "";
    const teamId = pitcherTeam ? await getTeamIdByName(pitcherTeam) : null;

    // Get team-specific data if we have the team ID
    let runSupportData = null;
    let bullpenData = null;

    if (teamId) {
      [runSupportData, bullpenData] = await Promise.all([
        getTeamOffensiveSupport(teamId, season).catch(() => null),
        getTeamBullpenStrength(teamId, season).catch(() => null),
      ]);
    }

    // Get game data for home/away determination
    const gameData = await getGameFeed({ gamePk });
    const isHome = determineIfHome(gameData, pitcherTeam);
    const homeAdvantage = isHome ? 1 : -1;

    // Get weather impact
    const weatherFactor = await getWeatherImpact(gamePk);

    // Calculate pitcher quality factors
    const pitcherQuality = pitcherStats
      ? Math.min(10, Math.max(1, (4.5 / Math.max(1, pitcherStats.era)) * 5))
      : 5;

    const durability = pitcherStats
      ? Math.min(10, Math.max(1, (pitcherStats.avgInningsPerStart / 6) * 7))
      : 5;

    // Calculate team factors
    const teamQuality = pitcherStats
      ? Math.min(10, Math.max(1, pitcherStats.teamWinPct * 10))
      : 5;

    const runSupport = runSupportData ? runSupportData.runSupportRating : 5;

    const bullpenStrengthRating = bullpenData ? bullpenData.bullpenRating : 5;

    // Opposing team strength (default to average)
    const opposingTeamRating = 5;

    // Calculate base win probability
    let baseWinPct = pitcherStats ? pitcherStats.teamWinPct : 0.5;

    // Adjust for home/away
    baseWinPct += homeAdvantage * 0.08; // +/- 8% for home field advantage

    // Adjust for pitcher quality relative to team
    const pitcherWinPct = pitcherStats ? pitcherStats.winPercentage : 0.5;
    const pitcherAdjustment = (pitcherWinPct - baseWinPct) * 0.5;
    baseWinPct += pitcherAdjustment;

    // Adjust for opposing team strength
    const opposingTeamStrength = opposingTeamRating / 10;
    baseWinPct -= (opposingTeamStrength - 0.5) * 0.2;

    // Adjust for bullpen and run support
    baseWinPct += (bullpenStrengthRating / 10 - 0.5) * 0.1;
    baseWinPct += (runSupport / 10 - 0.5) * 0.15;

    // Minor weather adjustment
    baseWinPct += weatherFactor * 0.02;

    // Clamp probability between 20% and 80%
    const winProbability = Math.min(0.8, Math.max(0.2, baseWinPct));

    // Convert to percentage
    const winProbabilityPct = Math.round(winProbability * 100);

    // Calculate expected DFS points (win = 4 points in DraftKings)
    const expectedDfsPoints = winProbability * 4;

    // Calculate confidence score based on available data
    let confidenceScore = 50; // Start at midpoint

    if (pitcherStats && pitcherStats.gamesStarted > 5) {
      confidenceScore += 15; // More confident with established starters
    }

    if (isHome !== null) {
      confidenceScore += 10; // More confident with game context data
    }

    if (runSupportData && bullpenData) {
      confidenceScore += 15; // More confident with team-specific data
    }

    // Cap at 100
    confidenceScore = Math.min(100, confidenceScore);

    return {
      pitcherFactors: {
        pitcherQuality,
        durability,
        recentForm: 5, // Default value
      },
      teamFactors: {
        teamQuality,
        runSupport,
        bullpenStrength: bullpenStrengthRating,
      },
      gameFactors: {
        opposingTeam: opposingTeamRating,
        homeAway: homeAdvantage,
        weather: weatherFactor,
      },
      overallWinProbability: winProbabilityPct,
      expectedDfsPoints,
      confidenceScore,
    };
  } catch (error) {
    console.error(
      `Error calculating win probability for pitcher ${pitcherId}:`,
      error
    );

    // Return default values with low confidence
    return {
      pitcherFactors: {
        pitcherQuality: 5,
        durability: 5,
        recentForm: 5,
      },
      teamFactors: {
        teamQuality: 5,
        runSupport: 5,
        bullpenStrength: 5,
      },
      gameFactors: {
        opposingTeam: 5,
        homeAway: 0,
        weather: 0,
      },
      overallWinProbability: 50,
      expectedDfsPoints: 2,
      confidenceScore: 20,
    };
  }
}

/**
 * Helper function to determine if pitcher is home team
 */
function determineIfHome(gameData: any, pitcherTeam: string): boolean | null {
  if (
    !gameData?.gameData?.teams?.home ||
    !gameData?.gameData?.teams?.away ||
    !pitcherTeam
  ) {
    return null;
  }

  const homeTeamName = gameData.gameData.teams.home.name || "";
  return homeTeamName.includes(pitcherTeam);
}

/**
 * Helper function to get weather impact
 */
async function getWeatherImpact(gamePk: string): Promise<number> {
  try {
    const environmentData = await getGameEnvironmentData({ gamePk });

    if (!environmentData) {
      return 0;
    }

    let impact = 0;

    // Temperature impact
    if (environmentData.temperature < 45) {
      impact -= 0.5; // Cold weather generally reduces offense
    } else if (environmentData.temperature > 95) {
      impact += 0.5; // Hot weather generally increases offense
    }

    // Wind impact
    const windSpeed = environmentData.windSpeed || 0;
    const windDir = (environmentData.windDirection || "").toLowerCase();

    if (windSpeed > 10) {
      if (windDir.includes("out") || windDir.includes("to center")) {
        impact += 0.5; // Balls carrying more, worse for pitchers
      } else if (windDir.includes("in") || windDir.includes("from center")) {
        impact -= 0.5; // Balls carrying less, better for pitchers
      }
    }

    return impact;
  } catch (error) {
    return 0; // Default to no impact
  }
}
