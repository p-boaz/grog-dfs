# MLB DFS Type System Migration Guide

This document provides a step-by-step guide for migrating modules to the new three-layer type architecture. It includes patterns, examples, and common issues that you'll encounter during the migration process.

**Current Status**: 12 of 12 modules migrated (100% complete). All batter and pitcher modules completed.

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

### Batter Modules

#### 1. batters/hits.ts Migration

Key changes:
- Updated all `playerData.seasonStats` references to `playerData.currentSeason`
- Fixed getMatchupHitStats and getBatterPlatoonSplits to use the domain model 
- Updated batSide references to handedness
- Removed all @ts-ignore comments and fixed underlying issues

#### 2. batters/run-production.ts Migration

Key changes:
- Updated all seasonStats references to currentSeason
- Fixed getCareerRunProductionProfile to use careerByYear instead of careerStats
- Updated teamId references to use domain model
- Removed manual string-to-number conversions in getPitcherRunAllowance

#### 3. shared/plate-discipline.ts Migration

Key changes:
- Updated all playerData.seasonStats references to playerData.currentSeason
- Implemented better error handling with default values for pitchers
- Replaced manual string-to-number conversions with direct property access
- Added proper type definitions with exported interfaces
- Updated careerStats references to use careerByYear
- Fixed return types to match domain model standards
- Improved validation with proper type guards

#### 4. batters/home-runs.ts Migration

Key changes:
- Updated all seasonStats references to currentSeason
- Changed careerStats array references to use careerByYear object structure
- Added proper type casting for Batter and Pitcher objects
- Incorporated isBatterStats type guard for safer data handling
- Added proper null checks for properties that may not exist
- Fixed data access patterns to match the domain model
- Improved handling of nested object properties with proper null checks

#### 5. batters/stolen-bases.ts Migration

Key changes:
- Updated all seasonStats references to currentSeason
- Converted careerStats array iteration to careerByYear object structure
- Added explicit Batter type casting for proper type checking
- Implemented proper null checks for optional properties
- Added isBatterStats type guard to validate data integrity
- Updated teamId access to use the domain model pattern
- Fixed potential type issues with proper null coalescing
- Updated interface to align with domain model standards

#### 6. batters/batter-analysis.ts Migration

Key changes:
- Updated all playerData.seasonStats references to use enhancedBatterData.currentSeason
- Added explicit Batter type for enhanced batter data (getEnhancedBatterData)
- Implemented proper type guards with isBatterStats for better runtime validation
- Updated all references to player handedness (batSide → handedness)
- Converted stat access to use domain model properties
- Added proper null coalescing for potentially undefined values
- Created a new mapSeasonStatsFromBatterStats helper for proper mapping
- Updated estimateBatterPoints to use BatterStats instead of SeasonStats
- Improved error handling with proper type checking and validation
- Reduced the number of @ts-ignore comments by fixing the underlying issues

### Pitcher Modules

#### 1. pitchers/pitcher-control.ts Migration

Key changes:
- Updated all seasonStats references to currentSeason using getEnhancedPitcherData
- Explicitly typed pitcher data with `const enhancedPitcherData: Pitcher = await getEnhancedPitcherData()`
- Added isPitcherStats type guard for runtime validation of pitcher data
- Converted careerStats array loop to Object.entries(careerByYear) iteration
- Replaced manual string-to-number conversions (parseFloat) with direct access
- Added proper null checks and coalescing for properties that may be undefined
- Fixed getCareerControlProfile to use careerByYear instead of careerStats array
- Updated getBatterControlFactors to use enhanced batter data with proper typing
- Improved error handling with detailed warning messages
- Enhanced code consistency and readability with domain model patterns

#### 2. pitchers/strikeouts.ts Migration

Key changes:
- Updated imports to use domain layer types including Pitcher and isPitcherStats
- Added explicit typing with `const pitcherData: EnhancedPitcherData = await getEnhancedPitcherData()`
- Implemented isPitcherStats type guard for runtime validation
- Changed property access from API-style to domain model style
- Updated `pitcherData.currentTeam` to match the EnhancedPitcherData interface
- Added null checks for pitch data properties with null coalescing operators
- Improved error handling with getDefaultStrikeoutProjection helper
- Added proper null coalescing for potentially undefined pitch mix properties
- Fixed property references to match domain model
- Corrected import paths after directory reorganization

#### 3. pitchers/innings-pitched.ts Migration

Key changes:
- Updated imports to reflect the new directory structure (e.g., weather/weather)
- Added explicit typing with `const pitcherData: EnhancedPitcherData = await getEnhancedPitcherData()`
- Simplified type checking by removing unnecessary conditionals (e.g., `typeof gamesStarted === "number"`)
- Updated direct property access without type conversion (numbers are already properly typed)
- Added null coalescing operators for potentially undefined values
- Simplified the data extraction from complex objects by directly accessing properties
- Improved type safety in the `calculateCompleteGamePotential` function
- Maintained clear error handling with meaningful default values
- Fixed import path references for dependencies
- Kept consistent validation patterns with the rest of the codebase

#### 4. pitchers/pitcher-win.ts Migration

Key changes:
- Updated imports to use correct paths after directory reorganization (e.g., "../../weather/weather")
- Added enhanced pitcher data service with explicit types `const pitcherData = await getEnhancedPitcherData(pitcherId, season)`
- Removed unnecessary string-to-number conversions by using the properly typed domain model
- Simplified conditional checks by removing type checking (e.g., `typeof stats.era === "number"`)
- Fixed data access patterns to use EnhancedPitcherData properties directly
- Maintained business logic while improving type safety throughout
- Added proper error handling patterns with default values
- Fixed getTeamIdByName to work with the enhanced data service
- Made extensive use of null coalescing for potentially missing values
- Simplified complex object extraction with direct property access
- Added proper import for domain model types (Pitcher, EnhancedPitcherData)
- Removed debug console.log statements for cleaner production code

#### 5. pitchers/rare-events.ts Migration

Key changes:
- Updated import paths to use correct paths after directory reorganization (e.g., "../../weather/weather")
- Switched to enhanced pitcher data service with explicit types for both functions
- Improved error handling with catch blocks for Promise.all when fetching previous season data
- Updated data access patterns for career stats to use careerStats array properly
- Maintained consistent domain model access patterns for stats properties
- Renamed variables to better match the domain model structure
- Improved data extraction from the enhanced pitcher data model
- Added proper imports for domain model types (Pitcher, EnhancedPitcherData)
- Kept the same business logic while making the code more type-safe
- Added explicit type checking for better runtime reliability
- Simplified career stats calculation by accessing properly typed properties
- Updated both functions to use the domain model's data structure
- Added proper type handling for null values with coalescing operators
- Cleaned up type access for function parameters and return values

#### 6. pitchers/starting-pitcher-analysis.ts Migration

Key changes:
- Added import for enhanced pitcher data service (getEnhancedPitcherData and EnhancedPitcherData)
- Replaced direct calls to getPitcherStats with getEnhancedPitcherData
- Added a new getHomeRunVulnerability helper function to encapsulate HR vulnerability calculation
- Implemented calculateHrVulnerability function that works with EnhancedPitcherData
- Fixed multi-season data handling to work properly with domain model properties
- Simplified type checking by using null coalescing operators (e.g., `stats.era ?? null`)
- Removed string-to-number conversions that were no longer needed
- Fixed path references for imports related to directory reorganization
- Added isPitcherStats type guard import for improved type safety
- Improved error handling with specific catch blocks for each projection function
- Maintained the same return types and interfaces for backward compatibility
- Used more explicit typing with the EnhancedPitcherData interface
- Replaced manual string-to-number conversions with direct property access
- Improved null handling for potentially undefined properties
- Created a cleaner pattern for accessing multi-season data

#### 7. shared/quality-metrics.ts Migration

Key changes:
- Updated import from BatterStats to use domain model types (`import { BatterStats, isBatterStats } from "../../types/domain/player";`)
- Added type validation using isBatterStats type guard before processing stats
- Added getDefaultQualityMetrics helper function to centralize default values
- Improved error handling with proper fallback to default metrics
- Maintained the same algorithm and scoring calculations
- Made function parameter types more explicit with BatterStats from domain model
- Converted SeasonStats import to BatterStats for better type safety
- Added JSDoc comments with improved parameter descriptions

#### 8. shared/aggregate-scoring.ts Migration

Key changes:
- Added import for getEnhancedPitcherData from pitcher data service
- Added import for isPitcherStats type guard for runtime validation
- Replaced dynamic import of makeMLBApiRequest with explicit import
- Added type validation with isPitcherStats before accessing pitcher properties
- Improved handling of pitcher quality metrics using domain model properties
- Added better error handling and fallback defaults
- Used conditional property access with null coalescing for safety
- Improved code organization with updated calculations for quality metrics
- Added safer property access for k9, durability, and hr vulnerability calculations
- Maintained existing output interface for backward compatibility
- Enhanced error reporting with improved logging
- Simplified function structure while maintaining same behavior

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

### Updating Import Paths After Directory Reorganization

**Problem**: After moving files to the new directory structure, relative imports may break. For example, you might see errors like `Cannot find module '../game/game-feed'`.

**Solution**: Update import paths to reflect the new directory structure. For files moved to subdirectories like `/pitchers/`, you'll need to adjust relative paths with additional `../` as needed.

```typescript
// Before (when file was in /lib/mlb/dfs-analysis/)
import { getGameData } from '../game/game-feed';

// After (when file is in /lib/mlb/dfs-analysis/pitchers/)
import { getGameData } from '../../game/game-feed';
```

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

### Runtime Type Safety

**Problem**: Need to validate data structure at runtime.

**Solution**: Use provided type guards for runtime validation.
```typescript
import { isBatterStats, createEmptyBatterStats } from "../types/domain/player";

function processBatterStats(stats: unknown) {
  // Validate at runtime
  if (!isBatterStats(stats)) {
    return createEmptyBatterStats();
  }
  
  // TypeScript now knows this is valid BatterStats
  return stats;
}
```

### Handling Empty or Missing Stats

**Problem**: Stats might be missing or have undefined values for certain properties.

**Solution**: Always use null coalescing operators for potentially missing values.
```typescript
const stolenBases = stats.stolenBases || 0;
const batterTeamId = enhancedBatterData.teamId || 0;
```

### Test Data Limitations

**Problem**: Test environment might not have complete player data, causing tests to fail.

**Solution**: Create default return values and add robust error handling.
```typescript
// Return reasonable defaults when errors occur
if (!pitcherData || !pitcherData.currentSeason) {
  return createDefaultPitcherProfile();
}
```

### Testing Challenges with Dependencies

**Problem**: Integration testing modules with numerous dependencies can be challenging when those dependencies require real API data.

**Solution**: 
1. Focus unit tests on self-contained functions that don't depend on external modules.
2. Use a separate, standalone test file for each module to isolate dependency issues.
3. Create mock implementations for critical dependencies when testing complex modules.
4. Test exported utility functions that don't have external dependencies.
5. Consider adding Jest mock support for comprehensive module testing.
```typescript
// Example of testing just a self-contained function
test('getDefaultBatterAnalysis with valid inputs', () => {
  const result = getDefaultBatterAnalysis(sampleBatter, sampleGame);
  expect(result).not.toBeNull();
});
```

### Gradual Migration with Adapters

**Problem**: Need to update dependent modules without breaking existing code.

**Solution**: Create adapters that convert between old and new types.
```typescript
// Adapter to make new domain model work with old code
function adaptToBatterSeasonStats(domainBatter) {
  return {
    gamesPlayed: domainBatter.currentSeason.gamesPlayed,
    atBats: domainBatter.currentSeason.atBats,
    // ...other properties
  };
}
```

## Key Benefits

1. **Match Reality**: Types now match actual API responses
2. **Validation**: Runtime validation ensures data consistency
3. **Normalization**: String values properly converted to numbers
4. **Safety**: Optional chaining and nullish coalescing reduce errors
5. **Maintainability**: Layered approach separates concerns
6. **Runtime Safety**: Type guards verify data at runtime

## Module Organization 

The DFS analysis modules have been reorganized into a more structured directory layout:

```
/lib/mlb/dfs-analysis/
  ├── batters/     # Batter-focused analysis modules
  ├── pitchers/    # Pitcher-focused analysis modules
  ├── shared/      # Modules used by both batters and pitchers
  └── index.ts     # Re-exports for backward compatibility
```

This organization helps clarify module responsibilities while maintaining backward compatibility through the index.ts file.

## Next Modules for Migration

Based on dependencies and complexity, here's the recommended order for migration:

### Batter Modules
1. ✅ batters/hits.ts
2. ✅ batters/run-production.ts
3. ✅ shared/plate-discipline.ts
4. ✅ batters/home-runs.ts
5. ✅ batters/stolen-bases.ts
6. ✅ batters/batter-analysis.ts

### Pitcher Modules
1. ✅ pitchers/pitcher-control.ts
2. ✅ pitchers/strikeouts.ts
3. ✅ pitchers/innings-pitched.ts
4. ✅ pitchers/pitcher-win.ts
5. ✅ pitchers/rare-events.ts
6. ✅ pitchers/starting-pitcher-analysis.ts

### Shared Modules
1. ✅ shared/plate-discipline.ts
2. ✅ shared/quality-metrics.ts
3. ✅ shared/aggregate-scoring.ts