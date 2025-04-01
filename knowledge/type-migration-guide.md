# MLB DFS Type System Migration Guide

This document provides a step-by-step guide for migrating modules to the new three-layer type architecture. It includes patterns, examples, and common issues that you'll encounter during the migration process.

## The Three-Layer Type Architecture

Our type system is organized into three distinct layers:

1. **API Layer**: Raw API responses with string values
   - Located in `/lib/mlb/types/api`
   - Represents data exactly as received from external APIs
   - Typically has string values for numeric fields (e.g., `"avg": "0.280"`)
   - Minimal processing, matches actual API shape

2. **Domain Layer**: Normalized data with proper types
   - Located in `/lib/mlb/types/domain`
   - Converts API data to proper types (strings to numbers, etc.)
   - Provides a consistent interface for application code
   - Adds convenience calculations and normalized access patterns
   - Provides validation and type guards for runtime safety

3. **Analysis Layer**: DFS-specific types for projections
   - Located in `/lib/mlb/types/analysis`
   - Builds on domain layer for fantasy sports specific calculations
   - Includes projections, ratings, and scoring-specific types
   - Specific to fantasy scoring and projections

## Migration Checklist

For each module you're migrating, follow these steps in order:

1. **Analysis and Planning**
   - Examine the imports to understand dependencies
   - Identify all @ts-ignore comments
   - Note all references to API properties like `seasonStats`
   - Check for string-to-number conversions

2. **Type Structure Updates**
   - Update imports to use domain layer types
   - Add missing imports from domain layer 
   - Update function signatures with proper return types
   - Import and use type guards for runtime validation

3. **Implementation Migration**
   - Replace `playerData.seasonStats` with `playerData.currentSeason`
   - Replace `playerData.careerStats` with `playerData.careerByYear`
   - Update property names to match domain model (e.g., batSide → handedness)
   - Remove manual string-to-number conversions
   - Use converter functions for API responses
   - Consider creating adapters for backward compatibility

4. **Test and Verify**
   - Create a focused test script for the module
   - Test all functions with real player data
   - Verify error handling with invalid data
   - Run the linter to ensure code quality
   - Remove any `// @ts-ignore` comments

## Common Migration Patterns

### 1. Updating Imports

```typescript
// Before
import { BatterCareerStats } from "../types/player";

// After
import { Batter, BatterStats } from "../types/domain/player";
```

### 2. Replacing seasonStats References

```typescript
// Before
const batting = playerData.seasonStats;
if (!batting || !batting.gamesPlayed) {
  return null;
}

// After
const batting = playerData.currentSeason;
if (!batting || !batting.gamesPlayed) {
  return null;
}
```

### 3. Updating Career Data Access

```typescript
// Before
playerData.careerStats.forEach((season) => {
  const seasonRuns = "runs" in season ? (season.runs as number) || 0 : 0;
  // More code...
});

// After
Object.entries(playerData.careerByYear).forEach(([seasonYear, seasonStats]) => {
  const seasonRuns = seasonStats.runs || 0;
  // More code...
});
```

### 4. Removing String-to-Number Conversions

```typescript
// Before
const ip = parseFloat(stats.inningsPitched.toString());
const era = parseFloat(stats.era.toString()) || 4.5;

// After
const ip = stats.inningsPitched;
const era = stats.era || 4.5;
```

### 5. Updating Team References

```typescript
// Before
const teamContext = await getTeamOffensiveContext(playerData.currentTeam.id);

// After
const teamId = playerData.teamId || 0;
const teamContext = await getTeamOffensiveContext(teamId);
```

## Module-Specific Migration Notes

### 1. hits.ts Migration

Key changes:
- Updated all `playerData.seasonStats` references to `playerData.currentSeason`
- Fixed getMatchupHitStats and getBatterPlatoonSplits to use the domain model 
- Updated batSide references to handedness
- Removed all @ts-ignore comments and fixed underlying issues

### 2. run-production.ts Migration

Key changes:
- Updated all seasonStats references to currentSeason
- Fixed getCareerRunProductionProfile to use careerByYear instead of careerStats
- Updated teamId references to use domain model
- Removed manual string-to-number conversions in getPitcherRunAllowance

## Testing Your Migration

For each module, create a test script that:

1. Tests all exported functions with real player data
2. Verifies proper error handling with invalid data
3. Checks that the function returns match the expected types

Example test script structure:
```typescript
async function testFunction(name, fn, expectedType) {
  try {
    const result = await fn();
    console.log(`${name}: ${result ? "Success" : "Failed"}`);
    // Verify result structure matches expected type
  } catch (error) {
    console.error(`Error in ${name}:`, error);
  }
}
```

## Common Issues and Solutions

### Missing Properties in Domain Model

**Problem**: The domain model might not have all properties from the API model.

**Solution**: Use optional chaining and default values.
```typescript
const runs = batting?.runs || 0;
```

### careerByYear Structure Differences

**Problem**: careerByYear is an object with year keys, not an array like careerStats.

**Solution**: Use Object.entries() to iterate.
```typescript
Object.entries(playerData.careerByYear).forEach(([year, stats]) => {
  // Use stats object directly
});
```

### Team ID Access

**Problem**: The team structure is different in the domain model.

**Solution**: Use playerData.teamId instead of playerData.currentTeam.id.

## Next Modules for Migration

Based on dependencies and complexity, here's the recommended order for migration:

1. ✅ hits.ts
2. ✅ run-production.ts
3. plate-discipline.ts
4. pitcher-control.ts
5. strikeouts.ts
6. innings-pitched.ts
7. home-runs.ts
8. stolen-bases.ts
9. batter-analysis.ts
10. starting-pitcher-analysis.ts