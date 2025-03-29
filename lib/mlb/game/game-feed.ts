import { withCache, DEFAULT_CACHE_TTL, markAsApiSource } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { GameFeedResponse, GameBoxScoreResponse } from "../core/types";

/**
 * Fetch game data with different strategies for live vs historical games
 * Raw fetch function without caching
 */
async function fetchGameFeed(params: {
  gamePk: string;
}): Promise<GameFeedResponse> {
  const { gamePk } = params;

  // First try the v1.1 live feed endpoint for real-time data
  try {
    const data = await makeMLBApiRequest<GameFeedResponse>(
      `/game/${gamePk}/feed/live`,
      "V11"
    );

    return markAsApiSource({
      ...data,
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    // If live feed fails, try getting historical data via boxscore
    console.log("Live feed not available, fetching historical data...");

    try {
      const boxscoreData = await makeMLBApiRequest<GameBoxScoreResponse>(
        `/game/${gamePk}/boxscore`,
        "V1"
      );

      // Convert boxscore data to GameFeedResponse format
      return markAsApiSource({
        gamePk: parseInt(gamePk),
        gameData: {
          teams: {
            away: { name: boxscoreData.teams.away.team.name },
            home: { name: boxscoreData.teams.home.team.name },
          },
        },
        liveData: {
          boxscore: boxscoreData,
        },
        sourceTimestamp: new Date(),
      });
    } catch (innerError) {
      console.error("Error fetching boxscore data:", innerError);
      throw new Error(
        `Failed to fetch game data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

/**
 * Fetch game data with caching
 * Live games have short TTL (15 minutes), historical games longer (1 hour)
 */
export const getGameFeed = withCache(
  fetchGameFeed,
  "game-feed",
  DEFAULT_CACHE_TTL.game
);

/**
 * Fetch detailed game content (highlights, scoring plays, etc.)
 * Raw fetch function without caching
 */
async function fetchGameContent(params: {
  gamePk: string;
  hydrations?: string[];
}): Promise<any> {
  const { gamePk, hydrations = [] } = params;

  let url = `/game/${gamePk}/content`;
  
  // Add hydrations if provided
  if (hydrations.length > 0) {
    const hydrationParam = hydrations.join(",");
    url += `?hydrate=${hydrationParam}`;
  }

  const data = await makeMLBApiRequest<any>(url, "V1");
  
  return markAsApiSource({
    ...data,
    sourceTimestamp: new Date(),
  });
}

/**
 * Fetch detailed game content with caching
 */
export const getGameContent = withCache(
  fetchGameContent,
  "game-content",
  DEFAULT_CACHE_TTL.game
);

/**
 * Fetch game status updates
 */
export async function getGameStatus(gamePk: string): Promise<any> {
  const data = await makeMLBApiRequest<any>(`/game/${gamePk}/feed/live`, "V11");
  return markAsApiSource(data);
}

/**
 * Utility to refresh all game-related caches for a specific game
 * This should be called when a game's status changes or when data needs to be refreshed
 */
export async function refreshGameData(gamePk: string): Promise<boolean> {
  try {
    console.log(`Refreshing all cache data for game ${gamePk}...`);
    
    // We can't direct use invalidateGameCache due to circular references
    // So we'll do targeted invalidation by endpoint type
    
    // List of endpoint types that contain game-specific data
    const gameEndpoints = ["game", "environment", "weather", "lineup"];
    
    // Import cache functions dynamically to avoid circular dependencies
    const { invalidateCache } = await import("../cache");
    
    // Invalidate all game-related endpoint types
    for (const endpoint of gameEndpoints) {
      await invalidateCache(endpoint);
    }
    
    // Re-fetch critical game data in parallel
    await Promise.all([
      // Environment and weather data
      import("../weather/weather").then(module => 
        module.getGameEnvironmentData({ gamePk })
      ),
      
      // Game feed for latest scores/status
      getGameFeed({ gamePk }),
      
      // Latest lineups
      import("./lineups").then(module => 
        module.getProbableLineups({ gamePk })
      ),
    ]);
    
    console.log(`Successfully refreshed data for game ${gamePk}`);
    return true;
  } catch (error) {
    console.error(`Error refreshing game data for ${gamePk}:`, error);
    return false;
  }
}