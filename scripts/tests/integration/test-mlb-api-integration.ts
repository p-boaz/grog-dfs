import { makeMLBApiRequest } from "../../../lib/mlb/core/api-client";
import { calculatePitcherDfsProjection } from "../../../lib/mlb/dfs-analysis/shared/aggregate-scoring";
import { getEnhancedPitcherData } from "../../../lib/mlb/services/pitcher-data-service";

interface Game {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: string;
    detailedState: string;
  };
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
        link: string;
      };
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
        link: string;
      };
    };
  };
}

interface ScheduleResponse {
  dates: Array<{
    date: string;
    games: Game[];
  }>;
  totalGames: number;
}

async function getTodaysGames(): Promise<Game[]> {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  console.log(`Fetching MLB schedule for date: ${formattedDate}`);

  try {
    const scheduleResponse = await makeMLBApiRequest<ScheduleResponse>(
      `/schedule?sportId=1&date=${formattedDate}&hydrate=probablePitcher`
    );

    if (!scheduleResponse.dates || scheduleResponse.dates.length === 0) {
      console.log("No games found for today");
      return [];
    }

    const games = scheduleResponse.dates[0].games;
    console.log(`Found ${games.length} games for today`);

    games.forEach((game) => {
      console.log(`
Game ID: ${game.gamePk}
Status: ${game.status.detailedState}
Teams: ${game.teams.away.team.name} @ ${game.teams.home.team.name}
Probable Pitchers:
  Away: ${game.teams.away.probablePitcher?.fullName || "TBD"}
  Home: ${game.teams.home.probablePitcher?.fullName || "TBD"}
      `);
    });

    return games;
  } catch (error) {
    console.error("Error fetching today's games:", error);
    return [];
  }
}

async function testPitcherProjectionsWithRealData() {
  try {
    // Get today's games
    const games = await getTodaysGames();

    if (games.length === 0) {
      console.log("No games available for testing");
      return;
    }

    // Extract probable pitchers with team IDs
    const probablePitchers = games.flatMap((game) => {
      const pitchers = [];
      if (game.teams.away.probablePitcher) {
        pitchers.push({
          id: game.teams.away.probablePitcher.id,
          name: game.teams.away.probablePitcher.fullName,
          gameId: game.gamePk,
          team: game.teams.away.team.name,
          teamId: game.teams.away.team.id,
          opposingTeamId: game.teams.home.team.id,
          isHome: false,
        });
      }
      if (game.teams.home.probablePitcher) {
        pitchers.push({
          id: game.teams.home.probablePitcher.id,
          name: game.teams.home.probablePitcher.fullName,
          gameId: game.gamePk,
          team: game.teams.home.team.name,
          teamId: game.teams.home.team.id,
          opposingTeamId: game.teams.away.team.id,
          isHome: true,
        });
      }
      return pitchers;
    });

    console.log(`Found ${probablePitchers.length} probable pitchers`);

    // Create a map of pitcher IDs to their game and team information
    const pitcherGameMap = new Map<
      string,
      {
        gameId: string;
        teamId: number;
        opposingTeamId: number;
      }
    >(
      probablePitchers.map((pitcher) => [
        pitcher.id.toString(),
        {
          gameId: pitcher.gameId.toString(),
          teamId: pitcher.teamId,
          opposingTeamId: pitcher.opposingTeamId,
        },
      ])
    );

    // Get enhanced data for each pitcher
    const enhancedDataPromises = probablePitchers.map(async (pitcher) => {
      try {
        const enhancedData = await getEnhancedPitcherData(
          pitcher.id.toString()
        );
        return {
          pitcherId: pitcher.id.toString(),
          name: pitcher.name,
          team: pitcher.team,
          teamId: pitcher.teamId,
          opposingTeamId: pitcher.opposingTeamId,
          isHome: pitcher.isHome,
          enhancedData,
        };
      } catch (error) {
        console.error(
          `Error getting enhanced data for pitcher ${pitcher.name}:`,
          error
        );
        return null;
      }
    });

    const enhancedDataResults = await Promise.all(enhancedDataPromises);
    const validResults = enhancedDataResults.filter(
      (result) => result !== null
    );

    // Calculate projections
    const projectionPromises = validResults.map(async (result) => {
      try {
        const gameInfo = pitcherGameMap.get(result.pitcherId);
        if (!gameInfo) {
          console.error(`No game info found for pitcher ${result.name}`);
          return null;
        }

        const projection = await calculatePitcherDfsProjection(
          parseInt(result.pitcherId, 10),
          gameInfo.gameId,
          new Date().getFullYear(),
          gameInfo.opposingTeamId
        );

        return {
          name: result.name,
          team: result.team,
          isHome: result.isHome,
          value: projection.points.total,
          breakdown: projection.points.breakdown,
          confidence: projection.confidence.overall,
        };
      } catch (error) {
        console.error(
          `Error calculating projection for ${result.name}:`,
          error
        );
        return null;
      }
    });

    const projectionResults = await Promise.all(projectionPromises);
    const projections = projectionResults.filter((result) => result !== null);

    // Sort and display results
    const sortedProjections = projections.sort((a, b) => b.value - a.value);

    console.log("\nRanked Pitchers by Value:");
    sortedProjections.forEach((proj, index) => {
      console.log(
        `${index + 1}. ${proj.name} (${proj.team}) - ${proj.value.toFixed(
          1
        )} points ${proj.isHome ? "(Home)" : "(Away)"}`
      );
      console.log(`   Breakdown: ${JSON.stringify(proj.breakdown)}`);
      console.log(`   Confidence: ${proj.confidence}%`);
    });

    // Calculate average and thresholds
    const average =
      projections.reduce((sum, proj) => sum + proj.value, 0) /
      projections.length;
    console.log(`\nAverage Projection: ${average.toFixed(1)}`);
    console.log(
      `Tier 1 Threshold (>120% of avg): ${(average * 1.2).toFixed(1)}`
    );
    console.log(
      `Tier 2 Threshold (90-120% of avg): ${(average * 0.9).toFixed(1)} - ${(
        average * 1.2
      ).toFixed(1)}`
    );
    console.log(
      `Tier 3 Threshold (<90% of avg): <${(average * 0.9).toFixed(1)}`
    );
  } catch (error) {
    console.error("Error in integration test:", error);
  }
}

// Run the test
testPitcherProjectionsWithRealData();
