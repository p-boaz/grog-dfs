import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { collectDailyDFSData } from "@/lib/mlb/daily-data-collector";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString("utf-8");

    // Validate CSV structure
    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
      });

      // Check for required columns (accounting for spaces in column names)
      const requiredColumns = [
        "ID",
        "Name",
        "Position",
        "Salary",
        "AvgPointsPerGame",
        "TeamAbbrev",
        "Game Info",
      ];
      const firstRecord = records[0];
      const missingColumns = requiredColumns.filter(
        (col) => !(col in firstRecord)
      );

      if (missingColumns.length > 0) {
        return NextResponse.json(
          { error: `Missing required columns: ${missingColumns.join(", ")}` },
          { status: 400 }
        );
      }

      // Extract date from Game Info field (format: "TEAM@TEAM MM/DD/YYYY HH:MMAM/PM ET")
      const gameInfo = records[0]["Game Info"];
      const dateMatch = gameInfo.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (!dateMatch) {
        return NextResponse.json(
          { error: "Could not extract date from Game Info field" },
          { status: 400 }
        );
      }

      // Convert date from MM/DD/YYYY to YYYY-MM-DD
      const [month, day, year] = dateMatch[1].split("/");
      const targetDate = `${year}-${month}-${day}`;

      // Save file to data directory
      const filePath = join(process.cwd(), "data", "DKSalaries.csv");
      await writeFile(filePath, content);

      // Trigger daily data collection with the extracted date
      try {
        await collectDailyDFSData(targetDate);
        return NextResponse.json({
          message: `File uploaded and data collection completed successfully for ${targetDate}`,
          records: records.length,
          targetDate,
        });
      } catch (error) {
        console.error("Error during data collection:", error);
        return NextResponse.json(
          {
            message: "File uploaded but data collection failed",
            error: error instanceof Error ? error.message : "Unknown error",
            records: records.length,
            targetDate,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      return NextResponse.json(
        { error: "Invalid CSV format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
