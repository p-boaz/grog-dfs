import { analyzeStartingPitchers } from "./dfs-analysis/starting-pitcher-analysis";

async function testPitcherAnalysis() {
  try {
    console.log("Testing analyzeStartingPitchers with mock data");

    // Create a mock game object with the correct structure
    const mockGame = {
      gameId: 778506,
      gameTime: "2025-03-30T17:35:00Z",
      status: {
        abstractGameState: "Final",
        codedGameState: "F",
        detailedState: "Final",
        statusCode: "F",
        startTimeTBD: false,
        abstractGameCode: "F",
      },
      homeTeam: {
        id: 120,
        name: "Washington Nationals",
      },
      awayTeam: {
        id: 143,
        name: "Philadelphia Phillies",
      },
      venue: {
        id: 3309,
        name: "Nationals Park",
      },
      pitchers: {
        home: {
          id: 527048,
          fullName: "Martín Pérez",
        },
        away: {
          id: 663978,
          fullName: "Chris Paddack",
        },
      },
      environment: {
        temperature: 75,
        windSpeed: 10,
        windDirection: "Out to CF",
        isOutdoor: true,
      },
      ballpark: {
        overall: 1.05,
        types: {
          singles: 1.02,
          doubles: 1.03,
          triples: 1.1,
          homeRuns: 1.12,
          runs: 1.08,
        },
      },
    };

    // Test with our mock game
    const pitcherAnalysis = await analyzeStartingPitchers([mockGame]);

    console.log("Success! Analysis results:");
    console.log(JSON.stringify(pitcherAnalysis, null, 2));

    return pitcherAnalysis;
  } catch (error) {
    console.error("Error testing pitcher analysis:", error);
    throw error;
  }
}

// Run the test
testPitcherAnalysis()
  .then(() => console.log("Finished test successfully"))
  .catch(console.error);
