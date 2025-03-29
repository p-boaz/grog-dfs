import { withCache, DEFAULT_CACHE_TTL, markAsApiSource } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { 
  GameFeedResponse, 
  MLBWeatherData, 
  DetailedWeatherInfo,
  GameEnvironmentData
} from "../core/types";

/**
 * Helper function to parse wind string into components
 */
function parseWindString(windString: string): {
  speed: number;
  direction: string;
} {
  const match = windString.match(/(\d+)\s*mph,\s*(.+)/);
  if (!match) {
    return { speed: 0, direction: "Calm" };
  }
  return {
    speed: parseInt(match[1], 10),
    direction: match[2].trim(),
  };
}

/**
 * Get detailed weather information from raw weather data
 */
export function getDetailedWeatherInfo(
  weatherData: MLBWeatherData
): DetailedWeatherInfo {
  const { speed, direction } = parseWindString(weatherData.wind);
  const temperature = parseInt(weatherData.temp, 10);

  // Check if it's a dome/indoor stadium
  const isDome =
    weatherData.condition.toLowerCase().includes("dome") ||
    weatherData.condition.toLowerCase().includes("roof") ||
    weatherData.condition.toLowerCase().includes("indoor") ||
    (speed === 0 && weatherData.condition === "Unknown");

  return {
    temperature,
    condition: weatherData.condition,
    wind: {
      speed,
      direction,
      isCalm: speed === 0 || direction.toLowerCase() === "calm",
    },
    isOutdoor: !isDome,
    isPrecipitation: ["rain", "snow", "drizzle"].some((condition) =>
      weatherData.condition.toLowerCase().includes(condition)
    ),
  };
}

/**
 * Raw fetch function for game weather data
 */
async function fetchGameWeatherData(params: {
  gamePk: string;
}): Promise<MLBWeatherData | null> {
  if (!params || !params.gamePk) {
    console.error("Missing required parameter: gamePk");
    return null;
  }

  const { gamePk } = params;

  try {
    const data = await makeMLBApiRequest<GameFeedResponse>(
      `/game/${gamePk}/feed/live`,
      "V11"
    );

    const weather = data.gameData?.weather;
    if (!weather) {
      return null;
    }

    return markAsApiSource({
      condition: weather.condition || "Unknown",
      temp: weather.temp?.toString() || "0",
      wind: weather.wind || "0 mph, None",
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

/**
 * Fetch weather data for a specific game with caching
 */
export const getGameWeatherData = withCache(
  fetchGameWeatherData,
  "weather",
  DEFAULT_CACHE_TTL.weather
);

/**
 * Fetch weather and stadium information for a game
 * Raw fetch function without caching
 */
async function fetchGameEnvironmentData(params: {
  gamePk: string;
}): Promise<GameEnvironmentData | null> {
  if (!params || !params.gamePk) {
    console.error("Missing required parameter: gamePk");
    return null;
  }

  const { gamePk } = params;

  try {
    // Make a single API call instead of two separate calls
    const data = await makeMLBApiRequest<GameFeedResponse>(
      `/game/${gamePk}/feed/live`,
      "V11"
    );

    // If fetch fails or has no data, return null
    if (!data.gameData) {
      return null;
    }

    // Extract weather data directly from the game feed
    const weather = data.gameData.weather || {};
    
    // Parse weather details directly instead of making a separate API call
    const weatherDetails = {
      condition: weather.condition || "Unknown",
      temp: weather.temp?.toString() || "0",
      wind: weather.wind || "0 mph, None",
    };
    
    const detailedWeather = getDetailedWeatherInfo(weatherDetails);

    // Get venue information
    const venue = data.gameData.venue || {};

    // Determine if the venue actually has a roof
    // This handles edge cases like PNC Park being incorrectly reported as having a roof
    const knownRoofVenues = [
      5325, // Globe Life Field (Rangers)
      2889, // Chase Field (Diamondbacks)
      2392, // T-Mobile Park (Mariners)
      2287, // Minute Maid Park (Astros)
      305, // Tropicana Field (Rays)
      12, // Tropicana Field (Rays) - alternate ID
      3191, // Rogers Centre (Blue Jays)
      4169, // Miller Park/American Family Field (Brewers)
      3312, // LoanDepot Park (Marlins)
    ];
    const hasRoof =
      venue.roofType !== "Open" &&
      (venue.id ? knownRoofVenues.includes(venue.id) : false);

    // For domed venues without roofStatus, assume the roof is closed
    let roofStatus = venue.roofStatus;
    if (hasRoof && !detailedWeather.isOutdoor && !roofStatus) {
      roofStatus = "Closed";
    }

    // Combine all data into a comprehensive environment object
    return markAsApiSource({
      // Weather information
      temperature: detailedWeather.temperature,
      windSpeed: detailedWeather.wind.speed,
      windDirection: detailedWeather.wind.direction,
      precipitation: detailedWeather.isPrecipitation,
      isOutdoor: detailedWeather.isOutdoor && !hasRoof,
      humidityPercent: data.gameData.weather?.humidity,
      pressureMb: data.gameData.weather?.pressure,

      // Venue information
      venueId: venue.id,
      venueName: venue.name,
      hasRoof: hasRoof,
      roofStatus: hasRoof ? roofStatus : undefined,

      // Source metadata
      sourceTimestamp: new Date(),
    });
  } catch (error) {
    console.error("Error fetching game environment data:", error);
    return null;
  }
}

/**
 * Fetch comprehensive game environment data including weather and stadium information
 * This data is used for calculating environmental impacts on player performance
 * Uses caching with 15-minute TTL (weather data changes frequently)
 */
export const getGameEnvironmentData = withCache(
  fetchGameEnvironmentData,
  "environment",
  DEFAULT_CACHE_TTL.weather
);

/**
 * Fetch ballpark factors - raw function without caching
 * This will eventually pull data from a proper source rather than hardcoded values
 */
async function fetchBallparkFactors(params: {
  venueId: number;
  season: string;
}): Promise<any> {
  const { venueId, season } = params;

  // Database of estimated factors based on historical data
  // In a production environment, these would be calculated from actual game data
  const factors: Record<number, any> = {
    5325: {
      // Globe Life Field
      overall: 0.98,
      handedness: {
        rHB: 0.97,
        lHB: 0.99,
      },
      types: {
        singles: 1.02,
        doubles: 0.95,
        triples: 0.85,
        homeRuns: 0.92,
        runs: 0.96,
      },
    },
    15: {
      // Chase Field
      overall: 1.05,
      handedness: {
        rHB: 1.04,
        lHB: 1.06,
      },
      types: {
        singles: 1.03,
        doubles: 1.08,
        triples: 1.15,
        homeRuns: 1.02,
        runs: 1.05,
      },
    },
    12: {
      // Tropicana Field
      overall: 0.96,
      handedness: {
        rHB: 0.95,
        lHB: 0.97,
      },
      types: {
        singles: 0.99,
        doubles: 0.97,
        triples: 0.9,
        homeRuns: 0.95,
        runs: 0.96,
      },
    },
    // Add more ballparks as needed
  };

  const result = factors[venueId] || {
    overall: 1.0,
    handedness: {
      rHB: 1.0,
      lHB: 1.0,
    },
    types: {
      singles: 1.0,
      doubles: 1.0,
      triples: 1.0,
      homeRuns: 1.0,
      runs: 1.0,
    },
  };

  return markAsApiSource({
    ...result,
    sourceTimestamp: new Date(),
    venueId,
    season,
  });
}

/**
 * Fetch ballpark factors with caching (week-long TTL since these rarely change)
 */
export const getBallparkFactors = withCache(
  fetchBallparkFactors,
  "ballpark-factors",
  DEFAULT_CACHE_TTL.venue
);