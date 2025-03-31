# MLB DFS Type Reference Guide

This document serves as a reference for the centralized type system used throughout the MLB DFS application. It provides information about the organization of types, naming conventions, and examples of usage.

## Type System Organization

Types are organized according to domain:

```
/lib/mlb/types/
├── index.ts                  # Main re-export file
├── core.ts                   # Core MLB data types
├── game.ts                   # Game scheduling and live feed types
├── statcast.ts               # Statcast data types
├── draftkings.ts             # DraftKings specific types
├── validation.ts             # Validation schema types
├── analysis/                 # Analysis-related types
│   ├── index.ts
│   ├── batter.ts             # Batter analysis types
│   ├── events.ts             # Game events types (hits, HRs, etc.)
│   ├── matchups.ts           # Batter-pitcher matchup types
│   └── pitcher.ts            # Pitcher analysis types
├── environment/              # Game environment types
│   ├── index.ts
│   ├── ballpark.ts           # Ballpark factors and dimensions
│   └── weather.ts            # Weather data types
└── player/                   # Player data types
    ├── index.ts
    ├── batter.ts             # Batter statistics
    ├── common.ts             # Shared player types
    ├── matchups.ts           # Player matchup statistics
    └── pitcher.ts            # Pitcher statistics
```

## Naming Conventions

Types follow these naming conventions:

1. **Interface Names**: PascalCase with descriptive domain prefix
   - Example: `BatterSeasonStats`, `PitcherVelocityTrend`, `GameEnvironmentData`

2. **Properties**: camelCase, avoiding abbreviations when possible
   - Prefer `runsBattedIn` or `rbi` over `RBIs`
   - Prefer `homeRuns` over `hrs`

3. **Type Categories**:
   - Raw API types: Prefix with source (e.g., `MLBWeatherData`, `StatcastMetrics`)
   - Analysis result types: Suffix with purpose (e.g., `HomeRunAnalysis`, `PitcherControlProfile`)
   - Validation schemas: Suffix with "Schema" (e.g., `PitchUsageSchema`)

4. **Consistency Rules**:
   - Player IDs are always named `id` or `playerId`, not type-specific like `batterId`
   - Team IDs are always named `teamId`
   - Consistent properties for similar concepts (e.g., always use `handedness` not `batSide` or `throwingArm`)

## Key Type Interfaces

### Core Player Types

- `MLBPlayer`: Base player information from MLB API
- `MLBBatter`: Extended batter information
- `MLBPitcher`: Extended pitcher information

### Statistical Types

- `BatterSeasonStats`: Season stats for a batter
- `PitcherSeasonStats`: Season stats for a pitcher
- `BatterStatcastData`: Statcast metrics for batters
- `PitcherStatcastData`: Statcast metrics for pitchers

### Analysis Types

- `HomeRunAnalysis`: Home run probability analysis
- `StrikeoutProjection`: Strikeout projection for pitchers
- `BatterQualityMetrics`: Quality metrics for batters
- `PitcherQualityMetrics`: Quality metrics for pitchers
- `WinProbabilityAnalysis`: Win probability analysis for pitchers

### Environment Types

- `GameEnvironmentData`: Weather and venue information
- `BallparkFactors`: Ballpark impact factors
- `WeatherImpactAnalysis`: Analysis of weather impacts on game

### DraftKings Types

- `DraftKingsPlayer`: Player data from DraftKings
- `DraftKingsScoringRules`: Scoring system rules

## Usage Examples

### Importing Types

```typescript
// Preferred method - import specific types directly from domain files
import { BatterSeasonStats } from "../types/player/batter";
import { HomeRunAnalysis } from "../types/analysis/events";

// Alternative - import from main index for common types
import { MLBPlayer, GameSchedule } from "../types";
```

### Type Composition

Use type composition to extend standardized interfaces with additional properties:

```typescript
// Extending a base interface with additional properties
function analyzePitcher(pitcher: PitcherSeasonStats): PitcherAnalysis & {
  confidenceScore: number;
  matchupAdvantage: boolean;
} {
  // Implementation...
}
```

### Using Generic Types

```typescript
// Using generics for flexible type handling
function processPlayerData<T extends MLBPlayer>(player: T, processor: (p: T) => any): any {
  // Implementation...
}
```

## Common Patterns

### Safe Property Access

When working with potentially undefined properties:

```typescript
// Safe access with defaults
const battingAverage = batterStats?.avg || 0;
const strikeoutRate = pitcherMetrics?.strikeoutRate ?? 0;
```

### Type Guards

For differentiating between similar types:

```typescript
// Type guard to check if player is a pitcher
function isPitcher(player: MLBPlayer): player is MLBPitcher {
  return (player as MLBPitcher).pitchingStats !== undefined;
}
```

## Type Validation

For runtime validation of data:

```typescript
// Import validation schema
import { PitcherStatsSchema } from "../types/validation";

// Validate data
const isValid = PitcherStatsSchema.safeParse(pitcherData);
if (isValid.success) {
  // Use the validated data
  const validatedData = isValid.data;
} else {
  // Handle validation errors
  console.error(isValid.error);
}
```

## Updates and Maintenance

When you need to update or add new types:

1. Identify the appropriate domain file for the type
2. Add the type with complete JSDoc documentation
3. Update the appropriate index.ts file if needed
4. Use consistent naming and structure patterns
5. Update this reference guide when adding major new type categories