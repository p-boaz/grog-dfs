# MLB Type System Migration Guide

This guide shows how to migrate from the old, problematic type system to the new, structured type system.

## New Type System Structure

The new type system is organized in layers:

1. **API Layer**: Raw types directly matching API responses

   - Located in `lib/mlb/types/api/`
   - Minimal processing, matches actual API shape
   - Includes string representations and original structure

2. **Domain Layer**: Normalized and processed data

   - Located in `lib/mlb/types/domain/`
   - Converts strings to proper numbers
   - Adds convenience calculations
   - Provides validation and type guards

3. **Analysis Layer**: Specialized types for DFS analysis
   - Located in `lib/mlb/types/analysis/`
   - Specific to fantasy scoring and projections
   - Builds on domain types

## Migration Examples

### Example 1: Accessing Batter Stats

#### Old approach:

```typescript
import { BatterSeasonStats } from "../types/player/batter";

function calculateBattingAverage(stats: BatterSeasonStats): number {
  // Have to handle string values and missing stats
  return stats.avg !== undefined
    ? parseFloat(stats.avg as any)
    : stats.hits / stats.atBats || 0;
}
```

#### New approach:

```typescript
import { BatterStats, isBatterStats } from "../types/domain/player";

function calculateBattingAverage(stats: BatterStats): number {
  // Type validation
  if (!isBatterStats(stats)) {
    throw new Error("Invalid batter stats provided");
  }

  // .avg is already a number in the domain type
  return stats.avg;
}
```

### Example 2: Processing API Responses

#### Old approach:

```typescript
import { getBatterStats } from "../player/batter-stats";
import { BatterSeasonStats } from "../types/player/batter";

async function getBatterData(batterId: number): Promise<BatterSeasonStats> {
  try {
    const data = await getBatterStats({ batterId });

    // Have to convert string values to numbers
    return {
      gamesPlayed: data.seasonStats.gamesPlayed || 0,
      atBats: data.seasonStats.atBats || 0,
      hits: data.seasonStats.hits || 0,
      homeRuns: data.seasonStats.homeRuns || 0,
      rbi: data.seasonStats.rbi || 0,
      avg: parseFloat(data.seasonStats.avg || "0"),
      // ... many more conversions
    };
  } catch (error) {
    console.error("Error fetching batter stats:", error);
    return {
      /* empty stats */
    };
  }
}
```

#### New approach:

```typescript
import { getBatterStats } from "../player/batter-stats";
import { batterFromApi } from "../types/domain/player";

async function getBatterData(batterId: number) {
  try {
    const apiResponse = await getBatterStats({ batterId });

    // Convert API response to domain model
    const batter = batterFromApi(apiResponse);

    // Access normalized stats
    return batter.currentSeason;
  } catch (error) {
    console.error("Error fetching batter stats:", error);
    return null;
  }
}
```

### Example 3: Type Guards for Runtime Safety

#### Old approach:

```typescript
function processBatterStats(stats: any) {
  // No way to validate if stats has the right shape

  // Have to manually check each property
  if (!stats || typeof stats !== "object" || !stats.gamesPlayed) {
    return { gamesPlayed: 0, atBats: 0, hits: 0, avg: 0 };
  }

  // Process the stats...
}
```

#### New approach:

```typescript
import {
  BatterStats,
  isBatterStats,
  createEmptyBatterStats,
} from "../types/domain/player";

function processBatterStats(stats: unknown): BatterStats {
  // Use type guard to validate at runtime
  if (!isBatterStats(stats)) {
    return createEmptyBatterStats();
  }

  // TypeScript now knows this is BatterStats
  // Process the stats...
  return stats;
}
```

## Gradual Migration Strategy

1. **Start with API boundaries**:

   - Implement the new types at API request/response level first
   - Convert API responses to domain models immediately after fetching

2. **Use adapters for backward compatibility**:

   - Create adapters that convert between old and new types
   - Gradually replace old types without breaking existing code

3. **Update one module at a time**:

   - Begin with foundational modules that others depend on
   - Work outward to modules that use those dependencies

4. **Add validation at runtime**:
   - Use type guards to validate data at runtime
   - Add comprehensive error handling for invalid data

## Key Benefits

1. **Match Reality**: Types now match actual API responses
2. **Validation**: Runtime validation ensures data consistency
3. **Normalization**: String values properly converted to numbers
4. **Safety**: Optional chaining and nullish coalescing reduce errors
5. **Maintainability**: Layered approach separates concerns

## Migration Checklist

For each module you migrate:

- [ ] Update imports to use the new types
- [ ] Use converter functions for API responses
- [ ] Replace manual property access with domain objects
- [ ] Add type guards for runtime validation
- [ ] Update tests to use the new types
- [ ] Remove any `// @ts-ignore` comments
- [ ] Run the linter and type checker
