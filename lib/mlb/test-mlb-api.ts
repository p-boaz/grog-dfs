/**
 * Test MLB API endpoints and data retrieval for DFS analysis
 */

import { makeMLBApiRequest } from "./core/api-client";
import { MLBScheduleResponse } from "./core/types";
import { calculatePitcherDfsProjection } from "./dfs-analysis/aggregate-scoring";
import { calculateExpectedInnings } from "./dfs-analysis/innings-pitched";
import { calculatePitcherWinProbability } from "./dfs-analysis/pitcher-win";
import { calculateExpectedStrikeouts } from "./dfs-analysis/strikeouts";
import { getGameFeed } from "./game/game-feed";
import { getPitcherStats } from "./player/pitcher-stats";
import { getTeamStats } from "./schedule/schedule";

async function testMlbApiAccess() {
  console.log("Testing MLB API Access...\n");

  try {
    // Test basic endpoint - get schedule for today
    console.log("Fetching today's MLB schedule...");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const schedule = await makeMLBApiRequest<MLBScheduleResponse>(
      `/schedule/games?sportId=1&date=${dateStr}`
    );
    console.log(
      `Schedule response received. Games today: ${
        schedule.dates?.[0]?.games?.length ?? 0
      }`
    );

    if (schedule.dates?.[0]?.games?.length > 0) {
      const firstGame = schedule.dates[0].games[0];
      const gameTime = new Date(firstGame.gameDate);
      console.log(
        `First game: ${firstGame.teams.away.team.name} @ ${firstGame.teams.home.team.name}`
      );
      console.log(`Game time: ${gameTime.toLocaleString()}`);
      console.log(`Game ID: ${firstGame.gamePk}`);

      // Save this game ID for future tests
      return {
        success: true,
        gamePk: firstGame.gamePk,
        homeTeam: firstGame.teams.home.team,
        awayTeam: firstGame.teams.away.team,
        gameDate: firstGame.gameDate,
      };
    } else {
      console.log("No games scheduled for today.");

      // Try to fetch future schedule instead
      console.log("Fetching schedule for next week...");
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const nextWeekYear = nextWeek.getFullYear();
      const nextWeekMonth = String(nextWeek.getMonth() + 1).padStart(2, "0");
      const nextWeekDay = String(nextWeek.getDate()).padStart(2, "0");
      const nextWeekStr = `${nextWeekYear}-${nextWeekMonth}-${nextWeekDay}`;

      const futureSchedule = await makeMLBApiRequest<MLBScheduleResponse>(
        `/schedule/games?sportId=1&date=${nextWeekStr}`
      );
      console.log(
        `Future schedule response received. Games found: ${
          futureSchedule.dates?.[0]?.games?.length ?? 0
        }`
      );

      if (futureSchedule.dates?.[0]?.games?.length > 0) {
        const futureGame = futureSchedule.dates[0].games[0];
        console.log(
          `Future game: ${futureGame.teams.away.team.name} @ ${futureGame.teams.home.team.name}`
        );
        console.log(`Game ID: ${futureGame.gamePk}`);

        return {
          success: true,
          gamePk: futureGame.gamePk,
          homeTeam: futureGame.teams.home.team,
          awayTeam: futureGame.teams.away.team,
          gameDate: futureGame.gameDate,
        };
      }

      return { success: false };
    }
  } catch (error) {
    console.error("Error testing MLB API access:", error);
    return { success: false };
  }
}

async function testPitcherStats(pitcherId: number, season = 2023) {
  console.log(
    `\nTesting pitcher stats API for pitcher ID ${pitcherId} (${season} season)...`
  );

  try {
    const pitcherData = await getPitcherStats({ pitcherId, season });

    console.log(`Pitcher: ${pitcherData.fullName}`);
    console.log(`Team: ${pitcherData.currentTeam}`);
    console.log("Season Stats:");
    console.log(`- Games: ${pitcherData.seasonStats.gamesPlayed}`);
    console.log(`- Innings: ${pitcherData.seasonStats.inningsPitched}`);
    console.log(`- Strikeouts: ${pitcherData.seasonStats.strikeouts}`);
    console.log(`- ERA: ${pitcherData.seasonStats.era}`);
    console.log(`- WHIP: ${pitcherData.seasonStats.whip}`);

    return {
      success: true,
      name: pitcherData.fullName,
      team: pitcherData.currentTeam,
      stats: pitcherData.seasonStats,
    };
  } catch (error) {
    console.error(`Error fetching pitcher stats for ID ${pitcherId}:`, error);
    return { success: false };
  }
}

async function testTeamStats(teamId: number, season = 2023) {
  console.log(
    `\nTesting team stats API for team ID ${teamId} (${season} season)...`
  );

  try {
    const teamData = await getTeamStats(teamId, season);

    if (!teamData) {
      console.log(`No team data found for team ${teamId}, season ${season}`);
      return { success: false };
    }

    // Get hitting and pitching stats from the TeamStats structure
    const hittingStats = teamData.hitting;
    const pitchingStats = teamData.pitching;

    console.log(`Team ID: ${teamId}`);
    console.log("Stats:");
    console.log(`- Games: ${hittingStats.gamesPlayed || 0}`);
    console.log(`- Runs: ${hittingStats.runs || 0}`);
    console.log(`- Avg: ${hittingStats.avg || ".000"}`);
    console.log(`- ERA: ${pitchingStats.era || "0.00"}`);

    return {
      success: true,
      teamId,
      hitting: hittingStats,
      pitching: pitchingStats,
    };
  } catch (error) {
    console.error(`Error fetching team stats for team ID ${teamId}:`, error);
    return { success: false };
  }
}

async function testGameFeed(gamePk: string) {
  console.log(`\nTesting game feed API for game ID ${gamePk}...`);

  try {
    const gameData = await getGameFeed({ gamePk });

    if (!gameData?.gameData) {
      console.log(`No game data found for game ${gamePk}`);
      return { success: false };
    }

    const homeTeam =
      gameData.gameData.teams?.home?.team?.name ?? "Unknown Home Team";
    const awayTeam =
      gameData.gameData.teams?.away?.team?.name ?? "Unknown Away Team";
    const venue = gameData.gameData.venue?.name ?? "Unknown Venue";
    const gameState =
      gameData.gameData.status?.detailedState ?? "Unknown Status";

    console.log(`Game: ${awayTeam} @ ${homeTeam}`);
    console.log(`Venue: ${venue}`);
    console.log(`Status: ${gameState}`);

    return {
      success: true,
      homeTeam,
      awayTeam,
      venue,
      status: gameState,
    };
  } catch (error) {
    console.error(`Error fetching game feed for game ${gamePk}:`, error);
    return { success: false };
  }
}

async function testPitcherProjection(
  pitcherId: number,
  gamePk: string,
  season = 2023
) {
  console.log(
    `\nTesting pitcher projection for ID ${pitcherId}, game ${gamePk} (${season} season)...`
  );

  try {
    // First, get basic pitcher info
    const pitcherInfo = await getPitcherStats({ pitcherId, season });
    console.log(
      `Analyzing ${pitcherInfo.fullName} (${pitcherInfo.currentTeam})`
    );

    // Test win probability
    console.log("\nCalculating win probability...");
    const winProb = await calculatePitcherWinProbability(
      pitcherId,
      gamePk,
      season
    );
    console.log(`Win probability: ${winProb.overallWinProbability}%`);
    console.log(
      `Expected DFS win points: ${winProb.expectedDfsPoints.toFixed(1)}`
    );

    // Test strikeout projection
    console.log("\nCalculating strikeout projection...");
    const kProj = await calculateExpectedStrikeouts(pitcherId, gamePk, season);
    console.log(`Expected strikeouts: ${kProj.expectedStrikeouts.toFixed(1)}`);
    console.log(
      `Strikeout range: ${kProj.strikeoutProjection.low}-${kProj.strikeoutProjection.high}`
    );
    console.log(
      `Expected DFS strikeout points: ${kProj.expectedDfsPoints.toFixed(1)}`
    );

    // Test innings projection
    console.log("\nCalculating innings projection...");
    const ipProj = await calculateExpectedInnings(pitcherId, gamePk, season);
    console.log(`Expected innings: ${ipProj.expectedInnings.toFixed(1)}`);
    console.log(
      `Innings range: ${ipProj.inningsProjection.low}-${ipProj.inningsProjection.high}`
    );
    console.log(
      `Expected DFS innings points: ${ipProj.expectedDfsPoints.toFixed(1)}`
    );

    // Full DFS projection
    console.log("\nCalculating full DFS projection...");
    const fullProj = await calculatePitcherDfsProjection(
      pitcherId,
      gamePk,
      season
    );

    console.log("\nFull DFS Projection:");
    console.log(`Total points: ${fullProj.points.total}`);
    console.log(`Range: ${fullProj.points.floor} - ${fullProj.points.upside}`);
    console.log(`Confidence: ${fullProj.confidence.overall}%`);

    console.log("\nProjected Stats:");
    console.log(`Innings: ${fullProj.stats.projectedInnings}`);
    console.log(`Strikeouts: ${fullProj.stats.projectedStrikeouts}`);
    console.log(`Win probability: ${fullProj.stats.winProbability}%`);
    console.log(`Earned runs: ${fullProj.stats.projectedEarnedRuns}`);

    console.log("\nPoints Breakdown:");
    console.log(`Innings: ${fullProj.points.breakdown.innings}`);
    console.log(`Strikeouts: ${fullProj.points.breakdown.strikeouts}`);
    console.log(`Win: ${fullProj.points.breakdown.win}`);
    console.log(`Rare events: ${fullProj.points.breakdown.rareEvents}`);
    console.log(`Negative: ${fullProj.points.breakdown.negative}`);

    return {
      success: true,
      projection: fullProj,
    };
  } catch (error) {
    console.error(
      `Error calculating projection for pitcher ${pitcherId}:`,
      error
    );
    return { success: false };
  }
}

// Run all tests
async function runMlbTests() {
  console.log("Starting MLB API and projection system tests...\n");

  try {
    // Test 1: MLB API Access
    const apiTest = await testMlbApiAccess();

    if (!apiTest.success) {
      console.error("Could not access MLB API. Aborting tests.");
      return;
    }

    // Use known player data for reliable testing
    // Gerrit Cole (543037), Zack Wheeler (592789), Blake Snell (605483)
    const testPitcher1 = 543037; // Gerrit Cole
    const testPitcher2 = 592789; // Zack Wheeler

    // Test 2: Pitcher Stats
    const pitcherTest1 = await testPitcherStats(testPitcher1);
    const pitcherTest2 = await testPitcherStats(testPitcher2);

    if (!pitcherTest1.success && !pitcherTest2.success) {
      console.error("Could not retrieve pitcher stats. Aborting tests.");
      return;
    }

    // Test 3: Team Stats using Yankees (147) and Phillies (143)
    const teamTest1 = await testTeamStats(147); // Yankees
    const teamTest2 = await testTeamStats(143); // Phillies

    // Test 4: Game Feed
    // Use the game from the API test if available, otherwise use a known valid game
    const gamePk = apiTest.gamePk?.toString() ?? "630851"; // Fallback to historical game
    const gameTest = await testGameFeed(gamePk);

    // Test 5: Pitcher Projection
    if (pitcherTest1.success && gameTest.success) {
      await testPitcherProjection(testPitcher1, gamePk);
    } else if (pitcherTest2.success && gameTest.success) {
      await testPitcherProjection(testPitcher2, gamePk);
    } else {
      console.error(
        "Could not run projection test due to missing pitcher or game data."
      );
    }

    console.log("\nAll tests completed.");
  } catch (error) {
    console.error("Error running MLB tests:", error);
  }
}

// Run the tests
runMlbTests().catch(console.error);
