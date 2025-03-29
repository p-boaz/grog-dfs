import { z } from "zod";
import {
  BatterStatcastData,
  LeaderboardResponse,
  PitcherStatcastData,
  PitchTypeData,
  PitchUsage,
  TeamStatcastData,
  MovementMetricsSchema,
  ControlMetricsSchema,
  ResultMetricsSchema,
  PitchTypeDataSchema,
  PitchUsageSchema,
} from "../types/statcast";

// Use simple import for built-in fetch

const SAVANT_API_BASE = "https://baseballsavant.mlb.com";

// CSV endpoints (these work reliably without authentication)
const SAVANT_SEARCH_CSV = "/statcast_search/csv";
const SAVANT_STATCAST_LEADERBOARD = "/leaderboard/statcast";
const SAVANT_EXPECTED_STATS = "/leaderboard/expected_statistics";

// Rate limiting configuration (more conservative - 5 requests per second)
const RATE_LIMIT = {
  requests: 5,
  interval: 1000, // 1 second
  retries: 3,
  retryDelay: 2000, // Longer delay between retries
};

// Cache configuration (in seconds)
const CACHE_TTL = {
  splits: 3600, // 1 hour
  pitching: 1800, // 30 minutes
  velocity: 1800, // 30 minutes
  batting: 1800, // 30 minutes
  team: 3600, // 1 hour
  leaderboard: 7200, // 2 hours
};

// Rate limiting state
let lastRequestTime = 0;
let requestCount = 0;

/**
 * Helper function to safely extract error message from any error type
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Helper function to check HTML responses and provide better error messages
 */
function checkHtmlResponse(responseText: string): string | null {
  if (
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.trim().startsWith("<html")
  ) {
    // Log a sample of the HTML for debugging
    console.warn(
      `Received HTML response from Baseball Savant. First 200 chars: "${responseText
        .substring(0, 200)
        .replace(/\n/g, " ")}"`
    );

    // Check if it's a login, rate limit, or maintenance page
    if (responseText.includes("login") || responseText.includes("sign in")) {
      return "Authentication required: Baseball Savant API returning login page";
    } else if (
      responseText.includes("rate limit") ||
      responseText.includes("too many requests")
    ) {
      return "Rate limited by Baseball Savant API";
    } else if (
      responseText.includes("maintenance") ||
      responseText.includes("down for")
    ) {
      return "Baseball Savant API is in maintenance mode";
    } else {
      return "Received HTML instead of JSON";
    }
  }

  return null; // Not HTML
}

async function checkRateLimit() {
  const now = Date.now();
  if (now - lastRequestTime >= RATE_LIMIT.interval) {
    // Reset if interval has passed
    requestCount = 0;
    lastRequestTime = now;
  }

  if (requestCount >= RATE_LIMIT.requests) {
    // Wait until next interval
    const waitTime = RATE_LIMIT.interval - (now - lastRequestTime);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    requestCount = 0;
    lastRequestTime = Date.now();
  }

  requestCount++;
  lastRequestTime = now;
}

// Schema for split stats response
export const SplitStatsSchema = z.object({
  pa: z.number().optional(),
  ab: z.number().optional(),
  hits: z.number().optional(),
  avg: z.number().optional(),
  slg: z.number().optional(),
  woba: z.number().optional(),
  xwoba: z.number().optional(),
  babip: z.number().optional(),
  hr: z.number().optional(),
  exit_velocity_avg: z.number().optional(),
  launch_angle_avg: z.number().optional(),
  barrel_batted_rate: z.number().optional(),
  k_percent: z.number().optional(),
  bb_percent: z.number().optional(),
});

export type SplitStats = z.infer<typeof SplitStatsSchema>;

interface SplitStatsParams {
  playerId: number;
  season?: number;
  vsLHP?: boolean;
  vsRHP?: boolean;
  minPA?: number;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
}

/**
 * Fetches split statistics from Baseball Savant CSV endpoint
 * Updated to use working CSV endpoint that doesn't require authentication
 */
export async function getSplitStats({
  playerId,
  season = new Date().getFullYear(),
  vsLHP = false,
  vsRHP = false,
  minPA = 0,
  startDate,
  endDate,
}: SplitStatsParams): Promise<SplitStats> {
  await checkRateLimit();

  // Build parameters for the CSV export endpoint
  const params = new URLSearchParams({
    player_id: playerId.toString(),
    year: season.toString(),
    player_type: "batter",
    group_by: "name",
  });

  // Add minimum plate appearances if specified
  if (minPA > 0) {
    params.append("min_pa", minPA.toString());
  }

  // Add pitcher throws filter for platoon splits
  if (vsLHP) {
    params.append("pitcher_throws", "L");
  }
  if (vsRHP) {
    params.append("pitcher_throws", "R");
  }

  // Add date range parameters if provided
  if (startDate) {
    params.append("game_date_gt", startDate);
  }
  if (endDate) {
    params.append("game_date_lt", endDate);
  }

  try {
    console.log(`[savant] Fetching split stats for player ${playerId}`);

    // Use the CSV export endpoint - this is working reliably
    const response = await fetch(
      `${SAVANT_API_BASE}${SAVANT_SEARCH_CSV}?${params}`,
      {
        headers: {
          Accept: "text/csv", // Important to request CSV format
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch split stats: ${response.status} ${response.statusText}`
      );
    }

    const csvData = await response.text();

    // Check if response is HTML (error page)
    if (csvData.includes("<!DOCTYPE html>") || csvData.includes("<html")) {
      console.error(
        `[savant] Received HTML response for player ${playerId}. This might indicate an error or rate limit.`
      );
      return getDefaultStats();
    }

    if (csvData.trim().length === 0) {
      console.warn(`[savant] Empty CSV data returned for player ${playerId}`);
      return getDefaultStats();
    }

    // Parse the CSV data
    return parseSplitStatsCsv(csvData, playerId);
  } catch (error) {
    console.error(
      `[savant] Error fetching split stats for player ${playerId}: ${getErrorMessage(
        error
      )}`
    );

    // Return default stats instead of throwing
    return getDefaultStats();
  }
}

/**
 * Parse Baseball Savant CSV response into structured split stats data
 */
function parseSplitStatsCsv(csvData: string, playerId: number): SplitStats {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      console.warn("[savant] CSV data has less than 2 lines");
      return getDefaultStats();
    }

    // Parse CSV headers
    const headers = parseCSVLine(lines[0]);

    // Find the row for the specific player if available
    let playerRow: string[] | null = null;

    // Find the player_id column index
    const playerIdIndex = headers.findIndex((h) => h === "player_id");

    // If we have a player_id column, try to find the specific player
    if (playerIdIndex >= 0) {
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[playerIdIndex] === playerId.toString()) {
          playerRow = values;
          break;
        }
      }
    }

    // If we can't find a specific player row, use the first data row
    if (!playerRow && lines.length > 1) {
      playerRow = parseCSVLine(lines[1]);
    }

    if (!playerRow) {
      console.warn(`[savant] No data found for player ${playerId}`);
      return getDefaultStats();
    }

    // Create object from headers and values
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < playerRow!.length) {
        data[header.trim()] = playerRow![index].trim();
      }
    });

    // Log available fields for debugging
    console.log(
      `[savant] Split stats available fields: ${Object.keys(data).join(", ")}`
    );

    // Convert string values to numbers handling multiple possible field names
    return {
      pa: parseInt(data.pa || data.pitches || data.total_pitches || "0") || 0,
      ab: parseInt(data.ab || data.abs || data.at_bats || "0") || 0,
      hits: parseInt(data.hits || data.h || "0") || 0,
      avg: parseFloat(data.avg || data.ba || "0") || 0,
      slg: parseFloat(data.slg || "0") || 0,
      woba: parseFloat(data.woba || "0") || 0,
      xwoba: parseFloat(data.xwoba || data.est_woba || "0") || 0,
      babip: parseFloat(data.babip || "0") || 0,
      hr: parseInt(data.hr || data.hrs || data.home_runs || "0") || 0,
      exit_velocity_avg:
        parseFloat(
          data.exit_velocity_avg ||
            data.launch_speed ||
            data.avg_hit_speed ||
            "0"
        ) || 0,
      launch_angle_avg:
        parseFloat(
          data.launch_angle_avg ||
            data.launch_angle ||
            data.avg_hit_angle ||
            "0"
        ) || 0,
      barrel_batted_rate:
        parseFloat(
          data.barrel_batted_rate ||
            data.barrels_per_bbe_percent ||
            data.brl_percent ||
            "0"
        ) || 0,
      k_percent:
        parseFloat(
          data.k_percent ||
            (data.so && data.pa
              ? ((parseInt(data.so) / parseInt(data.pa)) * 100).toString()
              : "0")
        ) || 0,
      bb_percent:
        parseFloat(
          data.bb_percent ||
            (data.bb && data.pa
              ? ((parseInt(data.bb) / parseInt(data.pa)) * 100).toString()
              : "0")
        ) || 0,
    };
  } catch (error) {
    console.error(`[savant] Error parsing split stats CSV data: ${error}`);
    return getDefaultStats();
  }
}

/**
 * Return default stats object (all zeros)
 */
function getDefaultStats(): SplitStats {
  return {
    pa: 0,
    ab: 0,
    hits: 0,
    avg: 0,
    slg: 0,
    woba: 0,
    xwoba: 0,
    babip: 0,
    hr: 0,
    exit_velocity_avg: 0,
    launch_angle_avg: 0,
    barrel_batted_rate: 0,
    k_percent: 0,
    bb_percent: 0,
  };
}

/**
 * CSV line parsing utility
 */
export function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (currentValue) {
    values.push(currentValue.trim());
  }

  return values;
}

/**
 * Fetches pitcher statistics data from Baseball Savant using CSV endpoints
 * @param params Object containing pitcherId and optional season
 */
export async function getPitcherStatcastData({
  pitcherId,
  season = new Date().getFullYear(),
}: {
  pitcherId: number;
  season?: number;
}): Promise<PitcherStatcastData> {
  await checkRateLimit();

  console.log(`[savant] Fetching pitcher data for ${pitcherId}`);

  try {
    // Get basic stats for the pitcher
    const basicData = await fetchBasicPitcherData(pitcherId, season);

    // Get pitch arsenal data for pitch mix
    const arsenalData = await fetchPitchArsenalData(pitcherId, season);
    const hasArsenalData = arsenalData.length > 0;

    // Get pitch type data for velocities
    const pitchTypesData = await fetchPitchTypes(pitcherId, season);
    const hasPitchData = pitchTypesData.length > 0;

    if (hasArsenalData) {
      console.log(`[savant] Found arsenal data for pitcher ${pitcherId}`);
      // Combine arsenal data with pitch type data for velocities
      return constructPitcherDataFromArsenal(
        arsenalData,
        basicData,
        pitcherId,
        pitchTypesData
      );
    }

    // If we have basic data but no arsenal data, parse what we have
    if (basicData) {
      return parsePitcherCsvDataExtended(basicData, pitcherId, pitchTypesData);
    }

    // If all methods failed, throw an error instead of using default data
    console.warn(`[savant] Failed to get any data for pitcher ${pitcherId}`);
    throw new Error(`Couldn't retrieve any pitcher data for ID ${pitcherId}`);
  } catch (error) {
    console.error(
      `[savant] Error fetching pitcher data for ${pitcherId}: ${getErrorMessage(
        error
      )}`
    );
    throw error;
  }
}

/**
 * Fetch pitch arsenal data from the leaderboard
 */
async function fetchPitchArsenalData(
  pitcherId: number,
  season: number
): Promise<any[]> {
  try {
    // Build URL for pitch arsenal leaderboard with CSV export - lower minimum to 25 pitches
    const url = `${SAVANT_API_BASE}/leaderboard/pitch-arsenal-stats?type=pitcher&pitchType=&min=25&year=${season}&position=undefined&team=&csv=true`;

    console.log(
      `[savant] Fetching pitch arsenal data from leaderboard for ${pitcherId}`
    );

    // Fetch the data
    const response = await fetch(url, {
      headers: {
        Accept: "text/csv",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(
        `[savant] Failed to fetch pitch arsenal data: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const csvData = await response.text();

    // Check if response is HTML or empty
    if (
      csvData.includes("<!DOCTYPE html>") ||
      csvData.includes("<html") ||
      csvData.trim().length === 0
    ) {
      console.warn(`[savant] Invalid response for pitch arsenal data`);
      return [];
    }

    // Parse the CSV
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return [];
    }

    // Parse CSV headers
    const headers = parseCSVLine(lines[0]);

    // Log headers for debugging
    console.log(`[savant] Arsenal data headers:`, headers.join(", "));

    // Filter to find rows for this pitcher
    const pitcherRows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      // Create object from headers and values
      const data: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          data[header.trim()] = values[index].trim();
        }
      });

      // Filter for the requested pitcher
      const rowPlayerId = data.player_id ? parseInt(data.player_id) : 0;
      if (rowPlayerId === pitcherId) {
        // Log each pitch type found
        console.log(`[savant] Found pitch type for ${pitcherId}:`, {
          type: data.pitch_type,
          name: data.pitch_name,
          usage: data.pitch_usage,
          pitches: data.pitches,
        });
        pitcherRows.push(data);
      }
    }

    if (pitcherRows.length === 0) {
      console.log(`[savant] No pitch types found for pitcher ${pitcherId}`);
    }

    return pitcherRows;
  } catch (error) {
    console.error(
      `[savant] Error fetching pitch arsenal data: ${getErrorMessage(error)}`
    );
    return [];
  }
}

/**
 * Fetch basic stats for a pitcher
 */
async function fetchBasicPitcherData(
  pitcherId: number,
  season: number
): Promise<string | null> {
  try {
    // Build parameters for the CSV export endpoint
    const params = new URLSearchParams({
      player_id: pitcherId.toString(),
      year: season.toString(),
      player_type: "pitcher",
      group_by: "name",
    });

    // Fetch basic pitcher data
    const response = await fetch(
      `${SAVANT_API_BASE}${SAVANT_SEARCH_CSV}?${params}`,
      {
        headers: {
          Accept: "text/csv",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `[savant] Failed to fetch basic pitcher data: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const csvData = await response.text();

    // Check if response is HTML or empty
    if (
      csvData.includes("<!DOCTYPE html>") ||
      csvData.includes("<html") ||
      csvData.trim().length === 0
    ) {
      console.warn(`[savant] Invalid response for basic pitcher data`);
      return null;
    }

    return csvData;
  } catch (error) {
    console.error(
      `[savant] Error fetching basic pitcher data: ${getErrorMessage(error)}`
    );
    return null;
  }
}

/**
 * Fetch pitch type data for a pitcher
 */
async function fetchPitchTypes(
  pitcherId: number,
  season: number
): Promise<any[]> {
  try {
    await checkRateLimit();

    // Build the search parameters for detailed pitch data
    const params = new URLSearchParams({
      player_id: pitcherId.toString(),
      year: season.toString(),
      player_type: "pitcher",
      group_by: "pitch_type",
      min_pitches: "25", // Lower minimum sample size
      details: "1",
      metrics: "release_speed,release_spin_rate,whiff_percent,put_away_percent",
      sort_col: "pitches",
      sort_order: "desc",
      csv: "true",
    });

    // Make the request to the search endpoint
    const response = await fetch(
      `${SAVANT_API_BASE}/statcast_search/csv?${params}`,
      {
        headers: {
          Accept: "text/csv",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pitch types: ${response.status} ${response.statusText}`
      );
    }

    const csvData = await response.text();

    // Check if we got HTML instead of CSV
    const htmlError = checkHtmlResponse(csvData);
    if (htmlError) {
      throw new Error(htmlError);
    }

    // Log the first few lines of the response for debugging
    console.log(`[savant] Pitch type data response (first 3 lines):`);
    const lines = csvData.trim().split("\n");
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      console.log(`  ${lines[i]}`);
    }

    // Parse the CSV data
    return parsePitchTypesCsv(csvData);
  } catch (error) {
    console.error(
      `[savant] Error fetching pitch types: ${getErrorMessage(error)}`
    );
    return [];
  }
}

/**
 * Parse pitch types CSV into pitch type data array
 */
function parsePitchTypesCsv(csvData: string): PitchTypeData[] {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return [];
    }

    // Parse CSV headers
    const headers = parseCSVLine(lines[0]);
    console.log("[savant] Pitch type CSV headers:", headers);

    // Find indices for all metrics we want to track
    const pitchTypeIdx = headers.findIndex((h) => h === "pitch_type");
    const pitchCountIdx = headers.findIndex((h) => h === "pitches");
    const pitchPercentIdx = headers.findIndex((h) => h === "pitch_percent");
    const velocityIdx = headers.findIndex(
      (h) => h === "release_speed" || h === "avg_speed" || h === "velocity"
    );
    const spinRateIdx = headers.findIndex(
      (h) => h === "release_spin_rate" || h === "avg_spin" || h === "spin_rate"
    );
    const whiffPercentIdx = headers.findIndex(
      (h) =>
        h === "whiff_percent" ||
        h === "whiff_rate" ||
        h === "swing_and_miss_percent"
    );
    const putAwayPercentIdx = headers.findIndex(
      (h) =>
        h === "put_away_percent" || h === "put_away_rate" || h === "k_percent"
    );

    // Movement metrics
    const horizontalBreakIdx = headers.findIndex(
      (h) =>
        h === "pfx_x" ||
        h === "horizontal_break" ||
        h === "break_x" ||
        h === "h_break"
    );
    const verticalBreakIdx = headers.findIndex(
      (h) =>
        h === "pfx_z" ||
        h === "vertical_break" ||
        h === "break_z" ||
        h === "v_break"
    );
    const releaseExtensionIdx = headers.findIndex(
      (h) =>
        h === "release_extension" || h === "extension" || h === "release_ext"
    );
    const releaseHeightIdx = headers.findIndex(
      (h) =>
        h === "release_pos_z" || h === "release_height" || h === "rel_height"
    );

    // Control metrics
    const zoneRateIdx = headers.findIndex(
      (h) =>
        h === "zone_rate" || h === "zone_percent" || h === "in_zone_percent"
    );
    const chaseRateIdx = headers.findIndex(
      (h) =>
        h === "chase_rate" ||
        h === "o_swing_percent" ||
        h === "outside_zone_swing_percent"
    );
    const zoneContactIdx = headers.findIndex(
      (h) =>
        h === "zone_contact_percent" ||
        h === "z_contact_percent" ||
        h === "in_zone_contact_percent"
    );
    const chaseContactIdx = headers.findIndex(
      (h) =>
        h === "chase_contact_percent" ||
        h === "o_contact_percent" ||
        h === "outside_zone_contact_percent"
    );

    // Result metrics
    const battingAvgIdx = headers.findIndex(
      (h) => h === "batting_avg" || h === "avg" || h === "ba"
    );
    const sluggingIdx = headers.findIndex(
      (h) => h === "slugging" || h === "slg" || h === "slg_percent"
    );
    const wobaIdx = headers.findIndex((h) => h === "woba");
    const xwobaIdx = headers.findIndex(
      (h) => h === "xwoba" || h === "expected_woba" || h === "est_woba"
    );
    const hardHitRateIdx = headers.findIndex(
      (h) =>
        h === "hard_hit_percent" || h === "hard_hit_rate" || h === "hard_hit"
    );

    // Parse each data row
    const pitchTypes = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      // Skip rows that don't have enough columns
      if (values.length <= Math.max(pitchTypeIdx, pitchCountIdx)) {
        continue;
      }

      // Get pitch type - required field
      const pitchType = pitchTypeIdx >= 0 ? values[pitchTypeIdx] : "";
      if (!pitchType) continue; // Skip rows without a pitch type

      // Get pitch count - required field
      const count =
        pitchCountIdx >= 0 ? parseInt(values[pitchCountIdx]) || 0 : 0;
      if (count === 0) continue; // Skip rows without any pitches

      // Get percentage and other metrics
      const percentage =
        pitchPercentIdx >= 0 ? parseFloat(values[pitchPercentIdx]) || 0 : 0;
      const velocity =
        velocityIdx >= 0 ? parseFloat(values[velocityIdx]) || 0 : 0;
      const spinRate =
        spinRateIdx >= 0 ? parseFloat(values[spinRateIdx]) || 0 : 0;
      const whiffRate =
        whiffPercentIdx >= 0 ? parseFloat(values[whiffPercentIdx]) / 100 : 0;
      const putAwayRate =
        putAwayPercentIdx >= 0
          ? parseFloat(values[putAwayPercentIdx]) / 100
          : 0;

      // Movement metrics
      const horizontalBreak =
        horizontalBreakIdx >= 0
          ? parseFloat(values[horizontalBreakIdx]) || 0
          : 0;
      const verticalBreak =
        verticalBreakIdx >= 0 ? parseFloat(values[verticalBreakIdx]) || 0 : 0;
      const releaseExtension =
        releaseExtensionIdx >= 0
          ? parseFloat(values[releaseExtensionIdx]) || 0
          : 0;
      const releaseHeight =
        releaseHeightIdx >= 0 ? parseFloat(values[releaseHeightIdx]) || 0 : 0;

      // Control metrics
      const zoneRate =
        zoneRateIdx >= 0 ? parseFloat(values[zoneRateIdx]) / 100 : 0;
      const chaseRate =
        chaseRateIdx >= 0 ? parseFloat(values[chaseRateIdx]) / 100 : 0;
      const zoneContact =
        zoneContactIdx >= 0 ? parseFloat(values[zoneContactIdx]) / 100 : 0;
      const chaseContact =
        chaseContactIdx >= 0 ? parseFloat(values[chaseContactIdx]) / 100 : 0;

      // Result metrics
      const battingAvg =
        battingAvgIdx >= 0 ? parseFloat(values[battingAvgIdx]) || 0 : 0;
      const slugging =
        sluggingIdx >= 0 ? parseFloat(values[sluggingIdx]) || 0 : 0;
      const woba = wobaIdx >= 0 ? parseFloat(values[wobaIdx]) || 0 : 0;
      const xwoba = xwobaIdx >= 0 ? parseFloat(values[xwobaIdx]) || 0 : 0;
      const hardHitRate =
        hardHitRateIdx >= 0 ? parseFloat(values[hardHitRateIdx]) / 100 : 0;

      // Log the parsed values for debugging
      console.log(`[savant] Parsed pitch type data for ${pitchType}:`, {
        count,
        percentage,
        velocity,
        spinRate,
        horizontalBreak,
        verticalBreak,
        releaseExtension,
        releaseHeight,
      });

      // Create pitch type object with all available metrics
      const pitchTypeData: PitchTypeData = {
        pitch_type: pitchType,
        count,
        percentage,
        velocity,
        spin_rate: spinRate,
        vertical_movement: verticalBreak,
        horizontal_movement: horizontalBreak,
        whiff_rate: whiffRate,
        put_away_rate: putAwayRate,
        release_extension: releaseExtension,
        release_height: releaseHeight,
        zone_rate: zoneRate,
        chase_rate: chaseRate,
        zone_contact_rate: zoneContact,
        chase_contact_rate: chaseContact,
        batting_avg_against: battingAvg,
        expected_woba: xwoba,
      };

      // Try to validate the pitch type data
      try {
        PitchTypeDataSchema.parse(pitchTypeData);
        pitchTypes.push(pitchTypeData);
      } catch (error) {
        console.warn(
          `[savant] Invalid pitch type data for ${pitchType}:`,
          error
        );
      }
    }

    return pitchTypes;
  } catch (error) {
    console.error("[savant] Error parsing pitch types CSV:", error);
    return [];
  }
}

function generatePitchMixData(pitchTypes: PitchTypeData[]): PitchUsage {
  let fastballCount = 0;
  let sliderCount = 0;
  let curveCount = 0;
  let changeupCount = 0;
  let sinkerCount = 0;
  let cutterCount = 0;
  let splitterCount = 0;
  let sweepCount = 0;
  let forkCount = 0;
  let knuckleCount = 0;
  let otherCount = 0;

  // First pass: Categorize all pitches
  pitchTypes.forEach((pitch) => {
    try {
      PitchTypeDataSchema.parse(pitch);
    } catch (error) {
      console.warn(`Invalid pitch type data:`, error);
      return; // Skip invalid pitch data
    }

    switch (pitch.pitch_type) {
      case "FF":
      case "FT":
      case "FA":
        fastballCount += pitch.count;
        break;
      case "SL":
        sliderCount += pitch.count;
        break;
      case "CU":
      case "KC":
        curveCount += pitch.count;
        break;
      case "CH":
        changeupCount += pitch.count;
        break;
      case "SI":
        sinkerCount += pitch.count;
        break;
      case "FC":
        cutterCount += pitch.count;
        break;
      case "FS":
      case "SP":
        splitterCount += pitch.count;
        break;
      case "ST":
        sweepCount += pitch.count;
        break;
      case "FO":
        forkCount += pitch.count;
        break;
      case "KN":
        knuckleCount += pitch.count;
        break;
      default:
        otherCount += pitch.count;
    }
  });

  const totalPitches = pitchTypes.reduce((sum, pitch) => sum + pitch.count, 0);

  // Calculate percentages and normalize to ensure they sum to 100%
  const rawPercentages = {
    fastball: (fastballCount / totalPitches) * 100,
    slider: (sliderCount / totalPitches) * 100,
    curve: (curveCount / totalPitches) * 100,
    changeup: (changeupCount / totalPitches) * 100,
    sinker: (sinkerCount / totalPitches) * 100,
    cutter: (cutterCount / totalPitches) * 100,
    splitter: (splitterCount / totalPitches) * 100,
    sweep: (sweepCount / totalPitches) * 100,
    fork: (forkCount / totalPitches) * 100,
    knuckle: (knuckleCount / totalPitches) * 100,
    other: (otherCount / totalPitches) * 100,
  };

  // Calculate the sum of all percentages
  const totalPercentage = Object.values(rawPercentages).reduce(
    (sum, pct) => sum + pct,
    0
  );

  // Normalize percentages to ensure they sum to 100%
  const normalizationFactor = totalPercentage > 0 ? 100 / totalPercentage : 1;
  const pitchUsage = createPitchUsage({
    fastball: rawPercentages.fastball * normalizationFactor,
    slider: rawPercentages.slider * normalizationFactor,
    curve: rawPercentages.curve * normalizationFactor,
    changeup: rawPercentages.changeup * normalizationFactor,
    sinker: rawPercentages.sinker * normalizationFactor,
    cutter: rawPercentages.cutter * normalizationFactor,
    splitter: rawPercentages.splitter * normalizationFactor,
    sweep: rawPercentages.sweep * normalizationFactor,
    fork: rawPercentages.fork * normalizationFactor,
    knuckle: rawPercentages.knuckle * normalizationFactor,
    other: rawPercentages.other * normalizationFactor,
  });

  // Validate the pitch usage data
  try {
    PitchUsageSchema.parse(pitchUsage);
  } catch (error) {
    console.warn(`Invalid pitch usage data:`, error);
    return createPitchUsage(); // Return default values if validation fails
  }

  return pitchUsage;
}

/**
 * Helper function to create a complete PitchUsage object with all required fields
 */
function createPitchUsage(values: Partial<PitchUsage> = {}): PitchUsage {
  return {
    fastball: values.fastball ?? 0,
    slider: values.slider ?? 0,
    curve: values.curve ?? 0,
    changeup: values.changeup ?? 0,
    sinker: values.sinker ?? 0,
    cutter: values.cutter ?? 0,
    splitter: values.splitter ?? 0,
    sweep: values.sweep ?? 0,
    fork: values.fork ?? 0,
    knuckle: values.knuckle ?? 0,
    other: values.other ?? 0,
  };
}

/**
 * Parse Baseball Savant CSV response into structured pitcher data
 */
function parsePitcherCsvDataExtended(
  csvData: string,
  pitcherId: number,
  pitchTypesData: any[]
): PitcherStatcastData {
  try {
    // Start with the basic data
    const basicData = parseBasicPitcherData(csvData, pitcherId);

    // If we couldn't parse basic data, throw an error
    if (!basicData) {
      throw new Error(`Couldn't parse basic pitcher data for ID ${pitcherId}`);
    }

    // Start with an empty result structure
    const result: PitcherStatcastData = {
      player_id: pitcherId,
      name: basicData.name || `Pitcher ${pitcherId}`,
      team: basicData.team || "",
      team_id: basicData.team_id || 0,
      handedness: basicData.handedness || "",
      pitch_mix: [],
      pitches: createPitchUsage(),
      velocity_trends: [],
      control_metrics: {
        zone_rate: 0,
        first_pitch_strike: 0,
        whiff_rate: 0,
        chase_rate: 0,
        csw_rate: 0,
        called_strike_rate: 0,
        edge_percent: 0,
        zone_contact_rate: 0,
        chase_contact_rate: 0,
      },
      movement_metrics: {
        horizontal_break: 0,
        induced_vertical_break: 0,
        release_extension: 0,
        release_height: 0,
      },
      result_metrics: {
        hard_hit_percent: 0,
        batting_avg_against: 0,
        slugging_against: 0,
        woba_against: 0,
        expected_woba: 0,
      },
      command_metrics: {
        edge_percent: 0,
        middle_percent: 0,
        plate_discipline: {
          o_swing_percent: 0,
          z_swing_percent: 0,
          swing_percent: 0,
          o_contact_percent: 0,
          z_contact_percent: 0,
          contact_percent: 0,
        },
      },
      season_stats: {
        games: 0,
        innings_pitched: 0,
        era: 0,
        whip: 0,
        k_rate: 0,
        bb_rate: 0,
        hr_rate: 0,
        ground_ball_rate: 0,
      },
    };

    // Update season stats if available
    if (basicData.season_stats) {
      result.season_stats = {
        ...result.season_stats,
        ...basicData.season_stats,
      };
    }

    // Update control metrics if available
    if (basicData.control_metrics) {
      result.control_metrics = {
        ...result.control_metrics,
        ...basicData.control_metrics,
      };
    }

    // Update movement metrics if available
    if (basicData.movement_metrics) {
      result.movement_metrics = {
        ...result.movement_metrics,
        ...basicData.movement_metrics,
      };
    }

    // Update result metrics if available
    if (basicData.result_metrics) {
      result.result_metrics = {
        ...result.result_metrics,
        ...basicData.result_metrics,
      };
    }

    // Process pitch types data if available
    if (pitchTypesData.length > 0) {
      // Process pitch type data
      const pitchTypes: PitchTypeData[] = [];
      let pitchUsageValues = {
        fastball: 0,
        slider: 0,
        curve: 0,
        changeup: 0,
        sinker: 0,
        cutter: 0,
        splitter: 0,
        sweep: 0,
        fork: 0,
        knuckle: 0,
        other: 0,
      };

      // Create a map to combine pitch types
      const pitchMap = new Map<
        string,
        {
          count: number;
          percentage: number;
          velocity: number;
          whiff_rate: number;
          put_away_rate: number;
        }
      >();

      // Process each pitch type
      for (const pitch of pitchTypesData) {
        const pitchType = pitch.pitch_type || "";
        const count = parseInt(pitch.pitches || "0") || 0;

        // Try to get percentage - pitch_percent is from arsenal, pitch_usage is from others
        let percentage = 0;
        if (pitch.pitch_percent) {
          percentage = parseFloat(pitch.pitch_percent);
        } else if (pitch.pitch_usage) {
          percentage = parseFloat(pitch.pitch_usage);
        }

        // Get velocity if available
        const velocity = parseFloat(pitch.velocity || "0") || 0;

        // Get whiff rate
        let whiffRate = 0;
        if (pitch.whiff_percent) {
          whiffRate = parseFloat(pitch.whiff_percent) / 100;
        } else if (pitch.whiff_rate) {
          whiffRate = parseFloat(pitch.whiff_rate) / 100;
        }

        // Get put away rate
        let putAwayRate = 0;
        if (pitch.put_away) {
          putAwayRate = parseFloat(pitch.put_away) / 100;
        } else if (pitch.k_percent) {
          putAwayRate = parseFloat(pitch.k_percent) / 100;
        }

        // Add to the map
        const existing = pitchMap.get(pitchType);
        if (existing) {
          // Update existing values
          existing.count += count;
          existing.percentage += percentage;

          // Only update velocity if we have a value
          if (velocity > 0) {
            existing.velocity = velocity;
          }

          // Only update rates if we have values
          if (whiffRate > 0) {
            existing.whiff_rate = whiffRate;
          }

          if (putAwayRate > 0) {
            existing.put_away_rate = putAwayRate;
          }
        } else {
          // Add new entry
          pitchMap.set(pitchType, {
            count,
            percentage,
            velocity,
            whiff_rate: whiffRate,
            put_away_rate: putAwayRate,
          });
        }
      }

      // Convert the map to pitch type objects
      for (const [pitchType, data] of pitchMap.entries()) {
        pitchTypes.push({
          pitch_type: pitchType,
          count: data.count,
          percentage: data.percentage,
          velocity: data.velocity,
          spin_rate: 0, // Not available
          vertical_movement: 0, // Not available
          horizontal_movement: 0, // Not available
          whiff_rate: data.whiff_rate,
          put_away_rate: data.put_away_rate,
        });

        // Update the pitch usage totals
        switch (pitchType) {
          case "FF":
          case "FA":
          case "FT":
            pitchUsageValues.fastball += data.percentage;
            break;
          case "SL":
            pitchUsageValues.slider += data.percentage;
            break;
          case "CU":
          case "KC":
            pitchUsageValues.curve += data.percentage;
            break;
          case "CH":
            pitchUsageValues.changeup += data.percentage;
            break;
          case "SI":
            pitchUsageValues.sinker += data.percentage;
            break;
          case "FC":
            pitchUsageValues.cutter += data.percentage;
            break;
          case "FS":
          case "SP":
            pitchUsageValues.splitter += data.percentage;
            break;
          case "ST":
            pitchUsageValues.sweep += data.percentage;
            break;
          case "FO":
            pitchUsageValues.fork += data.percentage;
            break;
          case "KN":
            pitchUsageValues.knuckle += data.percentage;
            break;
          default:
            pitchUsageValues.other += data.percentage;
            break;
        }
      }

      // Update the result with the pitch mix data
      result.pitch_mix = pitchTypes;
      result.pitches = createPitchUsage(pitchUsageValues);

      // Log the pitch mix for debugging
      console.log(
        `[savant] Parsed pitch mix: FB=${result.pitches.fastball.toFixed(
          1
        )}%, ` +
          `SL=${result.pitches.slider.toFixed(1)}%, ` +
          `CU=${result.pitches.curve.toFixed(1)}%, ` +
          `CH=${result.pitches.changeup.toFixed(1)}%, ` +
          `SI=${result.pitches.sinker.toFixed(1)}%, ` +
          `CT=${result.pitches.cutter.toFixed(1)}%, ` +
          `SP=${result.pitches.splitter.toFixed(1)}%, ` +
          `ST=${result.pitches.sweep.toFixed(1)}%, ` +
          `FO=${result.pitches.fork.toFixed(1)}%, ` +
          `KN=${result.pitches.knuckle.toFixed(1)}%, ` +
          `Other=${result.pitches.other.toFixed(1)}%`
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[savant] Error parsing pitcher CSV data: ${getErrorMessage(error)}`
    );
    return getDefaultPitcherData(pitcherId);
  }
}

/**
 * Return default pitcher data when real data cannot be obtained
 */
function getDefaultPitcherData(pitcherId: number): PitcherStatcastData {
  return {
    player_id: pitcherId,
    name: `Pitcher ${pitcherId}`,
    team: "",
    team_id: 0,
    handedness: "",
    pitch_mix: [],
    pitches: createPitchUsage(),
    velocity_trends: [],
    control_metrics: {
      zone_rate: 48.0,
      first_pitch_strike: 60.0,
      whiff_rate: 24.0,
      chase_rate: 28.0,
      csw_rate: 30.0,
      called_strike_rate: 17.0,
      edge_percent: 40.0,
      zone_contact_rate: 85.0,
      chase_contact_rate: 60.0,
    },
    movement_metrics: {
      horizontal_break: 0,
      induced_vertical_break: 0,
      release_extension: 6.0,
      release_height: 5.8,
    },
    result_metrics: {
      hard_hit_percent: 35.0,
      batting_avg_against: 0.25,
      slugging_against: 0.38,
      woba_against: 0.32,
      expected_woba: 0.31,
    },
    command_metrics: {
      edge_percent: 40.0,
      middle_percent: 30.0,
      plate_discipline: {
        o_swing_percent: 30.0,
        z_swing_percent: 65.0,
        swing_percent: 45.0,
        o_contact_percent: 60.0,
        z_contact_percent: 85.0,
        contact_percent: 75.0,
      },
    },
    season_stats: {
      games: 15,
      innings_pitched: 80,
      era: 4.0,
      whip: 1.3,
      k_rate: 22.0,
      bb_rate: 8.0,
      hr_rate: 1.2,
      ground_ball_rate: 45.0,
    },
  };
}

/**
 * Parse basic pitcher data from CSV
 */
function parseBasicPitcherData(
  csvData: string,
  pitcherId: number
): Partial<PitcherStatcastData> | null {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return null;
    }

    // Parse headers and find the row for this pitcher
    const headers = parseCSVLine(lines[0]);
    let pitcherRow: string[] | null = null;

    // Find player_id column index
    const playerIdIndex = headers.findIndex((h) => h === "player_id");

    if (playerIdIndex >= 0) {
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[playerIdIndex] === pitcherId.toString()) {
          pitcherRow = values;
          break;
        }
      }
    }

    // Use first data row if we couldn't find the specific player
    if (!pitcherRow && lines.length > 1) {
      pitcherRow = parseCSVLine(lines[1]);
    }

    if (!pitcherRow) {
      return null;
    }

    // Create object from headers and values
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < pitcherRow!.length) {
        data[header.trim()] = pitcherRow![index].trim();
      }
    });

    // Extract player info
    const playerName = data.player_name || data.name || `Pitcher ${pitcherId}`;
    const teamId = parseInt(data.team || data.team_id || "0") || 0;
    const teamName = data.team || "";
    const handedness = data.p_throws || "R";

    // Extract control metrics
    const zoneRate =
      parseFloat(data.zone_percent || data.zone_percentage || "48.0") || 48.0;
    const firstPitchStrike =
      parseFloat(
        data.first_pitch_strike || data.first_pitch_strike_percent || "60.0"
      ) || 60.0;
    const whiffRate =
      parseFloat(data.whiff_percent || data.whiff_rate || "24.0") || 24.0;
    const chaseRate =
      parseFloat(
        data.o_swing_percent || data.outside_zone_swing_percent || "28.0"
      ) || 28.0;
    const cswRate =
      parseFloat(data.csw_percent || data.csw_rate || "30.0") || 30.0;

    // Extract season stats
    const games = parseInt(data.g || data.games || "15") || 15;
    const inningsPitched =
      parseFloat(data.ip || data.innings_pitched || "80") || 80;
    const era = parseFloat(data.era || "4.0") || 4.0;
    const whip = parseFloat(data.whip || "1.3") || 1.3;
    const kRate =
      parseFloat(data.k_percent || data.strikeout_percent || "22.0") || 22.0;
    const bbRate =
      parseFloat(data.bb_percent || data.walk_percent || "8.0") || 8.0;
    const hrRate =
      parseFloat(data.hr_9 || data.home_runs_per_nine || "1.2") || 1.2;
    const gbRate =
      parseFloat(data.gb_percent || data.ground_ball_percent || "45.0") || 45.0;

    return {
      name: playerName,
      team: teamName,
      team_id: teamId,
      handedness: handedness,
      control_metrics: {
        zone_rate: zoneRate,
        first_pitch_strike: firstPitchStrike,
        whiff_rate: whiffRate,
        chase_rate: chaseRate,
        csw_rate: cswRate,
      },
      season_stats: {
        games: games,
        innings_pitched: inningsPitched,
        era: era,
        whip: whip,
        k_rate: kRate,
        bb_rate: bbRate,
        hr_rate: hrRate,
        ground_ball_rate: gbRate,
      },
    };
  } catch (error) {
    console.error(
      `[savant] Error parsing basic pitcher data: ${getErrorMessage(error)}`
    );
    return null;
  }
}

/**
 * Construct pitcher data from arsenal data and pitch type data
 */
function constructPitcherDataFromArsenal(
  arsenalData: any[],
  basicCsvData: string | null,
  pitcherId: number,
  pitchTypesData: any[]
): PitcherStatcastData {
  try {
    // Initialize with an empty structure
    const result: PitcherStatcastData = {
      player_id: pitcherId,
      name: `Pitcher ${pitcherId}`,
      team: "",
      team_id: 0,
      handedness: "",
      pitch_mix: [],
      pitches: createPitchUsage(),
      velocity_trends: [],
      control_metrics: {
        zone_rate: 0,
        first_pitch_strike: 0,
        whiff_rate: 0,
        chase_rate: 0,
        csw_rate: 0,
        called_strike_rate: 0,
        edge_percent: 0,
        zone_contact_rate: 0,
        chase_contact_rate: 0,
      },
      movement_metrics: {
        horizontal_break: 0,
        induced_vertical_break: 0,
        release_extension: 0,
        release_height: 0,
      },
      result_metrics: {
        hard_hit_percent: 0,
        batting_avg_against: 0,
        slugging_against: 0,
        woba_against: 0,
        expected_woba: 0,
      },
      command_metrics: {
        edge_percent: 0,
        middle_percent: 0,
        plate_discipline: {
          o_swing_percent: 0,
          z_swing_percent: 0,
          swing_percent: 0,
          o_contact_percent: 0,
          z_contact_percent: 0,
          contact_percent: 0,
        },
      },
      season_stats: {
        games: 0,
        innings_pitched: 0,
        era: 0,
        whip: 0,
        k_rate: 0,
        bb_rate: 0,
        hr_rate: 0,
        ground_ball_rate: 0,
      },
    };

    // Process basic data first if available
    if (basicCsvData) {
      const basicData = parseBasicPitcherData(basicCsvData, pitcherId);
      if (basicData) {
        // Update with basic info
        result.name = basicData.name || result.name;
        result.team = basicData.team || result.team;
        result.team_id = basicData.team_id || result.team_id;
        result.handedness = basicData.handedness || result.handedness;

        // Update season stats if available
        if (basicData.season_stats) {
          result.season_stats = {
            ...result.season_stats,
            ...basicData.season_stats,
          };
        }

        // Update and validate control metrics if available
        if (basicData.control_metrics) {
          try {
            const validatedControlMetrics = ControlMetricsSchema.parse({
              ...result.control_metrics,
              ...basicData.control_metrics,
            });
            result.control_metrics = validatedControlMetrics;
          } catch (error) {
            console.warn(`Invalid control metrics:`, error);
          }
        }

        // Update and validate movement metrics if available
        if (basicData.movement_metrics) {
          try {
            const validatedMovementMetrics = MovementMetricsSchema.parse({
              ...result.movement_metrics,
              ...basicData.movement_metrics,
            });
            result.movement_metrics = validatedMovementMetrics;
          } catch (error) {
            console.warn(`Invalid movement metrics:`, error);
          }
        }

        // Update and validate result metrics if available
        if (basicData.result_metrics) {
          try {
            const validatedResultMetrics = ResultMetricsSchema.parse({
              ...result.result_metrics,
              ...basicData.result_metrics,
            });
            result.result_metrics = validatedResultMetrics;
          } catch (error) {
            console.warn(`Invalid result metrics:`, error);
          }
        }
      }
    }

    // Get velocity data from pitch types data
    let velocityData: Record<string, number> = {};
    if (pitchTypesData.length > 0) {
      velocityData = {
        velocity: parseFloat(pitchTypesData[0].velocity) || 0,
        spin_rate: parseFloat(pitchTypesData[0].spin_rate || "0") || 0,
        horizontal_break:
          parseFloat(pitchTypesData[0].horizontal_break || "0") || 0,
        induced_vertical_break:
          parseFloat(pitchTypesData[0].induced_vertical_break || "0") || 0,
        release_extension:
          parseFloat(pitchTypesData[0].release_extension || "0") || 0,
        release_height:
          parseFloat(pitchTypesData[0].release_height || "0") || 0,
      };

      // Update movement metrics from velocity data
      result.movement_metrics = {
        horizontal_break: velocityData.horizontal_break,
        induced_vertical_break: velocityData.induced_vertical_break,
        release_extension: velocityData.release_extension,
        release_height: velocityData.release_height,
      };
    }

    // Next, process arsenal data which has the pitch mix information
    if (arsenalData.length > 0) {
      // Create a map of pitch types to their data
      const pitchTypes: PitchTypeData[] = [];
      let pitchUsageValues = {
        fastball: 0,
        slider: 0,
        curve: 0,
        changeup: 0,
        sinker: 0,
        cutter: 0,
        splitter: 0,
        sweep: 0,
        fork: 0,
        knuckle: 0,
        other: 0,
      };

      for (const pitch of arsenalData) {
        // Extract the pitch type
        const pitchType = pitch.pitch_type || "";
        const pitchName = pitch.pitch_name || "";

        // Extract usage percentage
        const usageStr = pitch.pitch_usage || "0";
        const usage = parseFloat(usageStr);

        // Extract count
        const countStr = pitch.pitches || "0";
        const count = parseInt(countStr);

        // Extract whiff rate
        const whiffStr = pitch.whiff_percent || "0";
        const whiffRate = parseFloat(whiffStr) / 100;

        // Extract put away rate (k_percent is close enough)
        const putAwayStr = pitch.put_away || pitch.k_percent || "0";
        const putAwayRate = parseFloat(putAwayStr) / 100;

        // Extract result metrics
        const hardHitStr = pitch.hard_hit_percent || "0";
        const hardHitRate = parseFloat(hardHitStr);
        const avgStr = pitch.ba || "0";
        const avg = parseFloat(avgStr);
        const slugStr = pitch.slg || "0";
        const slg = parseFloat(slugStr);
        const wobaStr = pitch.woba || "0";
        const woba = parseFloat(wobaStr);
        const xwobaStr = pitch.est_woba || "0";
        const xwoba = parseFloat(xwobaStr);

        // Create a pitch type object
        const pitchTypeObj: PitchTypeData = {
          pitch_type: pitchType,
          count: count,
          percentage: usage,
          velocity: velocityData.velocity || 0,
          spin_rate: velocityData.spin_rate || 0,
          vertical_movement: velocityData.induced_vertical_break || 0,
          horizontal_movement: velocityData.horizontal_break || 0,
          whiff_rate: whiffRate,
          put_away_rate: putAwayRate,
          release_extension: velocityData.release_extension,
          release_height: velocityData.release_height,
          zone_rate: result.control_metrics.zone_rate,
          chase_rate: result.control_metrics.chase_rate,
          zone_contact_rate: result.control_metrics.zone_contact_rate,
          chase_contact_rate: result.control_metrics.chase_contact_rate,
          batting_avg_against: avg,
          expected_woba: xwoba,
        };

        pitchTypes.push(pitchTypeObj);

        // Update result metrics with weighted values
        result.result_metrics.hard_hit_percent += hardHitRate * (usage / 100);
        result.result_metrics.batting_avg_against += avg * (usage / 100);
        result.result_metrics.slugging_against += slg * (usage / 100);
        result.result_metrics.woba_against += woba * (usage / 100);
        result.result_metrics.expected_woba += xwoba * (usage / 100);

        // Update the pitch usage totals
        switch (pitchType) {
          case "FF":
          case "FA":
          case "FT":
            pitchUsageValues.fastball += usage;
            break;
          case "SL":
            pitchUsageValues.slider += usage;
            break;
          case "CU":
          case "KC":
            pitchUsageValues.curve += usage;
            break;
          case "CH":
            pitchUsageValues.changeup += usage;
            break;
          case "SI":
            pitchUsageValues.sinker += usage;
            break;
          case "FC":
            pitchUsageValues.cutter += usage;
            break;
          case "FS":
          case "SP":
            pitchUsageValues.splitter += usage;
            break;
          case "ST":
            pitchUsageValues.sweep += usage;
            break;
          case "FO":
            pitchUsageValues.fork += usage;
            break;
          case "KN":
            pitchUsageValues.knuckle += usage;
            break;
          default:
            pitchUsageValues.other += usage;
            break;
        }
      }

      // Update the result with the pitch mix data
      result.pitch_mix = pitchTypes;
      result.pitches = createPitchUsage(pitchUsageValues);

      // Log the pitch mix for debugging
      console.log(
        `[savant] Constructed pitch mix: FB=${result.pitches.fastball.toFixed(
          1
        )}%, ` +
          `SL=${result.pitches.slider.toFixed(1)}%, ` +
          `CU=${result.pitches.curve.toFixed(1)}%, ` +
          `CH=${result.pitches.changeup.toFixed(1)}%, ` +
          `SI=${result.pitches.sinker.toFixed(1)}%, ` +
          `CT=${result.pitches.cutter.toFixed(1)}%, ` +
          `SP=${result.pitches.splitter.toFixed(1)}%, ` +
          `ST=${result.pitches.sweep.toFixed(1)}%, ` +
          `FO=${result.pitches.fork.toFixed(1)}%, ` +
          `KN=${result.pitches.knuckle.toFixed(1)}%, ` +
          `Other=${result.pitches.other.toFixed(1)}%`
      );

      if (velocityData.velocity) {
        console.log(
          `[savant] Average velocity: ${velocityData.velocity.toFixed(1)} mph`
        );
      }
    }

    return result;
  } catch (error) {
    console.error(
      `[savant] Error constructing pitcher data: ${getErrorMessage(error)}`
    );
    return getDefaultPitcherData(pitcherId);
  }
}

/**
 * Batter data fetching function from Baseball Savant
 * @throws Error if data cannot be fetched
 */
export async function getBatterStatcastData({
  batterId,
  season = new Date().getFullYear(),
}: {
  batterId: number;
  season?: number;
}): Promise<BatterStatcastData> {
  await checkRateLimit();

  console.log(`[savant] Fetching batter data for ${batterId}`);

  try {
    // Build parameters for the basic CSV export endpoint
    const basicParams = new URLSearchParams({
      player_id: batterId.toString(),
      year: season.toString(),
      player_type: "batter",
      group_by: "name",
    });

    // Fetch basic batter data
    const basicResponse = await fetch(
      `${SAVANT_API_BASE}${SAVANT_SEARCH_CSV}?${basicParams}`,
      {
        headers: {
          Accept: "text/csv",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    if (!basicResponse.ok) {
      throw new Error(
        `Failed to fetch basic batter data: ${basicResponse.status} ${basicResponse.statusText}`
      );
    }

    const basicCsvData = await basicResponse.text();

    // Check if response is HTML or empty
    if (
      basicCsvData.includes("<!DOCTYPE html>") ||
      basicCsvData.includes("<html") ||
      basicCsvData.trim().length === 0
    ) {
      throw new Error(
        `Invalid response for basic batter data for ID ${batterId}`
      );
    }

    // Try fetching from leaderboard endpoint first
    const leaderboardParams = new URLSearchParams({
      player_type: "batter",
      year: season.toString(),
      min_pa: "0",
      position: "all",
      sort_col: "player_id",
      sort_order: "desc",
      min_results: "0",
      metrics:
        "anglesweetspotpercent,ev95percent,avg_hit_speed,xwoba,barrel_batted_rate",
      csv: "true",
      player_id: batterId.toString(),
    });

    const leaderboardResponse = await fetch(
      `${SAVANT_API_BASE}${SAVANT_STATCAST_LEADERBOARD}?${leaderboardParams}`,
      {
        headers: {
          Accept: "text/csv",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    let leaderboardData = null;
    if (leaderboardResponse.ok) {
      const leaderboardCsvData = await leaderboardResponse.text();
      leaderboardData = parseLeaderboardCsvData(leaderboardCsvData, batterId);
    }

    // If leaderboard data is not available, try search endpoint with quality of contact data
    if (!leaderboardData) {
      console.log(`[savant] Trying search endpoint for batter ${batterId}`);
      const searchParams = new URLSearchParams({
        player_id: batterId.toString(),
        year: season.toString(),
        player_type: "batter",
        group_by: "player_id",
        min_results: "0",
        details: "quality_of_contact",
        csv: "true",
      });

      const searchResponse = await fetch(
        `${SAVANT_API_BASE}${SAVANT_SEARCH_CSV}?${searchParams}`,
        {
          headers: {
            Accept: "text/csv",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          },
        }
      );

      if (searchResponse.ok) {
        const searchCsvData = await searchResponse.text();
        leaderboardData = parseSearchCsvData(searchCsvData, batterId);
      }
    }

    // If still no data, try expected stats endpoint as a last resort
    if (!leaderboardData) {
      console.log(
        `[savant] Trying expected stats endpoint for batter ${batterId}`
      );
      const expectedStatsParams = new URLSearchParams({
        player_type: "batter",
        year: season.toString(),
        min_pa: "0",
        position: "all",
        csv: "true",
        player_id: batterId.toString(),
      });

      const expectedStatsResponse = await fetch(
        `${SAVANT_API_BASE}${SAVANT_EXPECTED_STATS}?${expectedStatsParams}`,
        {
          headers: {
            Accept: "text/csv",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          },
        }
      );

      if (expectedStatsResponse.ok) {
        const expectedStatsCsvData = await expectedStatsResponse.text();
        leaderboardData = parseExpectedStatsCsvData(
          expectedStatsCsvData,
          batterId
        );
      }
    }

    // Parse basic CSV response
    const batterData = parseBatterCsvData(basicCsvData, batterId);

    // Merge the data if available
    if (leaderboardData) {
      batterData.batting_metrics = {
        ...batterData.batting_metrics,
        sweet_spot_percent: leaderboardData.sweet_spot_percent || 0,
        hard_hit_percent: leaderboardData.hard_hit_percent || 0,
      };
    }

    // Check if we have sufficient data
    if (
      !batterData ||
      !batterData.name ||
      batterData.name === `Batter ${batterId}`
    ) {
      throw new Error(`Insufficient data found for batter ID ${batterId}`);
    }

    return batterData;
  } catch (error) {
    console.error(
      `[savant] Error fetching batter data for ${batterId}: ${getErrorMessage(
        error
      )}`
    );
    throw error;
  }
}

/**
 * Parse Baseball Savant expected stats CSV response for additional metrics
 */
function parseExpectedStatsCsvData(
  csvData: string,
  batterId: number
): Partial<BatterStatcastData["batting_metrics"]> | null {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return null;
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log("[savant] Expected stats CSV headers:", headers);

    // Find the row for this batter
    let batterRow: string[] | null = null;
    const playerIdIndex = headers.findIndex((h) => h === "player_id");

    if (playerIdIndex >= 0) {
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[playerIdIndex] === batterId.toString()) {
          batterRow = values;
          // Create object from headers and values for debugging
          const debugData: Record<string, string> = {};
          headers.forEach((header, index) => {
            if (index < values.length) {
              debugData[header.trim()] = values[index].trim();
            }
          });
          console.log(
            `[savant] Found expected stats data for batter ${batterId}:`,
            debugData
          );
          break;
        }
      }
    }

    if (!batterRow) {
      console.log(
        `[savant] No expected stats data found for batter ${batterId}`
      );
      return null;
    }

    // Create object from headers and values
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < batterRow!.length) {
        data[header.trim()] = batterRow![index].trim();
      }
    });

    // Extract additional metrics using the correct field names
    const sweetSpotPercent = parseFloat(
      data.anglesweetspotpercent ||
        data.sweet_spot_percent ||
        data.sweet_spot_rate ||
        data.sweet_spot ||
        "0"
    );
    const hardHitPercent = parseFloat(
      data.ev95percent ||
        data.hard_hit_percent ||
        data.hard_hit_rate ||
        data.hard_hit ||
        "0"
    );

    console.log(
      `[savant] Extracted metrics from expected stats for batter ${batterId}:`,
      {
        sweetSpotPercent,
        hardHitPercent,
      }
    );

    return {
      sweet_spot_percent: sweetSpotPercent,
      hard_hit_percent: hardHitPercent,
    };
  } catch (error) {
    console.error(`[savant] Error parsing expected stats CSV data: ${error}`);
    return null;
  }
}

/**
 * Parse Baseball Savant CSV response into structured batter data
 */
function parseBatterCsvData(
  csvData: string,
  batterId: number
): BatterStatcastData {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV data has less than 2 lines");
    }

    // Parse CSV headers
    const headers = parseCSVLine(lines[0]);

    // Find the row for the specific batter if available
    let batterRow: string[] | null = null;

    // Find the player_id column index
    const playerIdIndex = headers.findIndex((h) => h === "player_id");

    // If we have a player_id column, try to find the specific batter
    if (playerIdIndex >= 0) {
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[playerIdIndex] === batterId.toString()) {
          batterRow = values;
          break;
        }
      }
    }

    // If we can't find a specific batter row, use the first data row
    if (!batterRow && lines.length > 1) {
      batterRow = parseCSVLine(lines[1]);
    }

    if (!batterRow) {
      throw new Error(`No data found for batter ${batterId}`);
    }

    // Create object from headers and values
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < batterRow!.length) {
        data[header.trim()] = batterRow![index].trim();
      }
    });

    // Extract player info
    const playerName = data.player_name || data.name || `Batter ${batterId}`;
    const teamId = parseInt(data.team || data.team_id || "0") || 0;
    const teamName = data.team || "";
    const handedness = data.stand || data.b_stands || "R";

    // Extract batting metrics with more variations of field names
    const avg = parseFloat(data.ba || data.avg || "0") || 0;
    const obp = parseFloat(data.obp || "0") || 0;
    const slg = parseFloat(data.slg || "0") || 0;
    const ops = parseFloat(data.ops || (obp + slg).toString() || "0") || 0;
    const woba = parseFloat(data.woba || "0") || 0;
    const xwoba = parseFloat(data.xwoba || data.expected_woba || "0") || 0;
    const exitVelocityAvg =
      parseFloat(
        data.exit_velocity_avg || data.launch_speed || data.avg_hit_speed || "0"
      ) || 0;

    // Enhanced extraction of quality of contact metrics
    const sweetSpotPercent =
      parseFloat(
        data.sweet_spot_percent ||
          data.sweet_spot_rate ||
          data.sweet_spot ||
          "0"
      ) || 0;

    const barrelPercent =
      parseFloat(
        data.barrel_percent ||
          data.barrel_batted_rate ||
          data.brl_percent ||
          data.barrels_per_bbe_percent ||
          "0"
      ) || 0;

    const hardHitPercent =
      parseFloat(
        data.hard_hit_percent || data.hard_hit_rate || data.hard_hit || "0"
      ) || 0;

    const kPercent =
      parseFloat(
        data.k_percent ||
          data.strikeout_percent ||
          (data.so && data.pa
            ? ((parseInt(data.so) / parseInt(data.pa)) * 100).toString()
            : "0")
      ) || 0;
    const bbPercent =
      parseFloat(
        data.bb_percent ||
          data.walk_percent ||
          (data.bb && data.pa
            ? ((parseInt(data.bb) / parseInt(data.pa)) * 100).toString()
            : "0")
      ) || 0;

    // Form the basic return structure with the data we have
    return {
      player_id: batterId,
      name: playerName,
      team: teamName,
      team_id: teamId,
      handedness: handedness,
      batting_metrics: {
        avg,
        obp,
        slg,
        ops,
        woba,
        xwoba,
        exit_velocity_avg: exitVelocityAvg,
        sweet_spot_percent: sweetSpotPercent,
        barrel_percent: barrelPercent,
        hard_hit_percent: hardHitPercent,
        k_percent: kPercent,
        bb_percent: bbPercent,
      },
      platoon_splits: {
        vs_left: {
          avg: 0,
          obp: 0,
          slg: 0,
          ops: 0,
          woba: 0,
        },
        vs_right: {
          avg: 0,
          obp: 0,
          slg: 0,
          ops: 0,
          woba: 0,
        },
      },
      pitch_type_performance: {
        vs_fastball: 0,
        vs_breaking: 0,
        vs_offspeed: 0,
      },
      season_stats: {
        games: parseInt(data.g || data.games || "0") || 0,
        plate_appearances: parseInt(data.pa || "0") || 0,
        at_bats: parseInt(data.ab || data.at_bats || "0") || 0,
        hits: parseInt(data.h || data.hits || "0") || 0,
        home_runs: parseInt(data.hr || data.home_runs || "0") || 0,
        rbis: parseInt(data.rbi || data.rbis || "0") || 0,
        stolen_bases: parseInt(data.sb || data.stolen_bases || "0") || 0,
        avg,
        obp,
        slg,
        ops,
      },
    };
  } catch (error) {
    console.error(`[savant] Error parsing batter CSV data: ${error}`);
    throw error;
  }
}

/**
 * Parse Baseball Savant leaderboard CSV response for additional metrics
 */
function parseLeaderboardCsvData(
  csvData: string,
  batterId: number
): Partial<BatterStatcastData["batting_metrics"]> | null {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return null;
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log("[savant] Leaderboard CSV headers:", headers);

    // Find the row for this batter
    let batterRow: string[] | null = null;
    const playerIdIndex = headers.findIndex((h) => h === "player_id");

    if (playerIdIndex >= 0) {
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[playerIdIndex] === batterId.toString()) {
          batterRow = values;
          // Create object from headers and values for debugging
          const debugData: Record<string, string> = {};
          headers.forEach((header, index) => {
            if (index < values.length) {
              debugData[header.trim()] = values[index].trim();
            }
          });
          console.log(
            `[savant] Found leaderboard data for batter ${batterId}:`,
            debugData
          );
          break;
        }
      }
    }

    if (!batterRow) {
      console.log(`[savant] No leaderboard data found for batter ${batterId}`);
      return null;
    }

    // Create object from headers and values
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < batterRow!.length) {
        data[header.trim()] = batterRow![index].trim();
      }
    });

    // Extract additional metrics using the correct field names
    const sweetSpotPercent = parseFloat(
      data.anglesweetspotpercent ||
        data.sweet_spot_percent ||
        data.sweet_spot_rate ||
        data.sweet_spot ||
        "0"
    );
    const hardHitPercent = parseFloat(
      data.ev95percent ||
        data.hard_hit_percent ||
        data.hard_hit_rate ||
        data.hard_hit ||
        "0"
    );

    console.log(`[savant] Extracted metrics for batter ${batterId}:`, {
      sweetSpotPercent,
      hardHitPercent,
    });

    return {
      sweet_spot_percent: sweetSpotPercent,
      hard_hit_percent: hardHitPercent,
    };
  } catch (error) {
    console.error(`[savant] Error parsing leaderboard CSV data: ${error}`);
    return null;
  }
}

/**
 * Team data fetching function from Baseball Savant
 * @throws Error if data cannot be fetched
 */
export async function getTeamStatcastData({
  teamId,
  season = new Date().getFullYear(),
}: {
  teamId: number;
  season?: number;
}): Promise<TeamStatcastData> {
  await checkRateLimit();

  console.log(`[savant] Fetching team data for team ID ${teamId}`);

  try {
    // We would normally fetch team data here from the Baseball Savant API
    // Since there's not a direct CSV endpoint for this, we'll need to use
    // the MLB Stats API or similar to get real team data

    throw new Error(`Team data fetching not implemented for team ID ${teamId}`);

    // This function should be implemented with proper API calls to
    // retrieve real team data rather than using default values
  } catch (error) {
    console.error(
      `[savant] Error fetching team data for team ID ${teamId}: ${getErrorMessage(
        error
      )}`
    );
    throw error;
  }
}

/**
 * Leaderboard fetching function from Baseball Savant
 * @throws Error if data cannot be fetched
 */
export async function getLeaderboard({
  metric = "xwoba",
  playerType = "batter",
  season = new Date().getFullYear(),
}: {
  metric?: string;
  playerType?: "pitcher" | "batter";
  season?: number;
}): Promise<LeaderboardResponse> {
  await checkRateLimit();

  console.log(`[savant] Fetching ${playerType} leaderboard for ${metric}`);

  try {
    // Build URL for leaderboard CSV
    const url = `${SAVANT_API_BASE}${SAVANT_STATCAST_LEADERBOARD}?player_type=${playerType}&year=${season}&abs=100&csv=true`;

    const response = await fetch(url, {
      headers: {
        Accept: "text/csv",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch leaderboard: ${response.status} ${response.statusText}`
      );
    }

    const csvData = await response.text();

    // Check if response is HTML or empty
    if (
      csvData.includes("<!DOCTYPE html>") ||
      csvData.includes("<html") ||
      csvData.trim().length === 0
    ) {
      throw new Error(`Invalid response for leaderboard data`);
    }

    // Parse the CSV into a leaderboard
    const leaderboard = parseLeaderboardCsv(csvData, metric);

    return {
      leaderboard,
      metric,
      season: season.toString(),
      player_type: playerType,
    };
  } catch (error) {
    console.error(
      `[savant] Error fetching leaderboard data: ${getErrorMessage(error)}`
    );
    throw error;
  }
}

/**
 * Parse leaderboard CSV data
 */
function parseLeaderboardCsv(
  csvData: string,
  targetMetric: string
): Array<{
  player_id: number;
  name: string;
  team: string;
  value: number;
}> {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return [];
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);

    // Find the column indexes for player_id, name, team and the target metric
    const playerIdIdx = headers.findIndex((h) => h === "player_id");
    const nameIdx = headers.findIndex(
      (h) =>
        h === "player_name" ||
        h === "first_name" ||
        h === "last_name, first_name" ||
        h === "name"
    );
    const teamIdx = headers.findIndex((h) => h === "team" || h === "team_name");

    // Try to find the metric column (might be named differently than the target)
    let metricIdx = headers.findIndex(
      (h) => h.toLowerCase() === targetMetric.toLowerCase()
    );
    if (metricIdx === -1) {
      // Try alternative names for common metrics
      if (targetMetric === "xwoba") {
        metricIdx = headers.findIndex(
          (h) =>
            h === "estimated_woba" ||
            h === "expected_woba" ||
            h === "xwoba_value"
        );
      } else if (targetMetric === "barrel") {
        metricIdx = headers.findIndex(
          (h) =>
            h === "barrel_batted_rate" ||
            h === "barrel_percent" ||
            h === "barrels_per_pa"
        );
      }
    }

    // If we can't find the necessary columns, return empty array
    if (playerIdIdx === -1 || nameIdx === -1 || metricIdx === -1) {
      console.warn(
        `[savant] Could not find required columns in leaderboard CSV`
      );
      return [];
    }

    // Parse data rows
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length <= Math.max(playerIdIdx, nameIdx, teamIdx, metricIdx)) {
        continue; // Skip rows that don't have enough columns
      }

      const playerId = parseInt(values[playerIdIdx]) || 0;
      if (playerId === 0) continue; // Skip rows without a valid player ID

      const name = values[nameIdx];
      const team = teamIdx >= 0 ? values[teamIdx] : "";
      const valueStr = values[metricIdx];
      const value = parseFloat(valueStr) || 0;

      result.push({
        player_id: playerId,
        name,
        team,
        value,
      });
    }

    // Sort by the metric value (descending)
    return result.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error(`[savant] Error parsing leaderboard CSV: ${error}`);
    return [];
  }
}

/**
 * Parse Baseball Savant search CSV response for quality of contact data
 */
function parseSearchCsvData(
  csvData: string,
  batterId: number
): Partial<BatterStatcastData["batting_metrics"]> | null {
  try {
    // Split CSV into lines
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return null;
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log("[savant] Search CSV headers:", headers);

    // Find indices for quality of contact metrics
    const sweetSpotIdx = headers.findIndex(
      (h) =>
        h === "sweet_spot_percent" ||
        h === "launch_angle_sweet_spot_percent" ||
        h === "sweet_spot"
    );
    const hardHitIdx = headers.findIndex(
      (h) =>
        h === "hardhit_percent" ||
        h === "hard_hit_percent" ||
        h === "hard_hit" ||
        h === "exit_velocity_95_plus_percent"
    );
    const launchAngleIdx = headers.findIndex(
      (h) => h === "launch_angle" || h === "avg_hit_angle"
    );

    // Find the row for this batter
    let batterRow: string[] | null = null;
    const playerIdIndex = headers.findIndex((h) => h === "player_id");

    if (playerIdIndex >= 0) {
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[playerIdIndex] === batterId.toString()) {
          batterRow = values;
          break;
        }
      }
    }

    if (!batterRow) {
      console.log(`[savant] No search data found for batter ${batterId}`);
      return null;
    }

    // Create object from headers and values
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < batterRow!.length) {
        data[header.trim()] = batterRow![index].trim();
      }
    });

    // Extract metrics
    let sweetSpotPercent =
      sweetSpotIdx >= 0 ? parseFloat(data[headers[sweetSpotIdx]]) || 0 : 0;
    const hardHitPercent =
      hardHitIdx >= 0 ? parseFloat(data[headers[hardHitIdx]]) || 0 : 0;

    // If sweet spot percent is not available directly, try to calculate it from launch angle
    if (sweetSpotPercent === 0 && launchAngleIdx >= 0) {
      const launchAngle = parseFloat(data[headers[launchAngleIdx]]) || 0;
      // Sweet spot is typically considered between 8 and 32 degrees
      // If the average launch angle is in this range, estimate sweet spot percentage
      if (launchAngle >= 8 && launchAngle <= 32) {
        // Estimate sweet spot percentage based on launch angle
        // The closer to the ideal launch angle (20 degrees), the higher the percentage
        const idealLaunchAngle = 20;
        const deviation = Math.abs(launchAngle - idealLaunchAngle);
        const maxDeviation = 12; // Distance from ideal to edge of sweet spot range
        sweetSpotPercent = Math.max(
          0,
          Math.min(100, 40 - (deviation / maxDeviation) * 15)
        );
        console.log(
          `[savant] Estimated sweet spot percent for batter ${batterId} from launch angle ${launchAngle}: ${sweetSpotPercent}`
        );
      }
    }

    // Log the extracted values
    console.log(
      `[savant] Extracted metrics from search data for batter ${batterId}:`,
      {
        sweetSpotPercent,
        hardHitPercent,
        launchAngle:
          launchAngleIdx >= 0
            ? parseFloat(data[headers[launchAngleIdx]]) || 0
            : 0,
      }
    );

    if (sweetSpotPercent === 0 && hardHitPercent === 0) {
      return null;
    }

    return {
      sweet_spot_percent: sweetSpotPercent,
      hard_hit_percent: hardHitPercent,
    };
  } catch (error) {
    console.error(`[savant] Error parsing search CSV data: ${error}`);
    return null;
  }
}
