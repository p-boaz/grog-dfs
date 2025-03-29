import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export interface DKSalaryData {
  draftKingsId: string;
  name: string;
  position: string;
  salary: number;
  gameInfo: string;
  avgPointsPerGame: number;
  teamAbbrev: string;
}

export async function getDKSalaries(): Promise<Map<string, DKSalaryData>> {
  const salaries = new Map<string, DKSalaryData>();

  try {
    // Read the CSV file from the data directory
    const csvFilePath = path.join(process.cwd(), "data", "DKSalaries.csv");
    const fileContent = fs.readFileSync(csvFilePath, "utf-8");

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Process each record
    for (const record of records) {
      const salaryData: DKSalaryData = {
        draftKingsId: record.ID,
        name: record.Name,
        position: record.Position,
        salary: parseInt(record.Salary, 10),
        gameInfo: record["Game Info"],
        avgPointsPerGame: parseFloat(record.AvgPointsPerGame || "0"),
        teamAbbrev: record.TeamAbbrev,
      };

      // Store by DraftKings ID
      salaries.set(record.ID, salaryData);
    }

    return salaries;
  } catch (error) {
    console.error("Error reading DraftKings salaries:", error);
    return new Map();
  }
}
