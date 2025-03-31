Comprehensive Type Centralization Plan

1. Directory Structure Creation

Create a well-organized type hierarchy:

/lib/mlb/types/
├── core.ts # Core MLB data structures
├── game.ts # Game, schedule, and feed related types
├── player/
│ ├── index.ts # Re-exports all player types
│ ├── common.ts # Shared player types
│ ├── batter.ts # Batter-specific types
│ ├── pitcher.ts # Pitcher-specific types
│ └── matchups.ts # Player matchup types
├── analysis/
│ ├── index.ts # Re-exports all analysis types
│ ├── batter.ts # Batter analysis types
│ ├── pitcher.ts # Pitcher analysis types
│ ├── scoring.ts # DFS scoring and projection types
│ └── events.ts # Special event types (HR, SB, etc.)
├── environment/
│ ├── index.ts # Re-exports environment types
│ ├── weather.ts # Weather data types
│ └── ballpark.ts # Ballpark factor types
├── draftkings.ts # DraftKings salary and player mapping types
├── statcast.ts # Statcast measurement types (moved from lib/types)
├── validation.ts # Zod validation schemas
└── index.ts # Main barrel file exporting all types

2. Migration Strategy

1. Phase 1: Create the directory structure and core type files


    - Create all directories and skeleton files
    - Move existing /lib/types/statcast.ts to new location
    - Create index.ts files with placeholder exports

2. Phase 2: Extract types from current files (by domain)


    - Start with core types in core/types.ts
    - Move player types from relevant files to /types/player/
    - Move analysis types to /types/analysis/
    - Move environment types to /types/environment/

3. Phase 3: Update imports in existing files


    - For each file with moved types, update imports to reference new locations
    - Use relative imports (e.g., ../../types/player/batter)
    - OR barrel imports (e.g., @/lib/mlb/types)

4. Phase 4: Standardize and improve types


    - Normalize naming conventions (add consistent prefixes like "MLB")
    - Add JSDoc comments to all types
    - Address inconsistencies (null vs undefined)
    - Improve type reuse through composition

3. Implementation Steps

1. Preparation
   mkdir -p lib/mlb/types/player
   mkdir -p lib/mlb/types/analysis
   mkdir -p lib/mlb/types/environment
   touch lib/mlb/types/index.ts
1. Create base index files
   // lib/mlb/types/index.ts
   export _ from './core';
   export _ from './game';
   export _ from './draftkings';
   export _ from './player';
   export _ from './analysis';
   export _ from './environment';
   export _ from './statcast';
   export _ from './validation';
1. Move Statcast types
   cp lib/types/statcast.ts lib/mlb/types/statcast.ts
1. Create core type file


    - Extract and normalize core types from lib/mlb/core/types.ts
    - Add proper JSDoc comments

5. Extract player types


    - Identify all player-related interfaces and types across files
    - Group by player type (common, batter, pitcher)
    - Move to appropriate files within /types/player/

6. Extract analysis types


    - Centralize all interfaces from /dfs-analysis/ files
    - Organize by domain (batter, pitcher, scoring)

7. Create a comprehensive type catalog


    - Document all types in a markdown file
    - Include their purpose, structure, and usage examples

4. Import Update Strategy

1. Update pattern for imports
   // BEFORE
   import { PlayerSBSeasonStats } from "../player/base-stealing";

// AFTER - Option 1 (direct import)
import { PlayerSBSeasonStats } from "../types/player/batter";

// AFTER - Option 2 (barrel import)
import { PlayerSBSeasonStats } from "../types"; 2. Search and replace method - For each extracted type, use grep to find all usages - Update imports systematically, one file at a time

5. Testing Plan

1. Type checking after each phase
   pnpm typecheck
1. Incremental testing


    - After moving each group of types, run type checking
    - Fix any type errors before proceeding

3. Integration testing


    - Ensure all functions that use these types still work properly
    - Run existing tests to verify nothing breaks

6. Documentation

1. Add comprehensive JSDoc comments to all types
   /\*\*

- Interface for a player's stolen base statistics for a single season
- @property battingAverage - Player's batting average for the season
- @property stolenBases - Total number of successful stolen bases
- @property stolenBaseAttempts - Total number of stolen base attempts
- @property caughtStealing - Number of times caught stealing
- @property gamesPlayed - Total games played in the season
- @property stolenBaseRate - Stolen bases per game (SB/games)
- @property stolenBaseSuccess - Success rate of stolen base attempts (SB/attempts)
  \*/
  export interface PlayerSBSeasonStats {
  // ...
  }

2. Create a types reference guide


    - Document the organization of types
    - Include examples of proper type usage
    - Add to project documentation

7. Rollout Plan

1. Start with non-critical types (least used)


    - Begin with types used in fewer files
    - Get comfortable with the migration pattern

2. Move to core types


    - Once process is established, move frequently used types
    - Update all imports in a single PR

3. Finalize with comprehensive unit tests


    - Create tests to verify type integrity
    - Ensure all edge cases are covered

8. Timeline

- Week 1: Setup directory structure, create index files, move Statcast types
- Week 2: Extract and migrate core types, player types
- Week 3: Extract analysis types, environment types
- Week 4: Update imports, cleanup, testing

This plan provides a structured approach to centralizing all MLB type definitions, making the
codebase more maintainable, improving type consistency, and making it easier to find and use types
throughout the application.
