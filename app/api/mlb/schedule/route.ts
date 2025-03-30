import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "@/lib/mlb/schedule/schedule";

export async function GET(request: NextRequest) {
  try {
    // Get date from query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    // Validate date parameter
    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Validate date format (yyyy-MM-dd)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected yyyy-MM-dd" },
        { status: 400 }
      );
    }

    // Fetch schedule for the specified date
    const scheduleData = await getSchedule(date);

    return NextResponse.json(scheduleData);
  } catch (error) {
    console.error("Error fetching MLB schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch MLB schedule" },
      { status: 500 }
    );
  }
}
