import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { normalizePlayerName, findBestNameMatch } from "../../utils";

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
