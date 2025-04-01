/**
 * Sample API calls to capture response shapes
 */
import { getBallparkFactors } from "../lib/mlb/core/team-mapping";
import { estimateHomeRunProbability } from "../lib/mlb/dfs-analysis/batters/home-runs";
import { getGameFeed } from "../lib/mlb/game/game-feed";
import { getBatterStats } from "../lib/mlb/player/batter-stats";
import { getMatchupData } from "../lib/mlb/player/matchups";
import { getPitcherStats } from "../lib/mlb/player/pitcher-stats";
import { getSchedule } from "../lib/mlb/schedule/schedule";
import { getGameEnvironmentData } from "../lib/mlb/weather/weather";

// Sample data - using a recent MLB game and players
const SAMPLE_GAME_ID = "717465"; // Example game ID
const SAMPLE_BATTER_ID = 665742; // Example batter (Mike Trout)
const SAMPLE_PITCHER_ID = 592789; // Example pitcher (Gerrit Cole)
const SAMPLE_TEAM_ID = 108; // Example team (Angels)
const SAMPLE_VENUE_ID = 1; // Example venue (Yankee Stadium)

async function captureApiSamples() {
  try {
    console.log("Starting API sample capture...");

    // Capture game schedule data
    console.log("Fetching schedule data...");
    const scheduleData = await getSchedule({ date: new Date() });

    // Get a game ID from the schedule if available
    let gameId = SAMPLE_GAME_ID;
    if (scheduleData && scheduleData.dates && scheduleData.dates.length > 0) {
      const games = scheduleData.dates[0].games;
      if (games && games.length > 0) {
        gameId = games[0].gamePk.toString();
      }
    }

    // Capture game environment data
    console.log(`Fetching game environment for game ${gameId}...`);
    const gameEnvironment = await getGameEnvironmentData({ gamePk: gameId });

    // Capture batter stats
    console.log(`Fetching batter stats for ID ${SAMPLE_BATTER_ID}...`);
    const batterStats = await getBatterStats({
      batterId: SAMPLE_BATTER_ID,
      season: 2025,
    });

    // Capture pitcher stats
    console.log(`Fetching pitcher stats for ID ${SAMPLE_PITCHER_ID}...`);
    const pitcherStats = await getPitcherStats({
      pitcherId: SAMPLE_PITCHER_ID,
      season: 2025,
    });

    // Capture matchup data
    console.log("Fetching matchup data...");
    const matchupData = await getMatchupData(
      SAMPLE_BATTER_ID,
      SAMPLE_PITCHER_ID
    );

    // Capture ballpark factors
    console.log(`Fetching ballpark factors for venue ${SAMPLE_VENUE_ID}...`);
    const ballparkFactors = await getBallparkFactors({
      venueId: SAMPLE_VENUE_ID,
      season: "2025",
    });

    // Capture game feed data
    console.log(`Fetching game feed for game ${gameId}...`);
    const gameFeed = await getGameFeed(gameId);

    // Capture HR probability (analysis module)
    console.log("Fetching home run probability analysis...");
    if (gameEnvironment && batterStats && pitcherStats) {
      const hrProbability = await estimateHomeRunProbability(
        SAMPLE_BATTER_ID,
        SAMPLE_PITCHER_ID,
        ballparkFactors,
        gameEnvironment
      );
      console.log("HR probability analysis complete");
    }

    console.log("API sample capture complete");
  } catch (error) {
    console.error("Error capturing API samples:", error);
  }
}

captureApiSamples();
