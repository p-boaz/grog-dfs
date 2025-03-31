# MLB DFS Type System Examples

This document provides practical examples of how to use the centralized type system in the MLB DFS application.

## Basic Type Import Patterns

```typescript
// Import from specific domain files (preferred)
import { BatterSeasonStats } from "../types/player/batter";
import { PitcherSeasonStats } from "../types/player/pitcher";
import { HomeRunAnalysis } from "../types/analysis/events";

// Import from index files for convenience
import { BatterStats, PitcherStats } from "../types/player";
import { GameSchedule, ProbableLineup } from "../types";
```

## Function Return Type Examples

```typescript
import { BatterSeasonStats } from "../types/player/batter";
import { HomeRunAnalysis } from "../types/analysis/events";
import { BallparkFactors } from "../types/environment/ballpark";

// Basic function with return type
function getBatterStats(playerId: number): BatterSeasonStats {
  // Implementation...
  return {
    id: playerId,
    name: "Player Name",
    season: "2025",
    team: "Team Name",
    gamesPlayed: 150,
    plateAppearances: 600,
    atBats: 550,
    runs: 80,
    hits: 165,
    doubles: 30,
    triples: 5,
    homeRuns: 25,
    rbi: 85,
    stolenBases: 10,
    caughtStealing: 3,
    baseOnBalls: 45,
    strikeouts: 120,
    avg: 0.300,
    obp: 0.375,
    slg: 0.510,
    ops: 0.885,
    // Advanced metrics
    babip: 0.315,
    iso: 0.210,
    hrRate: 0.045,
    kRate: 0.200,
    bbRate: 0.075,
    sbRate: 0.770
  };
}

// Function with complex return type and default values
function calculateHRProbability(
  batter: BatterSeasonStats, 
  parkFactor: BallparkFactors
): HomeRunAnalysis {
  // Safe access with defaults
  const batterHrRate = batter.hrRate || 0;
  const parkHrFactor = parkFactor.types.homeRuns || 1.0;
  
  // Implementation...
  return {
    playerId: batter.id,
    probability: 0.075 * batterHrRate * parkHrFactor,
    expectation: 0.075 * batterHrRate * parkHrFactor * 10, // HR points value
    factors: {
      batterPower: 0.65,
      recentForm: 0.55,
      parkFactor: parkHrFactor,
      weather: 1.02
    },
    confidenceScore: 65,
    baseProjection: 0.065
  };
}
```

## Type Composition Examples

```typescript
import { BatterQualityMetrics } from "../types/analysis/batter";
import { BatterSeasonStats } from "../types/player/batter";

// Extending interfaces with intersection types
function getQualityProfile(batter: BatterSeasonStats): BatterQualityMetrics & {
  tier: "Elite" | "Above Average" | "Average" | "Below Average";
  valueRating: number;
} {
  // Calculate the base metrics
  const qualityMetrics: BatterQualityMetrics = {
    contactQuality: calculateContactQuality(batter),
    powerMetrics: calculatePowerMetrics(batter),
    disciplineMetrics: calculateDisciplineMetrics(batter),
    speedScore: calculateSpeedScore(batter),
    overall: calculateOverallQuality(batter)
  };
  
  // Add extended properties
  const tier = determineTier(qualityMetrics.overall);
  const valueRating = calculateValueRating(qualityMetrics, batter);
  
  // Return combined type
  return {
    ...qualityMetrics,
    tier,
    valueRating
  };
}
```

## Safe Type Handling

```typescript
import { PitcherStatcastData } from "../types/statcast";
import { PitcherSeasonStats } from "../types/player/pitcher";

// Handle potentially undefined data
function combinePitcherData(
  seasonStats?: PitcherSeasonStats, 
  statcastData?: PitcherStatcastData
): PitcherSeasonStats & { 
  hasStatcast: boolean;
  qualityScore?: number;
} {
  // Create default stats if undefined
  const stats: PitcherSeasonStats = seasonStats || {
    id: 0,
    name: "Unknown",
    team: "Unknown",
    season: "2025",
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    gamesStarted: 0,
    inningsPitched: 0,
    hits: 0,
    runs: 0,
    earnedRuns: 0,
    homeRuns: 0,
    hitBatsmen: 0,
    walks: 0,
    strikeouts: 0,
    era: 0,
    whip: 0
  };
  
  // Check if Statcast data exists
  const hasStatcast = !!statcastData;
  
  // Calculate quality score only if Statcast exists
  const qualityScore = hasStatcast ? 
    calculateQualityScore(stats, statcastData) : 
    undefined;
    
  // Return combined object
  return {
    ...stats,
    hasStatcast,
    qualityScore
  };
}

// Helper function for type example
function calculateQualityScore(
  stats: PitcherSeasonStats, 
  statcast?: PitcherStatcastData
): number {
  return 50; // Simplified for example
}
```

## Type Guards Example

```typescript
import { MLBPlayer } from "../types/core";
import { MLBPitcher, MLBBatter } from "../types/player";

// Type guard functions
function isPitcher(player: MLBPlayer): player is MLBPitcher {
  return (player as MLBPitcher).pitchingStats !== undefined;
}

function isBatter(player: MLBPlayer): player is MLBBatter {
  return (player as MLBBatter).battingStats !== undefined;
}

// Function using type guards
function processPlayer(player: MLBPlayer): string {
  if (isPitcher(player)) {
    // TypeScript knows this is a pitcher
    return `Pitcher ${player.name} with ERA ${player.pitchingStats.era}`;
  } else if (isBatter(player)) {
    // TypeScript knows this is a batter
    return `Batter ${player.name} with AVG ${player.battingStats.avg}`;
  } else {
    return `Unknown player type: ${player.name}`;
  }
}
```

## Generic Type Example

```typescript
import { BatterSeasonStats } from "../types/player/batter";
import { PitcherSeasonStats } from "../types/player/pitcher";

// Generic function that works with both batter and pitcher stats
function getFantasyPoints<T extends { id: number; name: string }>(
  player: T,
  calculatePoints: (player: T) => number
): { 
  playerId: number; 
  name: string; 
  points: number;
  timestamp: Date;
} {
  return {
    playerId: player.id,
    name: player.name,
    points: calculatePoints(player),
    timestamp: new Date()
  };
}

// Usage example
const batterPoints = getFantasyPoints(
  batterStats,
  (batter: BatterSeasonStats) => calculateBatterFantasyPoints(batter)
);

const pitcherPoints = getFantasyPoints(
  pitcherStats,
  (pitcher: PitcherSeasonStats) => calculatePitcherFantasyPoints(pitcher)
);
```

These examples demonstrate the key patterns for using the centralized type system effectively in the MLB DFS application.