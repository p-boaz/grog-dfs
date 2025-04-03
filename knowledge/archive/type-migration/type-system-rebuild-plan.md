# MLB DFS Type System Rebuild Plan

## Current Issues Analysis

1. **Inconsistent Type Definitions**
   - Duplicate interfaces across files (e.g., `HitProjection` in multiple places)
   - Mismatched property names (e.g., `rbi` vs `rbis`)
   - Inconsistent return types vs. actual implementation
   - Conflicting exports in index files

2. **Implementation/Interface Mismatches**
   - Functions return objects with properties not in their interfaces
   - Interface properties defined but not used in code
   - Type assertions (`@ts-ignore`) needed due to property mismatches
   - Optional properties not properly handled

3. **Complex Type Dependencies**
   - Circular dependencies between type modules
   - Ambiguous imports due to re-exports
   - Type conflicts from `isolatedModules` compiler option
   - Excessive use of specific types instead of composition

## Rebuild Approach

### Phase 1: Data Validation and Mapping

1. **API Response Capture and Analysis**
   - Capture real MLB API responses using the instrumented API client
   - Run `scripts/capture-api-samples.ts` to collect basic API responses
   - Run `scripts/sample-flows.ts` to simulate key application flows
   - Generate type definitions directly from actual API shapes
   - Compare captured response types with current interface definitions

2. **Unified Type Reference**
   - Document all existing types and their relationships
   - Map actual data shapes to current interfaces
   - Identify duplicates and conflicts
   - Create centralized reference of all types with recommendations

3. **Type Migration Strategy**
   - Define incremental migration path for each module
   - Prioritize critical path modules (DFS scoring, analysis)
   - Create adapter patterns for backward compatibility
   - Use union types for transitional compatibility

### Phase 2: Implementation

1. **Runtime-Aligned Base Types**
   - Create base interfaces that match actual API responses
   - Use exact property names from API (no renaming)
   - Add explicit JSDoc with descriptions
   - Implement strict validation for required properties

2. **Domain-Specific Extension Types**
   - Build domain types as extensions of base types
   - Use type composition with intersection types
   - Define specialized types for analysis components
   - Refine into smaller, more focused interfaces

3. **Improved Type Flexibility**
   - Add index signatures for extensibility where appropriate
   - Use union types instead of strict requirements
   - Make non-critical properties optional
   - Implement proper default handling in functions

4. **Centralized Type Organization**
   - Reorganize types by domain and purpose:
      - `core/`: Base API response types
      - `player/`: Player-specific types
      - `game/`: Game and matchup types
      - `analysis/`: DFS analysis types
      - `environment/`: Weather, ballpark types
   - Use namespaces for related types to prevent collision
   - Improve imports with specific paths (`from './player/batter'` vs. `from './player'`)

### Phase 3: Interface Migration

1. **Module-by-Module Approach**
   - Convert one module at a time
   - Update function signatures and implementation together
   - Add runtime validation where needed
   - Ensure full test coverage for migration

2. **Runtime Type Guards**
   - Implement type guard functions for key interfaces
   - Add runtime validation at API boundaries
   - Create utility functions for safe type casting
   - Use branded types for strict validation

3. **Backward Compatibility Layer**
   - Create adapters for legacy interfaces
   - Add deprecation notices to old types
   - Provide migration helpers
   - Support both old and new patterns during transition

## Technical Implementation Details

### 1. Runtime-Aligned Type Definitions

```typescript
// Before
export interface PlayerStats {
  avg: number;
  rbis: number;  // Doesn't match API's "rbi"
  // Missing properties from actual data
}

// After
export interface PlayerApiResponse {
  avg: number;
  rbi: number;    // Exact match to API
  babip?: number; // Optional properties in API
  [key: string]: any; // Allow for additional properties
}

// Domain-specific extension
export interface PlayerAnalysisStats extends PlayerApiResponse {
  qualityScore: number; // Analysis-specific property
  expectedValue: number;
}
```

### 2. Type Composition Pattern

```typescript
// Core pattern
export interface BatterSeasonStats {
  // Base properties everyone agrees on
  gamesPlayed: number;
  atBats: number;
  hits: number;
  // etc.
}

// Extended for specific use cases
export type BatterAnalysisStats = BatterSeasonStats & {
  // Additional properties for analysis
  battedBallQuality?: number;
  contactRate?: number;
}

// Function implementation
function analyzeBatter(stats: BatterSeasonStats): BatterAnalysisStats {
  return {
    ...stats,
    battedBallQuality: calculateQuality(stats),
    contactRate: calculateContact(stats)
  };
}
```

### 3. Union Types for Flexibility

```typescript
// Before
export interface GameId {
  gameId: number;
}

// After - supports both formats seen in code
export type GameIdentifier = 
  | string
  | number
  | { gameId: number | string }
  | { gamePk: number | string };

// Usage with type guard
function getGameById(id: GameIdentifier): Game {
  const gameId = normalizeGameId(id);
  // Rest of implementation
}

function normalizeGameId(id: GameIdentifier): string {
  if (typeof id === 'string') return id;
  if (typeof id === 'number') return id.toString();
  if ('gameId' in id) return id.gameId.toString();
  if ('gamePk' in id) return id.gamePk.toString();
  throw new Error('Invalid game identifier');
}
```

### 4. Type Guards for Runtime Safety

```typescript
export function isBatterSeasonStats(obj: any): obj is BatterSeasonStats {
  return (
    obj &&
    typeof obj === 'object' &&
    'gamesPlayed' in obj &&
    'atBats' in obj &&
    'hits' in obj
  );
}

// Usage
function processBatterStats(data: unknown) {
  if (isBatterSeasonStats(data)) {
    // TypeScript knows data is BatterSeasonStats here
    return analyzeBatter(data);
  }
  throw new Error('Invalid batter stats data');
}
```

### 5. Namespaced Types to Prevent Collisions

```typescript
export namespace Batter {
  export interface SeasonStats {
    // Properties
  }
  
  export interface Analysis {
    // Properties
  }
}

export namespace Pitcher {
  export interface SeasonStats {
    // Properties
  }
}

// Usage
function analyzePitcher(stats: Pitcher.SeasonStats): Pitcher.Analysis {
  // Implementation
}
```

### 6. Proper Default Handling

```typescript
// Before
function calculateProjections(stats: SeasonStats): Projections {
  const hits = stats.hits || 0;
  // More defaults scattered through function
}

// After
function calculateProjections(stats: SeasonStats): Projections {
  // Apply defaults at beginning in one place
  const validatedStats = validateSeasonStats(stats);
  // Use validated properties safely
}

function validateSeasonStats(stats: Partial<SeasonStats>): SeasonStats {
  return {
    gamesPlayed: stats.gamesPlayed ?? 0,
    atBats: stats.atBats ?? 0,
    hits: stats.hits ?? 0,
    // All properties get defaults
  };
}
```

## Implementation Process

1. **Start with Core Types**
   - First define the most fundamental types that match API responses
   - Create validation tests with real data examples
   - Document these core types thoroughly with JSDoc

2. **Test with Representative Samples**
   - Use real data samples from existing MLB API calls
   - Create a test validation suite that compares types to real data
   - Run tests on each modified interface

3. **Gradual Replacement Strategy**
   - Introduce new types alongside existing ones
   - Update one module at a time
   - Validate changes with tests after each module conversion
   - Focus on core analysis modules first, then support modules

4. **Documentation Throughout**
   - Add JSDoc comments to all types
   - Document migration status and plans
   - Include examples of proper usage
   - Note known issues during transition

## Timeline and Priorities

### Phase 1: Preparation (1-2 weeks)
- Create test data environment
- Document existing types
- Create type relationship map
- Establish migration priorities

### Phase 2: Core Types (2-3 weeks)
- Define base API types
- Update core player and game modules
- Create type guards and validation
- Implement test coverage

### Phase 3: Analysis Types (3-4 weeks)
- Update DFS analysis modules
- Convert projection systems
- Implement type composition patterns
- Validate with real calculations

### Phase 4: Final Integration (2-3 weeks)
- Connect front-end components
- Update services and utilities
- Complete documentation
- Final validation and testing

## Success Criteria

1. All TypeScript errors resolved without ignores
2. Types accurately represent actual data
3. No interface mismatches or property conflicts
4. No circular dependencies
5. Clear, documented type hierarchy
6. Consistent naming and organization
7. Runtime validation at API boundaries
8. Complete test coverage for type validation