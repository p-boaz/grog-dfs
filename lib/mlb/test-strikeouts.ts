import { calculateExpectedStrikeouts } from "./dfs-analysis/strikeouts";

async function testStrikeouts() {
  try {
    console.log("Testing calculateExpectedStrikeouts with correct parameters");

    // Test with valid pitcher ID (Martín Pérez) and team ID (NY Yankees)
    const pitcherId = 527048; // Martín Pérez
    const teamId = 147; // NY Yankees
    const gameId = "778506"; // Example game ID

    console.log(
      `Calling calculateExpectedStrikeouts(${pitcherId}, ${teamId}, "${gameId}")`
    );

    const strikeoutProjection = await calculateExpectedStrikeouts(
      pitcherId,
      teamId,
      gameId
    );

    console.log("Success! Projection results:");
    console.log(JSON.stringify(strikeoutProjection, null, 2));

    return strikeoutProjection;
  } catch (error) {
    console.error("Error testing strikeouts:", error);
    throw error;
  }
}

// Run the test
testStrikeouts()
  .then(() => console.log("Finished test successfully"))
  .catch(console.error);
