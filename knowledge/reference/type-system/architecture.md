# MLB DFS Type System Architecture

## Overview

The MLB DFS application uses a three-layer type architecture designed to clearly separate concerns and provide type safety throughout the application. This approach enables clean boundaries between API data, domain objects, and fantasy-specific analysis.

## The Three-Layer Architecture

### 1. API Layer
**Purpose**: Represent raw API responses exactly as received from external sources.

**Location**: `/lib/mlb/types/api/`

**Key Characteristics**:
- Exact match to external API response structures
- String representations for numeric values (e.g., batting averages as strings)
- Complete representation of all API properties
- No business logic or transformations
- Minimal processing or validation

**Key Files**:
- `api/common.ts`: Shared types across API responses
- `api/player.ts`: Player-specific API types
- `api/game.ts`: Game and schedule API types
- `api/index.ts`: Re-exports all API types

**Usage Example**:
```typescript
import { Api } from '../types';

// Directly representing an API response
const gameData: Api.GameFeedApiResponse = await makeMLBApiRequest('/game/12345/feed/live');
```

### 2. Domain Layer
**Purpose**: Provide normalized business objects with proper types and validation.

**Location**: `/lib/mlb/types/domain/`

**Key Characteristics**:
- Converts string values to proper types (numbers, booleans, etc.)
- Normalized naming conventions and structures
- Adds convenience methods and calculated properties
- Provides validation through type guards
- Represents the core business model

**Key Files**:
- `domain/player.ts`: Player domain models (Batter, Pitcher)
- `domain/game.ts`: Game domain models
- `domain/index.ts`: Re-exports all domain types

**Usage Example**:
```typescript
import { Domain } from '../types';

// Using the domain model with proper types
const batter: Domain.Batter = await getBatterStats({ batterId: 123 });
console.log(batter.currentSeason.homeRuns); // Properly typed as number
```

### 3. Analysis Layer
**Purpose**: Provide fantasy-specific types for projections and analysis.

**Location**: `/lib/mlb/types/analysis/`

**Key Characteristics**:
- Builds on domain layer for fantasy-specific calculations
- Includes projections, ratings, and scoring types
- Contains DFS-specific scoring and statistics
- Represents the "view model" for fantasy baseball

**Key Files**:
- `analysis/batter.ts`: Batter analysis and projection types
- `analysis/pitcher.ts`: Pitcher analysis and projection types
- `analysis/scoring.ts`: DFS scoring calculation types
- `analysis/index.ts`: Re-exports all analysis types

**Usage Example**:
```typescript
import { Analysis } from '../types';

// Using analysis types for fantasy-specific operations
const projection: Analysis.BatterProjection = await projectBatter(batter, game);
console.log(projection.dfsPoints); // Fantasy-specific calculation
```

## Type Conversion Flow

The application follows a consistent pattern for converting between these layers:

1. **API → Domain**: Convert raw API responses to domain models
   ```typescript
   // API response converted to domain model
   function batterFromApi(apiResponse: Api.BatterApiResponse): Domain.Batter {
     return {
       id: apiResponse.id,
       fullName: apiResponse.fullName,
       // Convert string stats to numbers
       currentSeason: {
         gamesPlayed: Number(apiResponse.stats.gamesPlayed) || 0,
         homeRuns: Number(apiResponse.stats.homeRuns) || 0,
         // Additional conversions...
       },
       // Other properties...
     };
   }
   ```

2. **Domain → Analysis**: Enhance domain models with fantasy-specific calculations
   ```typescript
   // Domain model enhanced with analysis data
   function analyzeBatter(batter: Domain.Batter, game: Domain.Game): Analysis.BatterProjection {
     return {
       // Base player information
       playerId: batter.id,
       playerName: batter.fullName,
       
       // Fantasy-specific calculations
       dfsPoints: calculateDfsPoints(batter, game),
       homeRunProbability: estimateHomeRunProbability(batter, game),
       // Additional analysis...
     };
   }
   ```

## Type Guards and Validation

The architecture includes runtime type validation:

```typescript
// Type guard for Domain.Batter
export function isBatter(data: unknown): data is Domain.Batter {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'fullName' in data &&
    'currentSeason' in data
  );
}

// Usage in application code
function processBatter(data: unknown) {
  if (isBatter(data)) {
    // TypeScript now knows this is a valid Batter
    return analyzeBatter(data);
  }
  throw new Error('Invalid batter data');
}
```

## Directory Structure

```
/lib/mlb/types/
  ├── api/            # Raw API response types
  │   ├── common.ts   # Shared API types
  │   ├── game.ts     # Game API types
  │   ├── player.ts   # Player API types
  │   └── index.ts    # Re-exports
  │
  ├── domain/         # Normalized domain objects
  │   ├── game.ts     # Game domain types
  │   ├── player.ts   # Player domain types
  │   └── index.ts    # Re-exports
  │
  ├── analysis/       # Fantasy-specific types
  │   ├── batter.ts   # Batter analysis types
  │   ├── pitcher.ts  # Pitcher analysis types
  │   ├── scoring.ts  # DFS scoring types
  │   └── index.ts    # Re-exports
  │
  ├── environment/    # Environment types (weather, ballpark)
  │   ├── ballpark.ts # Ballpark factor types
  │   ├── weather.ts  # Weather data types
  │   └── index.ts    # Re-exports
  │
  └── index.ts        # Main re-export file
```

## Legacy Support

The system maintains backward compatibility through:

1. **Type Aliases**: Deprecated aliases for old type names
   ```typescript
   // Legacy alias in index.ts
   /** @deprecated Use Domain.Batter instead */
   export type MLBBatter = Domain.Batter;
   ```

2. **Raw Type Versions**: Simplified versions of complex types
   ```typescript
   /** @deprecated Use the structured version instead */
   export interface GameDataRaw {
     // Simple record structure for backward compatibility
     [key: string]: any;
   }
   ```

## Best Practices

1. **Import from the appropriate layer**:
   - Use API layer types for external API interactions
   - Use Domain layer types for core business logic
   - Use Analysis layer types for fantasy calculations

2. **Add type guards for runtime validation**:
   - Validate API responses before conversion
   - Use type guards at public boundaries
   - Add reasonable defaults for missing values

3. **Follow naming conventions**:
   - API layer: Original API names (e.g., `GameFeedApiResponse`)
   - Domain layer: Business entity names (e.g., `Game`, `Batter`)
   - Analysis layer: Fantasy-specific names (e.g., `BatterProjection`)

4. **Avoid direct string-to-number conversions**:
   - Let the domain model handle conversions
   - Use null coalescing for potentially missing values
   - Apply defaults consistently

5. **Add proper JSDoc comments**:
   - Document all public interfaces
   - Include examples where appropriate
   - Note any caveats or special handling

## Migration Status

The type system migration is complete. All modules now use the three-layer architecture. Legacy imports are still supported but marked as deprecated with JSDoc comments.