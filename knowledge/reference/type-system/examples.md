# MLB Type System Usage Examples

This document demonstrates how to use the new type system in your code. The examples show both the old way and the new, improved approach.

## Importing Types

### Old Way

```typescript
import { BatterSeasonStats } from '../types/player/batter';
import { PitcherSeasonStats } from '../types/player/pitcher';
import { BatterDFSPoints } from '../types/analysis/scoring';
```

### New Way

```typescript
// Option 1: Namespace imports for clear organization
import { Domain, Analysis, Api } from '../types';

// Option 2: Direct imports for specific types
import { BatterStats, PitcherStats } from '../types/domain/player';
import { BatterPointsBreakdown } from '../types/analysis/scoring';

// Option 3: Import everything from the analysis layer
import * as Analysis from '../types/analysis';
```

## Working with API Responses

### Old Way

```typescript
import { getBatterStats } from '../player/batter-stats';

async function processBatter(batterId: number) {
  const response = await getBatterStats({ batterId });
  
  // Manual conversion from string to number
  const battingAverage = parseFloat(response.seasonStats.avg);
  
  // Need to check each property
  const homeRuns = response.seasonStats.homeRuns || 0;
  
  // Inconsistent property names
  const rbis = response.seasonStats.rbis || response.seasonStats.rbi || 0;
  
  // Calculate fantasy points
  const points = 
    homeRuns * 10 + 
    rbis * 2 + 
    (response.seasonStats.runs || 0) * 2;
    
  return points;
}
```

### New Way

```typescript
import { getBatterStats } from '../player/batter-stats';
import { batterFromApi, BatterStats } from '../types/domain/player';
import { calculateBatterFantasyPoints } from '../types/analysis/scoring';

async function processBatter(batterId: number) {
  // Get API response
  const apiResponse = await getBatterStats({ batterId });
  
  // Convert to domain model
  const batter = batterFromApi(apiResponse);
  
  // All properties are properly typed and normalized
  // No need for string-to-number conversion or null checks
  const currentStats: BatterStats = batter.currentStats;
  
  // Calculate fantasy points using utility function
  const points = calculateBatterFantasyPoints(currentStats);
  
  return points;
}
```

## Type Guards for Runtime Safety

### Old Way

```typescript
function processData(data: any) {
  // No way to validate if data has the right shape
  try {
    const homeRuns = data.homeRuns || 0;
    const rbi = data.rbi || data.rbis || 0;
    // Many other manual checks
  } catch (error) {
    console.error('Invalid data format');
    return 0;
  }
}
```

### New Way

```typescript
import { isBatterStats, BatterStats } from '../types/domain/player';

function processData(data: unknown): number {
  // Runtime type checking
  if (!isBatterStats(data)) {
    console.error('Invalid data format: Expected BatterStats');
    return 0;
  }
  
  // TypeScript now knows data is BatterStats
  const stats: BatterStats = data;
  
  return calculateBatterFantasyPoints(stats);
}
```

## Complex Projections

### Old Way

```typescript
import { BatterSeasonStats } from '../types/player/batter';
import { PlayerProjection } from '../types/analysis/scoring';

function projectBatter(
  stats: BatterSeasonStats, 
  salary: number, 
  opposingPitcher: any
): PlayerProjection {
  // Manual calculations with lots of property checks
  const homeRunRate = stats.homeRuns / (stats.atBats || 1);
  const expectedHR = homeRunRate * 4; // 4 at-bats assumption
  
  // More complex calculations...
  
  return {
    playerId: 12345, // No way to get this from stats
    name: "Unknown",
    position: "OF",
    team: "Team",
    opponent: "Opponent",
    salary: salary,
    projectedPoints: expectedHR * 10 + /* other calculations */,
    upside: /* calculation */,
    floor: /* calculation */,
    valueScore: /* calculation */,
    confidence: 50
  };
}
```

### New Way

```typescript
import { Batter } from '../types/domain/player';
import { BatterProjection, BatterPointsBreakdown, createEmptyBatterPointsBreakdown } from '../types/analysis/scoring';
import { GameEnvironment } from '../types/domain/game';

function projectBatter(
  batter: Batter, 
  opposingPitcher: { id: number; name: string; throwsHand: string },
  gameEnvironment: GameEnvironment,
  draftKingsSalary: number
): BatterProjection {
  // Start with a base points breakdown
  const expected = createEmptyBatterPointsBreakdown();
  
  // All properties are properly typed
  const homeRunRate = batter.currentSeason.hrRate;
  const expectedHR = homeRunRate * 4; // 4 at-bats assumption
  
  // Fill in the breakdown with calculated values
  expected.homeRuns = expectedHR;
  expected.singles = /* calculation */;
  expected.doubles = /* calculation */;
  expected.triples = /* calculation */;
  expected.runs = /* calculation */;
  expected.rbi = /* calculation */;
  expected.walks = /* calculation */;
  expected.stolenBases = /* calculation */;
  
  // Calculate total hits and points
  expected.totalHits = expected.singles + expected.doubles + expected.triples + expected.homeRuns;
  expected.totalPoints = 
    expected.singles * 3 + 
    expected.doubles * 5 + 
    expected.triples * 8 + 
    expected.homeRuns * 10 + 
    expected.runs * 2 + 
    expected.rbi * 2 + 
    expected.walks * 2 + 
    expected.hitByPitch * 2 + 
    expected.stolenBases * 5;
  
  // Create ceiling and floor projections
  const ceiling = { ...expected };
  ceiling.homeRuns *= 1.5; // 50% higher
  ceiling.totalPoints *= 1.5;
  
  const floor = { ...expected };
  floor.homeRuns *= 0.5; // 50% lower
  floor.totalPoints *= 0.5;
  
  // Return complete projection
  return {
    batterId: batter.id,
    name: batter.fullName,
    team: batter.team,
    position: batter.position,
    opponent: "Opponent",
    opposingPitcher,
    gameId: 12345, // Would come from game data
    venue: gameEnvironment.venue.name,
    expected,
    ceiling,
    floor,
    expectedPoints: expected.totalPoints,
    ceilingPoints: ceiling.totalPoints,
    floorPoints: floor.totalPoints,
    confidence: 70,
    factors: {
      weather: {
        temperature: gameEnvironment.temperature,
        windSpeed: gameEnvironment.windSpeed,
        windDirection: gameEnvironment.windDirection,
        isOutdoor: gameEnvironment.isOutdoor,
        factor: 1.0 // Calculate from weather
      },
      ballpark: {
        overall: 1.0,
        homeRuns: 1.0,
        extraBaseHits: 1.0,
        runs: 1.0
      },
      matchup: {
        advantage: 0.5,
        handedness: `${batter.handedness} vs ${opposingPitcher.throwsHand}`,
        history: {
          atBats: 0,
          hits: 0,
          homeRuns: 0,
          avg: 0
        }
      }
    },
    draftKings: {
      salary: draftKingsSalary,
      id: null,
      avgPointsPerGame: expected.totalPoints
    }
  };
}
```

## Gradual Migration with Adapters

When you need to work with both old and new code during the migration:

```typescript
import { Batter, BatterStats } from '../types/domain/player';
import { BatterSeasonStats } from '../types/player/batter';
import { BatterPointsBreakdown, BatterDFSPoints, convertToLegacyBatterDFSPoints } from '../types/analysis/scoring';

// Function expecting the legacy type
function legacyFunction(points: BatterDFSPoints) {
  // Old code using BatterDFSPoints
  console.log(`Total points: ${points.total}`);
}

// New function using modern types
function calculatePoints(batter: Batter): BatterPointsBreakdown {
  const stats = batter.currentSeason;
  
  // Calculate breakdown
  const breakdown: BatterPointsBreakdown = {
    singles: stats.hits - stats.doubles - stats.triples - stats.homeRuns,
    doubles: stats.doubles,
    triples: stats.triples,
    homeRuns: stats.homeRuns,
    runs: stats.runs,
    rbi: stats.rbi,
    walks: stats.walks,
    hitByPitch: stats.hitByPitches || 0,
    stolenBases: stats.stolenBases,
    totalHits: stats.hits,
    totalBases: 
      (stats.hits - stats.doubles - stats.triples - stats.homeRuns) + 
      stats.doubles * 2 + 
      stats.triples * 3 + 
      stats.homeRuns * 4,
    totalPoints: 0 // Will calculate
  };
  
  // Calculate total points
  breakdown.totalPoints = 
    breakdown.singles * 3 + 
    breakdown.doubles * 5 + 
    breakdown.triples * 8 + 
    breakdown.homeRuns * 10 + 
    breakdown.runs * 2 + 
    breakdown.rbi * 2 + 
    breakdown.walks * 2 + 
    breakdown.hitByPitch * 2 + 
    breakdown.stolenBases * 5;
  
  return breakdown;
}

// Using new code with legacy functions
function migrationExample(batter: Batter) {
  // Use new code
  const points = calculatePoints(batter);
  
  // Convert to legacy format for backward compatibility
  const legacyPoints = convertToLegacyBatterDFSPoints(points);
  
  // Use with legacy code
  legacyFunction(legacyPoints);
}
```

## Normalizing API Responses

```typescript
import { BatterApiResponse } from '../types/api/player';
import { batterFromApi, Batter } from '../types/domain/player';

// Get API response from anywhere (mock example)
const apiResponse: BatterApiResponse = {
  id: 123456,
  fullName: "Mike Trout",
  currentTeam: "Angels",
  primaryPosition: "CF",
  batSide: "R",
  seasonStats: {
    gamesPlayed: 100,
    atBats: 400,
    hits: 120,
    homeRuns: 30,
    rbi: 80,
    rbis: 80, // Duplicate field
    stolenBases: 10,
    avg: ".300", // String value
    obp: ".400", // String value
    slg: ".600", // String value
    ops: "1.000", // String value
    runs: 70,
    walks: 50,
    strikeouts: 100,
    doubles: 20,
    triples: 5,
    caughtStealing: 3,
    hitByPitches: 10,
    sacrificeFlies: 5,
    plateAppearances: 450,
  },
  careerStats: [],
  sourceTimestamp: new Date().toISOString(),
  __isApiSource: true
};

// Convert to domain model
const batter: Batter = batterFromApi(apiResponse);

// Now all properties are proper numbers, not strings
console.log(typeof batter.currentSeason.avg); // "number"
console.log(batter.currentSeason.avg); // 0.3

// Use domain model throughout application
const obpPlusSlg = batter.currentSeason.obp + batter.currentSeason.slg;
console.log(obpPlusSlg); // 1.0

// Calculate advanced metrics
const iso = batter.currentSeason.slg - batter.currentSeason.avg;
console.log(iso); // 0.3
```