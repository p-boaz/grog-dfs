import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

interface PlayerMapping {
  id: number; // MLB ID
  name: string; // Player name
  position: string; // Player position
  team_id: number; // MLB team ID
  active: boolean; // Whether player is currently active
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
}

interface DKSalaryData {
  draftKingsId: string;
  name: string;
  position: string;
  salary: number;
  gameInfo: string;
  avgPointsPerGame: number;
  teamAbbrev: string;
}

// In-memory cache for player mappings
let playerMapping: PlayerMapping[] = [];

/**
 * Utilities for name-based player matching between MLB data and DraftKings
 */

/**
 * Normalizes a player name for matching purposes
 * - Converts to lowercase
 * - Removes punctuation and special characters
 * - Handles "Last, First" format
 * - Removes suffixes (Jr, Sr, III, etc)
 * - Handles known nicknames (Bill/William, etc)
 *
 * @param name The player name to normalize
 * @returns Normalized name string for matching
 */
export function normalizePlayerName(name: string): string {
  if (!name) return "";

  // Convert to lowercase
  let normalized = name.toLowerCase();

  // Handle "Last, First" format by converting to "First Last"
  if (normalized.includes(",")) {
    const parts = normalized.split(",").map((p) => p.trim());
    normalized = `${parts[1]} ${parts[0]}`;
  }

  // Remove punctuation and special characters
  normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, "");

  // Remove common suffixes
  normalized = normalized
    .replace(/\s+jr\.?$/, "")
    .replace(/\s+sr\.?$/, "")
    .replace(/\s+ii+$/, "")
    .replace(/\s+iv$/, "");

  // Handle common nicknames
  const nicknames: Record<string, string[]> = {
    william: ["bill", "billy", "will"],
    robert: ["rob", "bob", "bobby"],
    richard: ["rich", "rick", "dick", "ricky"],
    michael: ["mike", "mikey"],
    james: ["jim", "jimmy", "jamie"],
    joseph: ["joe", "joey"],
    christopher: ["chris"],
    nicholas: ["nick"],
    daniel: ["dan", "danny"],
    anthony: ["tony"],
    joshua: ["josh"],
    matthew: ["matt"],
  };

  // For each word in the name, check if it's a nickname and replace with standard form
  const words = normalized.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check if this word is a known nickname
    for (const [standard, nicks] of Object.entries(nicknames)) {
      if (nicks.includes(word)) {
        words[i] = standard;
        break;
      }
    }
  }

  return words.join(" ").trim();
}

/**
 * Calculate similarity score between two player names
 * Returns a number between 0 and 1, where 1 is a perfect match
 *
 * @param name1 First player name
 * @param name2 Second player name
 * @returns Similarity score (0-1)
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  const normalized1 = normalizePlayerName(name1);
  const normalized2 = normalizePlayerName(name2);

  // If normalized names are identical, perfect match
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // Use Levenshtein distance for partial matching
  const leven = levenshteinDistance(normalized1, normalized2);
  const maxLen = Math.max(normalized1.length, normalized2.length);

  // Convert distance to similarity score (0-1)
  return maxLen > 0 ? 1 - leven / maxLen : 0;
}

/**
 * Calculate Levenshtein distance between two strings
 * Lower numbers mean strings are more similar
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return track[str2.length][str1.length];
}

/**
 * Find the best match for a player name in a list of possible matches
 *
 * @param name Name to find a match for
 * @param possibleMatches Array of possible matching names
 * @param threshold Minimum similarity threshold (default 0.7)
 * @returns Best match object or null if no match above threshold
 */
export function findBestNameMatch(
  name: string,
  possibleMatches: string[],
  threshold = 0.7
): { match: string; similarity: number } | null {
  if (!name || !possibleMatches?.length) return null;

  let bestMatch = "";
  let bestSimilarity = 0;

  for (const possible of possibleMatches) {
    const similarity = calculateNameSimilarity(name, possible);

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = possible;
    }
  }

  if (bestSimilarity >= threshold) {
    return { match: bestMatch, similarity: bestSimilarity };
  }

  return null;
}

/**
 * Normalize a player name for consistent matching
 */
function normalizePlayerNameForMapping(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+jr\.?$/, "") // Remove Jr/Jr.
    .replace(/\s+sr\.?$/, "") // Remove Sr/Sr.
    .replace(/\s+iii$/, "") // Remove III
    .replace(/\s+ii$/, "") // Remove II
    .replace(/\./g, "") // Remove periods
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

/**
 * Load player mappings from JSON file
 */
function loadPlayerMappings(): void {
  try {
    const mappingPath = path.join(
      process.cwd(),
      "lib",
      "mlb",
      "draftkings",
      "player-mapping.json"
    );
    const mappingData = fs.readFileSync(mappingPath, "utf-8");
    playerMapping = JSON.parse(mappingData);
  } catch (error) {
    console.error("Error loading player mappings:", error);
    playerMapping = [];
  }
}

/**
 * Find player by fuzzy name matching
 */
export function findPlayerByNameFuzzy(name: string): PlayerMapping | null {
  const normalizedSearchName = normalizePlayerNameForMapping(name);

  // First try exact match on normalized name
  let match = playerMapping.find(
    (p) => normalizePlayerNameForMapping(p.name) === normalizedSearchName
  );
  if (match) return match;

  // Try just first and last name
  const nameParts = normalizedSearchName.split(" ");
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    // Try matching just first and last name
    match = playerMapping.find((p) => {
      const pNormalized = normalizePlayerNameForMapping(p.name);
      return pNormalized.includes(firstName) && pNormalized.includes(lastName);
    });
    if (match) return match;
  }

  // Try using our more advanced name similarity logic
  const possibleMatches = playerMapping.map((p) => p.name);
  const bestMatch = findBestNameMatch(name, possibleMatches, 0.8);
  if (bestMatch) {
    return playerMapping.find((p) => p.name === bestMatch.match) || null;
  }

  return null;
}

/**
 * Get MLB ID for a player by name
 */
function getMLBIdForPlayer(playerName: string): number | null {
  const player = findPlayerByNameFuzzy(playerName);
  return player?.id || null;
}

/**
 * Populate MLB IDs for games data
 * This function is called to ensure all players in the games data have proper MLB IDs
 */
export function populateMlbIds(games: any[]): void {
  // Load mappings if not already loaded
  if (playerMapping.length === 0) {
    loadPlayerMappings();
  }

  games.forEach((game) => {
    // Handle probable pitchers
    if (game.teams?.away?.probablePitcher) {
      const pitcher = game.teams.away.probablePitcher;
      const mlbId = getMLBIdForPlayer(pitcher.fullName);
      if (mlbId) {
        pitcher.id = mlbId;
      } else {
        console.log(`No MLB ID found for pitcher: ${pitcher.fullName}`);
      }
    }
    if (game.teams?.home?.probablePitcher) {
      const pitcher = game.teams.home.probablePitcher;
      const mlbId = getMLBIdForPlayer(pitcher.fullName);
      if (mlbId) {
        pitcher.id = mlbId;
      } else {
        console.log(`No MLB ID found for pitcher: ${pitcher.fullName}`);
      }
    }

    // Handle lineups if they exist
    if (game.lineups?.away) {
      game.lineups.away.forEach((player: any) => {
        const mlbId = getMLBIdForPlayer(player.fullName);
        if (mlbId) {
          player.id = mlbId;
        } else {
          console.log(`No MLB ID found for player: ${player.fullName}`);
        }
      });
    }
    if (game.lineups?.home) {
      game.lineups.home.forEach((player: any) => {
        const mlbId = getMLBIdForPlayer(player.fullName);
        if (mlbId) {
          player.id = mlbId;
        } else {
          console.log(`No MLB ID found for player: ${player.fullName}`);
        }
      });
    }
  });
}

/**
 * Add a new player mapping
 * This is used when processing DraftKings salaries to create initial mappings
 * The MLB ID will be updated later when we find the match
 */
export function addPlayerMapping(
  mlbId: number,
  dkId: string,
  name: string,
  position: string
): void {
  const normalizedName = normalizePlayerNameForMapping(name);
  const existingMapping = playerMapping.find(
    (p) => normalizePlayerNameForMapping(p.name) === normalizedName
  );
  if (!existingMapping) {
    playerMapping.push({
      id: mlbId,
      name,
      position,
      team_id: 0, // Will be updated when we have team info
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

// Export other functions for use in other modules
export {
  loadPlayerMappings,
  getMLBIdForPlayer,
  type PlayerMapping,
  type DKSalaryData,
};
