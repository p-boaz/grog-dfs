import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // Get the date from the URL query parameters, or use today's date
    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Read the JSON files for the specified date
    const battersPath = path.join(
      process.cwd(),
      "data",
      `${date}-batters.json`
    );
    const pitchersPath = path.join(
      process.cwd(),
      "data",
      `${date}-pitchers.json`
    );

    // Check if files exist
    const battersFileExists = fs.existsSync(battersPath);
    const pitchersFileExists = fs.existsSync(pitchersPath);

    // If neither file exists, return an error
    if (!battersFileExists && !pitchersFileExists) {
      return NextResponse.json(
        { error: `No data available for date: ${date}` },
        { status: 404 }
      );
    }

    // Read the data files if they exist
    const battersData = battersFileExists
      ? JSON.parse(fs.readFileSync(battersPath, "utf-8"))
      : [];

    const pitchersData = pitchersFileExists
      ? JSON.parse(fs.readFileSync(pitchersPath, "utf-8"))
      : [];

    // Return data in the structure expected by the frontend
    return NextResponse.json({
      batters: {
        date,
        analysisTimestamp: new Date().toISOString(),
        batters: Array.isArray(battersData) ? battersData : [],
      },
      pitchers: {
        date,
        analysisTimestamp: new Date().toISOString(),
        pitchers: Array.isArray(pitchersData) ? pitchersData : [],
      },
      date,
    });
  } catch (error) {
    console.error("Error fetching DFS data:", error);
    return NextResponse.json(
      { error: "Failed to fetch DFS data" },
      { status: 500 }
    );
  }
}
