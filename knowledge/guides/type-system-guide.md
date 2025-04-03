# MLB DFS Type System Guide

This guide provides practical advice for working with the MLB DFS type system. It covers how to use the three-layer architecture effectively and addresses common patterns and issues.

## Basic Concepts

The type system is organized into three layers:

1. **API Layer**: Raw API responses with string values
2. **Domain Layer**: Normalized data with proper types
3. **Analysis Layer**: DFS-specific types for projections

For a detailed architectural overview, see the [Type System Architecture](/knowledge/reference/type-system/architecture.md) document.

## Importing Types

### Recommended Patterns

For most use cases, import from the main types module:

```typescript
// Import all three layers
import { Api, Domain, Analysis } from '../types';

// Use types from each layer
const apiResponse: Api.GameFeedApiResponse = await fetchGame(gameId);
const game: Domain.Game = convertToGame(apiResponse);
const projection: Analysis.GameProjection = analyzeGame(game);
```

For specific type needs, import directly from the appropriate module:

```typescript
// Direct imports for specific use cases
import { Batter, Pitcher } from '../types/domain/player';
import { BatterProjection } from '../types/analysis/batter';
```

### Avoid Legacy Imports

These patterns are supported but deprecated:

```typescript
// ❌ Legacy imports - AVOID
import { MLBBatter } from '../types/player';
import { GameData } from '../types/game';
```

Instead, use the proper layer-specific imports:

```typescript
// ✅ Proper imports
import { Batter } from '../types/domain/player';
import { GameData } from '../types/api/game';
```

## Working with API Data

### Fetching and Converting

When working with external APIs:

```typescript
import { Api, Domain } from '../types';
import { makeMLBApiRequest } from '../core/api-client';

// 1. Fetch API data with the appropriate API type
const apiResponse: Api.BatterApiResponse = await makeMLBApiRequest<Api.BatterApiResponse>(
  `/people/${batterId}?hydrate=stats(group=[hitting],type=[yearByYear])`,
  'V1'
);

// 2. Convert to domain model
const batter: Domain.Batter = batterFromApi(apiResponse);

// 3. Use the domain model in your application
console.log(`${batter.fullName}: ${batter.currentSeason.homeRuns} HR`);
```

### Handling Missing Data

The domain layer includes proper nullability and defaults:

```typescript
// Safe property access with proper defaults
const homeRuns = batter.currentSeason?.homeRuns ?? 0;
const slugging = batter.currentSeason?.slg ?? 0.0;

// Type guards for runtime validation
if (Domain.isBatter(unknownData)) {
  // TypeScript knows unknownData is a Batter here
  return processValidBatter(unknownData);
}
```

## Working with Domain Objects

### Player Data Access

The domain objects provide consistent, normalized access to player data:

```typescript
// Batter data access
const batter: Domain.Batter = await getBatterStats({ batterId });

// Current season stats (properly typed as numbers)
const currentHomeRuns = batter.currentSeason.homeRuns;
const currentAvg = batter.currentSeason.avg;

// Career stats by year
Object.entries(batter.careerByYear).forEach(([year, stats]) => {
  console.log(`${year}: ${stats.homeRuns} HR, ${stats.avg} AVG`);
});

// Team information
const teamId = batter.teamId;
const teamName = batter.teamName;
```

### Game Data Access

Game data follows similar patterns:

```typescript
const game: Domain.Game = await getGameData(gameId);

// Game metadata
console.log(`${game.awayTeam.name} @ ${game.homeTeam.name}`);
console.log(`Start time: ${game.startTime}`);

// Game environment
if (game.environment) {
  console.log(`Temperature: ${game.environment.temperature}°F`);
  console.log(`Wind: ${game.environment.windSpeed} mph ${game.environment.windDirection}`);
}
```

## Working with Analysis Types

### Creating Projections

Analysis types build on domain objects to add fantasy-specific calculations:

```typescript
import { Domain, Analysis } from '../types';

// Create a batter projection
function projectBatter(
  batter: Domain.Batter,
  game: Domain.Game,
  opposingPitcher: Domain.Pitcher
): Analysis.BatterProjection {
  return {
    // Player identification
    playerId: batter.id,
    playerName: batter.fullName,
    
    // Game context
    gameId: game.id,
    opposingPitcherId: opposingPitcher.id,
    isHome: batter.teamId === game.homeTeam.id,
    
    // Projections
    expectedHits: calculateExpectedHits(batter, opposingPitcher),
    homeRunProbability: estimateHomeRunProbability(batter, opposingPitcher, game),
    
    // DFS-specific
    dfsPoints: calculateDfsPoints(batter, opposingPitcher, game),
    salary: getSalary(batter.id),
    value: calculateValue(batter.id),
  };
}
```

### Using Projections

Analysis types provide fantasy-specific properties and calculations:

```typescript
const projection: Analysis.BatterProjection = await getBatterProjection(batterId, gameId);

// DFS-specific properties
console.log(`Projected points: ${projection.dfsPoints.total}`);
console.log(`Salary: $${projection.salary}`);
console.log(`Value: ${projection.value} pts/$`);

// Category breakdowns
console.log(`HR probability: ${projection.homeRunProbability * 100}%`);
console.log(`Expected hits: ${projection.expectedHits.total}`);
```

## Common Patterns

### Working with Career Data

Career data is now stored in an object by year:

```typescript
// ❌ Old pattern (array iteration)
batterData.careerStats.forEach(season => {
  if (season.season === '2022') {
    // Process 2022 stats
  }
});

// ✅ New pattern (object by year)
const season2022 = batter.careerByYear['2022'];
if (season2022) {
  // Process 2022 stats
}

// Iterate all seasons
Object.entries(batter.careerByYear).forEach(([year, stats]) => {
  // Process each season
});
```

### Handling Optional Properties

Use null coalescing operators consistently:

```typescript
// ❌ Inconsistent handling
const hits = stats.hits || 0;
const homeRuns = stats.homeRuns ? stats.homeRuns : 0;
const rbi = stats.rbi !== undefined ? stats.rbi : 0;

// ✅ Consistent handling with null coalescing
const hits = stats.hits ?? 0;
const homeRuns = stats.homeRuns ?? 0;
const rbi = stats.rbi ?? 0;
```

### Runtime Type Validation

Use type guards for runtime validation:

```typescript
import { isBatter, isPitcher } from '../types/domain/player';

function processPlayer(playerData: unknown) {
  if (isBatter(playerData)) {
    // Process batter data
    return analyzeBatter(playerData);
  }
  
  if (isPitcher(playerData)) {
    // Process pitcher data
    return analyzePitcher(playerData);
  }
  
  throw new Error('Invalid player data');
}
```

## Troubleshooting

### Common Issues and Solutions

#### "Property does not exist on type"

```typescript
// Error: Property 'teams' does not exist on type 'GameData'
const homeTeam = gameData.teams.home;
```

**Solution**: Verify you're using the correct layer. API types match the exact API response structure:

```typescript
// If working with API layer:
const homeTeam = gameData.gameData.teams.home;

// If working with Domain layer:
const homeTeam = game.homeTeam;
```

#### "Type 'string' is not assignable to type 'number'"

```typescript
// Error: Type 'string' is not assignable to type 'number'
const homeRuns: number = apiData.stats.homeRuns;
```

**Solution**: Convert API data to domain model:

```typescript
// Convert to domain model first
const batter = batterFromApi(apiData);
const homeRuns = batter.currentSeason.homeRuns; // Already a number
```

#### "Property is undefined"

```typescript
// Error: Cannot read property 'avg' of undefined
const avg = batter.currentSeason.avg;
```

**Solution**: Use optional chaining and null coalescing:

```typescript
const avg = batter.currentSeason?.avg ?? 0;
```

## Advanced Topics

### Creating Custom Type Guards

```typescript
// Custom type guard for your own types
function isValidProjection(data: unknown): data is BatterProjection {
  return (
    typeof data === 'object' &&
    data !== null &&
    'playerId' in data &&
    'dfsPoints' in data &&
    typeof data.dfsPoints === 'number'
  );
}
```

### Type Conversion Utilities

```typescript
// Helper to convert API player to domain player
function convertApiPlayerToDomain(apiPlayer: Api.PlayerApiResponse): Domain.Player {
  // Type discriminator
  const isPitcher = apiPlayer.primaryPosition?.code === 'P';
  
  if (isPitcher) {
    return {
      id: apiPlayer.id,
      fullName: apiPlayer.fullName,
      // Pitcher-specific properties...
    } as Domain.Pitcher;
  } else {
    return {
      id: apiPlayer.id,
      fullName: apiPlayer.fullName,
      // Batter-specific properties...
    } as Domain.Batter;
  }
}
```

## Further Reference

- [Type System Architecture](/knowledge/reference/type-system/architecture.md): Detailed architecture overview
- [Type System Examples](/knowledge/reference/type-system/examples.md): Code examples for common scenarios
- [API Layer](/knowledge/reference/type-system/api-layer.md): Detailed API layer reference
- [Domain Layer](/knowledge/reference/type-system/domain-layer.md): Detailed domain layer reference
- [Analysis Layer](/knowledge/reference/type-system/analysis-layer.md): Detailed analysis layer reference