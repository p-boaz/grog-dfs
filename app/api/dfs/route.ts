import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Read the JSON files
    const battersPath = path.join(
      process.cwd(),
      "data",
      `mlb-batters-${today}.json`
    );
    const pitchersPath = path.join(
      process.cwd(),
      "data",
      `mlb-pitchers-${today}.json`
    );

    const battersData = fs.existsSync(battersPath)
      ? JSON.parse(fs.readFileSync(battersPath, "utf-8"))
      : [];

    const pitchersData = fs.existsSync(pitchersPath)
      ? JSON.parse(fs.readFileSync(pitchersPath, "utf-8"))
      : [];

    return NextResponse.json({
      batters: battersData,
      pitchers: pitchersData,
      date: today,
    });
  } catch (error) {
    console.error("Error fetching DFS data:", error);
    return NextResponse.json(
      { error: "Failed to fetch DFS data" },
      { status: 500 }
    );
  }
}
