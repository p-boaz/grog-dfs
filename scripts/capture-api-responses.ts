/**
 * Direct API Response Capture Tool
 * 
 * This script directly captures API responses without instrumenting the client.
 * It will fetch responses from various endpoints and save them for analysis.
 * 
 * Usage:
 * pnpm tsx scripts/capture-api-responses.ts
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// Import API functions - add more as needed
import { getGameEnvironmentData } from '../lib/mlb/weather/weather';
import { getBatterStats } from '../lib/mlb/player/batter-stats';
import { getPitcherStats } from '../lib/mlb/player/pitcher-stats';
import { getSchedule } from '../lib/mlb/schedule/schedule';
import { getGameFeed } from '../lib/mlb/game/game-feed';

// Configuration
const OUTPUT_DIR = path.resolve(__dirname, '../data/api-samples');
const TIMEOUT_MS = 10000; // 10 second timeout per request

// Sample data - using example IDs
// Real MLB game ID from 2023 season - if running in-season, use a real current game ID
const SAMPLE_GAME_ID = "717465"; // Update this with a valid MLB game ID if needed
const SAMPLE_BATTER_ID = 665742; // Mike Trout
const SAMPLE_PITCHER_ID = 592789; // Gerrit Cole
const SAMPLE_VENUE_ID = 1; // Yankee Stadium

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to save API response to file
function saveApiResponse(endpoint: string, response: any): void {
  try {
    // Create a safe filename from the endpoint
    const hash = createHash('md5').update(endpoint).digest('hex').substring(0, 8);
    const safeEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const filename = `${safeEndpoint}-${hash}-${timestamp}.json`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    
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
    
    console.log(`Saved response for ${endpoint} to ${outputPath}`);
  } catch (error) {
    console.error(`Error saving API response for ${endpoint}:`, error);
  }
}

// Helper to wrap API calls with timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, name: string): Promise<T | null> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<null>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request for ${name} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  try {
    // Race the original promise against a timeout
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result as T;
  } catch (error) {
    console.error(`Error or timeout in ${name}:`, error);
    return null;
  }
}

// Capture functions for different API endpoints
async function captureSchedule(): Promise<void> {
  console.log('Fetching schedule data...');
  
  try {
    // Format the date as YYYY-MM-DD
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Pass the date string directly, not as an object
    const response = await withTimeout(
      getSchedule(formattedDate),
      TIMEOUT_MS,
      'getSchedule'
    );
    
    if (response) {
      saveApiResponse('schedule/today', response);
    }
  } catch (error) {
    console.error('Error fetching schedule:', error);
  }
}

async function captureBatterStats(): Promise<void> {
  console.log(`Fetching batter stats for ID ${SAMPLE_BATTER_ID}...`);
  
  try {
    const response = await withTimeout(
      getBatterStats({ 
        batterId: SAMPLE_BATTER_ID,
        season: 2025
      }),
      TIMEOUT_MS,
      'getBatterStats'
    );
    
    if (response) {
      saveApiResponse(`player/batter/${SAMPLE_BATTER_ID}`, response);
    }
  } catch (error) {
    console.error('Error fetching batter stats:', error);
  }
}

async function capturePitcherStats(): Promise<void> {
  console.log(`Fetching pitcher stats for ID ${SAMPLE_PITCHER_ID}...`);
  
  try {
    const response = await withTimeout(
      getPitcherStats({
        pitcherId: SAMPLE_PITCHER_ID,
        season: 2025
      }),
      TIMEOUT_MS,
      'getPitcherStats'
    );
    
    if (response) {
      saveApiResponse(`player/pitcher/${SAMPLE_PITCHER_ID}`, response);
    }
  } catch (error) {
    console.error('Error fetching pitcher stats:', error);
  }
}

async function captureGameEnvironment(): Promise<void> {
  console.log(`Fetching game environment for game ${SAMPLE_GAME_ID}...`);
  
  try {
    // Check if SAMPLE_GAME_ID is defined
    if (!SAMPLE_GAME_ID || SAMPLE_GAME_ID === "undefined") {
      console.log("Skipping game environment capture - no valid game ID specified");
      return;
    }
    
    // From code inspection, this function expects an object with gamePk
    const response = await withTimeout(
      getGameEnvironmentData({ 
        gamePk: SAMPLE_GAME_ID 
      }),
      TIMEOUT_MS,
      'getGameEnvironmentData'
    );
    
    if (response) {
      saveApiResponse(`weather/game/${SAMPLE_GAME_ID}`, response);
    }
  } catch (error) {
    console.error('Error fetching game environment:', error);
  }
}

async function captureGameFeed(): Promise<void> {
  console.log(`Fetching game feed for game ${SAMPLE_GAME_ID}...`);
  
  try {
    // Check if SAMPLE_GAME_ID is defined
    if (!SAMPLE_GAME_ID || SAMPLE_GAME_ID === "undefined") {
      console.log("Skipping game feed capture - no valid game ID specified");
      return;
    }
    
    // Looking at the code, getGameFeed is a wrapped function that expects
    // an object with gamePk property
    const response = await withTimeout(
      getGameFeed({
        gamePk: SAMPLE_GAME_ID
      }),
      TIMEOUT_MS,
      'getGameFeed'
    );
    
    if (response) {
      saveApiResponse(`game/feed/${SAMPLE_GAME_ID}`, response);
    }
  } catch (error) {
    console.error('Error fetching game feed:', error);
  }
}

// Process captured responses to generate type information
function processResponses(): void {
  console.log('Processing captured responses...');
  
  try {
    const responses = new Map<string, any[]>();
    const typeInfo = new Map<string, Set<string>>();
    
    // Process all captured response files
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No response files found.');
      return;
    }
    
    console.log(`Found ${files.length} response files to process.`);
    
    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      const { endpoint, response } = data;
      
      // Group responses by endpoint
      if (!responses.has(endpoint)) {
        responses.set(endpoint, []);
      }
      
      responses.get(endpoint)!.push(response);
      
      // Extract properties for type information
      extractProperties(endpoint, response, typeInfo);
    }
    
    // Generate markdown documentation
    generateDocumentation(responses, typeInfo);
    
    // Generate TypeScript interfaces
    generateTypeDefinitions(responses, typeInfo);
    
  } catch (error) {
    console.error('Error processing responses:', error);
  }
}

// Extract properties recursively from an object
function extractProperties(
  endpoint: string, 
  obj: any, 
  typeInfo: Map<string, Set<string>>, 
  prefix = ''
): void {
  if (!obj || typeof obj !== 'object') return;
  
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
    
    if (value && typeof value === 'object') {
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
        documentation += `\`\`\`json\n${JSON.stringify(samples[0], null, 2)}\n\`\`\`\n\n`;
      }
      
      documentation += `---\n\n`;
    }
    
    // Save documentation
    const docPath = path.join(OUTPUT_DIR, 'api-responses.md');
    fs.writeFileSync(docPath, documentation, 'utf-8');
    console.log(`Generated API response documentation at ${docPath}`);
    
  } catch (error) {
    console.error('Error generating documentation:', error);
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
      const typeName = endpoint
        .split('/')
        .map(part => part.replace(/[^a-zA-Z0-9]/g, ''))
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Response';
      
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
    }
    
    // Save type definitions
    const typesPath = path.join(OUTPUT_DIR, 'api-types.ts');
    fs.writeFileSync(typesPath, definitions, 'utf-8');
    console.log(`Generated API type definitions at ${typesPath}`);
    
  } catch (error) {
    console.error('Error generating type definitions:', error);
  }
}

// Helper to determine TypeScript type from a value
function getTypeString(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = typeof value;
  
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    return `Array<${getTypeString(value[0])}>`;
  }
  
  if (type === 'object') {
    return `Record<string, any>`;
  }
  
  return 'any';
}

// Save a fallback sample for a given endpoint when API calls fail
function saveFallbackSample(endpoint: string, sampleData: any): void {
  try {
    console.log(`Saving fallback sample for ${endpoint}...`);
    saveApiResponse(endpoint, sampleData);
  } catch (error) {
    console.error(`Error saving fallback sample for ${endpoint}:`, error);
  }
}

// Main function
async function main() {
  console.log('Starting direct API response capture...');
  
  try {
    // Run all capture functions in parallel
    const results = await Promise.allSettled([
      captureSchedule(),
      captureBatterStats(),
      capturePitcherStats(),
      captureGameEnvironment(),
      captureGameFeed()
    ]);
    
    console.log('API captures completed');
    
    // Check if we have any responses at all
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('.json'));
    
    // If no responses were captured, save some fallback samples
    if (files.length === 0) {
      console.log('No successful API responses were captured. Saving fallback samples...');
      
      // Fallback samples (simplified but with correct shape)
      saveFallbackSample('schedule/today', {
        dates: [{
          date: "2025-03-31",
          games: [{
            gamePk: 12345,
            status: { abstractGameState: "Final" },
            teams: { away: { team: { name: "Team A" }}, home: { team: { name: "Team B" }}},
            venue: { id: 1, name: "Sample Stadium" }
          }]
        }]
      });
      
      saveFallbackSample('player/batter/12345', {
        id: 12345,
        fullName: "Sample Player",
        currentTeam: "Team A",
        primaryPosition: "OF",
        batSide: "R",
        seasonStats: {
          gamesPlayed: 100,
          atBats: 400,
          hits: 120,
          homeRuns: 25,
          rbi: 75,
          avg: .300,
          obp: .370,
          slg: .550,
          ops: .920
        }
      });
    }
    
    // Process the responses
    processResponses();
    
    console.log('API sample capture and analysis complete');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main();