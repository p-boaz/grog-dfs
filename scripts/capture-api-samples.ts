/**
 * API Response Capture Tool
 *
 * This script captures actual API responses by intercepting API calls
 * and saving the responses as samples for type validation.
 *
 * Usage:
 * pnpm tsx scripts/capture-api-samples.ts
 */

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configuration
const OUTPUT_DIR = path.resolve(__dirname, "../data/api-samples");
const MLB_API_CLIENT_PATH = path.resolve(
  __dirname,
  "../lib/mlb/core/api-client.ts"
);
const SAMPLE_SCRIPT_PATH = path.resolve(__dirname, "sample-api-calls.ts");
const MAX_SAMPLES_PER_ENDPOINT = 3;

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create a simple script to make API calls
function createSampleApiScript() {
  const scriptContent = `
/**
 * Sample API calls to capture response shapes
 */
import { getGameEnvironmentData } from '../lib/mlb/weather/weather';
import { getBatterStats } from '../lib/mlb/player/batter-stats';
import { getPitcherStats } from '../lib/mlb/player/pitcher-stats';
import { estimateHomeRunProbability } from '../lib/mlb/dfs-analysis/home-runs';
import { getMatchupData } from '../lib/mlb/player/matchups';
import { getSchedule } from '../lib/mlb/schedule/schedule';
import { getGameFeed } from '../lib/mlb/game/game-feed';
import { getBallparkFactors } from '../lib/mlb/core/team-mapping';

// Sample data - using a recent MLB game and players
const SAMPLE_GAME_ID = "717465"; // Example game ID
const SAMPLE_BATTER_ID = 665742; // Example batter (Mike Trout)
const SAMPLE_PITCHER_ID = 592789; // Example pitcher (Gerrit Cole)
const SAMPLE_TEAM_ID = 108; // Example team (Angels)
const SAMPLE_VENUE_ID = 1; // Example venue (Yankee Stadium)

async function captureApiSamples() {
  try {
    console.log('Starting API sample capture...');
    
    // Capture game schedule data
    console.log('Fetching schedule data...');
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
    console.log(\`Fetching game environment for game \${gameId}...\`);
    const gameEnvironment = await getGameEnvironmentData({ gamePk: gameId });
    
    // Capture batter stats
    console.log(\`Fetching batter stats for ID \${SAMPLE_BATTER_ID}...\`);
    const batterStats = await getBatterStats({ 
      batterId: SAMPLE_BATTER_ID,
      season: 2025
    });
    
    // Capture pitcher stats
    console.log(\`Fetching pitcher stats for ID \${SAMPLE_PITCHER_ID}...\`);
    const pitcherStats = await getPitcherStats({
      pitcherId: SAMPLE_PITCHER_ID,
      season: 2025
    });
    
    // Capture matchup data
    console.log('Fetching matchup data...');
    const matchupData = await getMatchupData(SAMPLE_BATTER_ID, SAMPLE_PITCHER_ID);
    
    // Capture ballpark factors
    console.log(\`Fetching ballpark factors for venue \${SAMPLE_VENUE_ID}...\`);
    const ballparkFactors = await getBallparkFactors({
      venueId: SAMPLE_VENUE_ID,
      season: "2025"
    });
    
    // Capture game feed data
    console.log(\`Fetching game feed for game \${gameId}...\`);
    const gameFeed = await getGameFeed(gameId);
    
    // Capture HR probability (analysis module)
    console.log('Fetching home run probability analysis...');
    if (gameEnvironment && batterStats && pitcherStats) {
      const hrProbability = await estimateHomeRunProbability(
        SAMPLE_BATTER_ID,
        SAMPLE_PITCHER_ID,
        ballparkFactors,
        gameEnvironment
      );
      console.log('HR probability analysis complete');
    }
    
    console.log('API sample capture complete');
  } catch (error) {
    console.error('Error capturing API samples:', error);
  }
}

captureApiSamples();
`;

  fs.writeFileSync(SAMPLE_SCRIPT_PATH, scriptContent, "utf-8");
  console.log(`Created sample API call script at ${SAMPLE_SCRIPT_PATH}`);
}

// Instrument the API client to capture responses
function instrumentApiClient() {
  try {
    const originalClientPath = MLB_API_CLIENT_PATH;
    const backupClientPath = `${MLB_API_CLIENT_PATH}.backup`;

    // Check if we already have a backup
    if (!fs.existsSync(backupClientPath)) {
      // Create a backup of the original file
      fs.copyFileSync(originalClientPath, backupClientPath);
      console.log(`Created backup of API client at ${backupClientPath}`);
    }

    // Read the original client code
    let clientCode = fs.readFileSync(originalClientPath, "utf-8");

    // Check if already instrumented
    if (clientCode.includes("captureApiResponse")) {
      console.log("API client is already instrumented");
      return;
    }

    // Add the response capture function
    const captureFunction = `
// Response capture for type analysis
function captureApiResponse(endpoint: string, response: any) {
  try {
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');
    
    // Create a safe filename from the endpoint
    const hash = crypto.createHash('md5').update(endpoint).digest('hex').substring(0, 8);
    const safeEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const filename = \`\${safeEndpoint}-\${hash}-\${timestamp}.json\`;
    const outputPath = path.resolve(__dirname, '../../../data/api-samples', filename);
    
    // Save the response
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          endpoint,
          timestamp: new Date().toISOString(),
          response
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('Error capturing API response:', error);
  }
}
`;

    // Insert the capture function
    clientCode = clientCode.replace(
      /export async function mlbApiRequest/,
      `${captureFunction}\n\nexport async function mlbApiRequest`
    );

    // Add capture call to the API request function
    clientCode = clientCode.replace(
      /return data;(\s+})/,
      "captureApiResponse(endpoint, data);\n  return data;$1"
    );

    // Write modified code back
    fs.writeFileSync(originalClientPath, clientCode, "utf-8");
    console.log("Instrumented API client to capture responses");
  } catch (error) {
    console.error("Error instrumenting API client:", error);
  }
}

// Restore the original API client
function restoreApiClient() {
  try {
    const originalClientPath = MLB_API_CLIENT_PATH;
    const backupClientPath = `${MLB_API_CLIENT_PATH}.backup`;

    if (fs.existsSync(backupClientPath)) {
      fs.copyFileSync(backupClientPath, originalClientPath);
      fs.unlinkSync(backupClientPath);
      console.log("Restored original API client");
    } else {
      console.log("No backup found, API client was not modified");
    }
  } catch (error) {
    console.error("Error restoring API client:", error);
  }
}

// Process captured responses to generate type information
function processCapturedResponses() {
  try {
    const responses = new Map<string, any[]>();
    const typeInfo = new Map<string, Set<string>>();

    // Process all captured response files
    const files = fs.readdirSync(OUTPUT_DIR);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(OUTPUT_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);

      const { endpoint, response } = data;

      // Group responses by endpoint
      if (!responses.has(endpoint)) {
        responses.set(endpoint, []);
      }

      if (responses.get(endpoint)!.length < MAX_SAMPLES_PER_ENDPOINT) {
        responses.get(endpoint)!.push(response);
      }

      // Extract properties for type information
      extractProperties(endpoint, response, typeInfo);
    }

    // Generate markdown documentation
    generateDocumentation(responses, typeInfo);

    // Generate TypeScript interfaces
    generateTypeDefinitions(responses, typeInfo);
  } catch (error) {
    console.error("Error processing captured responses:", error);
  }
}

// Extract properties recursively from an object
function extractProperties(
  endpoint: string,
  obj: any,
  typeInfo: Map<string, Set<string>>,
  prefix = ""
): void {
  if (!obj || typeof obj !== "object") return;

  if (!typeInfo.has(endpoint)) {
    typeInfo.set(endpoint, new Set<string>());
  }

  const properties = typeInfo.get(endpoint)!;

  if (Array.isArray(obj)) {
    // For arrays, examine the first item
    if (obj.length > 0) {
      extractProperties(endpoint, obj[0], typeInfo, `${prefix}[]`);
    }
    return;
  }

  // Process object properties
  for (const [key, value] of Object.entries(obj)) {
    const propPath = prefix ? `${prefix}.${key}` : key;
    properties.add(propPath);

    if (value && typeof value === "object") {
      extractProperties(endpoint, value, typeInfo, propPath);
    }
  }
}

// Generate markdown documentation from responses
function generateDocumentation(
  responses: Map<string, any[]>,
  typeInfo: Map<string, Set<string>>
): void {
  try {
    let documentation = `# MLB API Response Analysis\n\n`;
    documentation += `Generated on: ${new Date().toLocaleString()}\n\n`;
    documentation += `This document contains API response samples and type information.\n\n`;

    documentation += `## Endpoints Captured\n\n`;

    for (const [endpoint, samples] of responses.entries()) {
      documentation += `### ${endpoint}\n\n`;
      documentation += `Samples: ${samples.length}\n\n`;

      // List properties
      documentation += `#### Properties\n\n`;

      const properties = Array.from(typeInfo.get(endpoint) || []).sort();
      for (const property of properties) {
        documentation += `- \`${property}\`\n`;
      }

      // Show sample data (first only to avoid huge file)
      if (samples.length > 0) {
        documentation += `\n#### Sample Response\n\n`;
        documentation += `\`\`\`json\n${JSON.stringify(
          samples[0],
          null,
          2
        )}\n\`\`\`\n\n`;
      }

      documentation += `---\n\n`;
    }

    // Save documentation
    const docPath = path.join(OUTPUT_DIR, "api-responses.md");
    fs.writeFileSync(docPath, documentation, "utf-8");
    console.log(`Generated API response documentation at ${docPath}`);
  } catch (error) {
    console.error("Error generating documentation:", error);
  }
}

// Generate TypeScript interfaces from responses
function generateTypeDefinitions(
  responses: Map<string, any[]>,
  typeInfo: Map<string, Set<string>>
): void {
  try {
    let definitions = `/**
 * MLB API Response Types
 * 
 * Auto-generated from actual API responses
 * Generated on: ${new Date().toLocaleString()}
 */

`;

    for (const [endpoint, samples] of responses.entries()) {
      if (samples.length === 0) continue;

      // Create a type name from the endpoint
      const typeName =
        endpoint
          .split("/")
          .map((part) => part.replace(/[^a-zA-Z0-9]/g, ""))
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("") + "Response";

      definitions += `/**
 * Response type for endpoint: ${endpoint}
 */
export interface ${typeName} {\n`;

      // Get sample for type inference
      const sample = samples[0];

      // Get all top-level properties and their types
      for (const [key, value] of Object.entries(sample)) {
        const type = getTypeString(value);
        definitions += `  ${key}: ${type};\n`;
      }

      definitions += `}\n\n`;

      // Generate nested types for complex objects
      for (const [key, value] of Object.entries(sample)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          generateNestedTypes(
            value,
            `${typeName}${capitalize(key)}`,
            definitions
          );
        } else if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "object"
        ) {
          generateNestedTypes(
            value[0],
            `${typeName}${capitalize(key)}Item`,
            definitions
          );
        }
      }
    }

    // Save type definitions
    const typesPath = path.join(OUTPUT_DIR, "api-types.ts");
    fs.writeFileSync(typesPath, definitions, "utf-8");
    console.log(`Generated API type definitions at ${typesPath}`);
  } catch (error) {
    console.error("Error generating type definitions:", error);
  }
}

// Generate nested type definitions
function generateNestedTypes(
  obj: any,
  typeName: string,
  definitions: string
): string {
  if (!obj || typeof obj !== "object") return definitions;

  definitions += `/**
 * Nested type for ${typeName}
 */
export interface ${typeName} {\n`;

  for (const [key, value] of Object.entries(obj)) {
    const type = getTypeString(value);
    definitions += `  ${key}: ${type};\n`;
  }

  definitions += `}\n\n`;

  // Process nested objects
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      generateNestedTypes(value, `${typeName}${capitalize(key)}`, definitions);
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "object"
    ) {
      generateNestedTypes(
        value[0],
        `${typeName}${capitalize(key)}Item`,
        definitions
      );
    }
  }

  return definitions;
}

// Helper to determine TypeScript type from a value
function getTypeString(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const type = typeof value;

  if (type === "string") return "string";
  if (type === "number") return "number";
  if (type === "boolean") return "boolean";

  if (Array.isArray(value)) {
    if (value.length === 0) return "any[]";
    const itemType = getTypeString(value[0]);
    return `${itemType}[]`;
  }

  if (type === "object") {
    return `object`; // Could also use Record<string, any>
  }

  return "any";
}

// Helper to capitalize a string
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run the sample script to capture API responses
async function runSampleScript() {
  try {
    console.log("Running sample API calls...");
    const { stdout, stderr } = await execAsync(
      "pnpm tsx scripts/sample-api-calls.ts"
    );

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("Sample API calls completed");
  } catch (error) {
    console.error("Error running sample API calls:", error);
  }
}

// Main function
async function main() {
  try {
    // Step 1: Create the sample API script
    createSampleApiScript();

    // Step 2: Instrument the API client
    instrumentApiClient();

    // Step 3: Run the sample script
    await runSampleScript();

    // Step 4: Process captured responses
    processCapturedResponses();

    // Step 5: Restore original API client
    restoreApiClient();

    console.log("API sample capture complete");
  } catch (error) {
    console.error("Error in main process:", error);
    // Make sure we restore the API client even if there's an error
    restoreApiClient();
  }
}

// Handle script interruption
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Cleaning up...");
  restoreApiClient();
  process.exit(0);
});

main();
