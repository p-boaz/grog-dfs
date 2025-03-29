import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join } from "path";
import {
  addPlayerMapping,
  findPlayerByNameFuzzy,
  loadPlayerMappings,
} from "./player-mapping";

export interface DKSalaryData {
  ID: string;
  Name: string;
  Position: string;
  Salary: number;
  AvgPointsPerGame: number;
  TeamAbbrev: string;
  GameInfo: string;
}

export async function getDKSalaries(): Promise<Map<number, DKSalaryData>> {
  const salaries = new Map<number, DKSalaryData>();

  try {
    // Load player mappings first
    loadPlayerMappings();

    // Read the CSV file
    const filePath = join(process.cwd(), "data", "DKSalaries.csv");
    const fileContent = readFileSync(filePath, "utf-8");

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Process each record
    let unmatchedPlayers = 0;
    for (const record of records) {
      // Find MLB ID from player mapping using fuzzy matching
      const player = findPlayerByNameFuzzy(record.Name);

      if (player && player.id > 0) {
        // Store by MLB ID
        salaries.set(player.id, {
          ID: record.ID,
          Name: record.Name,
          Position: record.Position,
          Salary: parseInt(record.Salary),
          AvgPointsPerGame: parseFloat(record.AvgPointsPerGame),
          TeamAbbrev: record.TeamAbbrev,
          GameInfo: record.GameInfo,
        });
        console.log(
          `Added player: ${record.Name} (MLB ID: ${player.id}, DK ID: ${record.ID})`
        );
      } else {
        unmatchedPlayers++;
        console.log(
          `No MLB ID found for player: ${record.Name} - Adding temporary mapping`
        );

        // Add temporary mapping - we'll use negative DK ID to avoid conflicts
        const tempId = -1 * parseInt(record.ID);

        salaries.set(tempId, {
          ID: record.ID,
          Name: record.Name,
          Position: record.Position,
          Salary: parseInt(record.Salary),
          AvgPointsPerGame: parseFloat(record.AvgPointsPerGame),
          TeamAbbrev: record.TeamAbbrev,
          GameInfo: record.GameInfo,
        });

        // Add to player mappings with temporary negative ID
        addPlayerMapping(tempId, record.ID, record.Name, record.Position);
      }
    }

    console.log(
      `Successfully processed ${records.length} players (${unmatchedPlayers} unmatched)`
    );
    return salaries;
  } catch (error) {
    console.error("Error reading DraftKings salary file:", error);
    return new Map();
  }
}
