import { withCache, DEFAULT_CACHE_TTL, markAsApiSource } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { ProbableLineup } from "../types/game";

/**
 * Predict lineup based on historical data and team patterns
 */
async function predictLineup(
  teamId: number,
  isHome: boolean
): Promise<{
  batters: Array<{
    id: number;
    fullName: string;
    position: string;
  }>;
  confidence: number;
}> {
  try {
    // Get team's roster and recent lineups
    const teamData = await makeMLBApiRequest<any>(
      `/team/${teamId}/roster`,
      "V1"
    );

    if (!teamData?.roster || teamData.roster.length === 0) {
      return {
        batters: [],
        confidence: 0,
      };
    }

    // Filter for active players first
    const activeRoster = teamData.roster.filter(
      (player: { status?: { code: string } }) => player.status?.code === "A"
    );

    // Map players to their details and get batting orders - all async operations
    const playerPromises = activeRoster.map(
      async (player: {
        person: { id: number; fullName: string };
        position?: { abbreviation: string };
      }) => {
        const battingOrder = await getTypicalBattingOrder(player.person.id);
        return {
          id: player.person.id,
          fullName: player.person.fullName,
          position: player.position?.abbreviation || "",
          battingOrder,
        };
      }
    );

    // Wait for all batting order requests to complete
    const playersWithOrders = await Promise.all(playerPromises);

    // Now filter and sort with the resolved batting orders
    const activePlayers = playersWithOrders
      .filter((player) => player.position && player.battingOrder > 0)
      .sort((a, b) => a.battingOrder - b.battingOrder);

    // If we have no players with valid batting orders, use all players with default order
    let playersToUse = activePlayers;
    if (activePlayers.length < 9) {
      // If we have too few players with known batting order, include players without known order
      const remainingPlayers = playersWithOrders
        .filter((player) => player.position && !activePlayers.includes(player))
        .slice(0, 9 - activePlayers.length);

      playersToUse = [...activePlayers, ...remainingPlayers];
    }

    // Take top 9 players for lineup
    const predictedLineup = playersToUse.slice(0, 9).map((player) => ({
      id: player.id,
      fullName: player.fullName,
      position: player.position,
    }));

    // Calculate confidence based on data quality and how many players have known batting orders
    const confidence = Math.min(100, predictedLineup.length * 10);

    return {
      batters: predictedLineup,
      confidence,
    };
  } catch (error) {
    console.error("Error predicting lineup:", error);
    return {
      batters: [],
      confidence: 0,
    };
  }
}

/**
 * Get typical batting order position for a player based on historical data
 * Returns 0 if no data available
 */
async function getTypicalBattingOrder(playerId: number): Promise<number> {
  try {
    // Get player's recent game logs
    const gameLogs = await makeMLBApiRequest<any>(
      `/people/${playerId}/stats?stats=gameLog&group=hitting&lastNGames=30`,
      "V1"
    );

    if (!gameLogs?.stats?.[0]?.splits) {
      return 0;
    }

    // Count occurrences of each batting position
    const positionCounts: Record<number, number> = {};
    gameLogs.stats[0].splits.forEach((split: any) => {
      const position = split.battingOrder;
      if (position && position > 0) {
        positionCounts[position] = (positionCounts[position] || 0) + 1;
      }
    });

    // Find most common position
    let maxCount = 0;
    let typicalPosition = 0;
    Object.entries(positionCounts).forEach(([pos, count]) => {
      if (count > maxCount) {
        maxCount = count;
        typicalPosition = parseInt(pos);
      }
    });

    return typicalPosition;
  } catch (error) {
    console.error("Error getting typical batting order:", error);
    return 0;
  }
}

/**
 * Raw fetch function for probable lineup data
 */
async function fetchProbableLineups(params: {
  gamePk: string;
}): Promise<ProbableLineup> {
  const { gamePk } = params;

  try {
    // First try to get the actual lineup if the game has started
    const liveFeedData = await makeMLBApiRequest<any>(
      `/game/${gamePk}/feed/live`,
      "V11"
    ).catch(() => null);

    if (liveFeedData?.liveData?.boxscore?.teams) {
      const { home, away } = liveFeedData.liveData.boxscore.teams;

      // Only mark as confirmed if we have both lineups
      const isConfirmed = Boolean(
        home.batters?.length &&
          away.batters?.length &&
          home.battingOrder?.length &&
          away.battingOrder?.length
      );

      return markAsApiSource({
        away: away.battingOrder || [],
        home: home.battingOrder || [],
        awayBatters: away.batters?.map((id: number) => ({
          id,
          fullName: away.players[`ID${id}`]?.person?.fullName || "",
          position: away.players[`ID${id}`]?.position?.abbreviation || "",
        })),
        homeBatters: home.batters?.map((id: number) => ({
          id,
          fullName: home.players[`ID${id}`]?.person?.fullName || "",
          position: home.players[`ID${id}`]?.position?.abbreviation || "",
        })),
        confirmed: isConfirmed,
        sourceTimestamp: new Date(),
      });
    }

    // Get game preview data to check status and get team IDs
    const previewData = await makeMLBApiRequest<any>(
      `/game/${gamePk}/content`,
      "V1"
    ).catch(() => null);

    // Initialize probable lineup
    const probableLineup: ProbableLineup = {
      away: [],
      home: [],
      confirmed: false,
      sourceTimestamp: new Date(),
    };

    // Try to get probable lineups from preview data first
    if (previewData?.gameNotes?.probableLineups) {
      const { away, home } = previewData.gameNotes.probableLineups;
      probableLineup.awayBatters = away?.map((batter: any) => ({
        id: batter.id,
        fullName: batter.fullName,
        position: batter.position,
      }));
      probableLineup.homeBatters = home?.map((batter: any) => ({
        id: batter.id,
        fullName: batter.fullName,
        position: batter.position,
      }));
      probableLineup.away = probableLineup.awayBatters?.map((b) => b.id) || [];
      probableLineup.home = probableLineup.homeBatters?.map((b) => b.id) || [];
    }

    // If no lineups available in preview or game is scheduled, predict them
    if (
      !previewData ||
      previewData.gameData.status.statusCode === "S" || // Scheduled
      !probableLineup.awayBatters?.length ||
      !probableLineup.homeBatters?.length
    ) {
      // Get team IDs from the game data
      const gameData = await makeMLBApiRequest<any>(
        `/game/${gamePk}`,
        "V1"
      ).catch(() => null);

      if (gameData?.gameData?.teams) {
        const [awayPrediction, homePrediction] = await Promise.all([
          predictLineup(gameData.gameData.teams.away.id, false),
          predictLineup(gameData.gameData.teams.home.id, true),
        ]);

        if (awayPrediction.batters.length > 0) {
          probableLineup.awayBatters = awayPrediction.batters;
          probableLineup.away = awayPrediction.batters.map((b) => b.id);
        }

        if (homePrediction.batters.length > 0) {
          probableLineup.homeBatters = homePrediction.batters;
          probableLineup.home = homePrediction.batters.map((b) => b.id);
        }

        // Set confidence level based on predictions
        probableLineup.confidence = Math.min(
          awayPrediction.confidence,
          homePrediction.confidence
        );

        // Mark predicted lineups as unconfirmed
        probableLineup.confirmed = false;
      }
    }

    return markAsApiSource(probableLineup);
  } catch (error) {
    console.error("Error fetching lineup data:", error);
    return markAsApiSource({
      away: [],
      home: [],
      confirmed: false,
      sourceTimestamp: new Date(),
    });
  }
}

/**
 * Get probable lineups with caching (10-minute TTL)
 */
export const getProbableLineups = withCache(
  fetchProbableLineups,
  "lineups",
  DEFAULT_CACHE_TTL.lineups
);
