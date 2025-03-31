# MLB Type Centralization Plan - Progress Update

## ✅ Completed Tasks

1. **Directory Structure Created**

   - Created `/lib/mlb/types/` with all necessary subdirectories
   - Implemented appropriate index files with proper exports

2. **Type Files Created**

   - Moved and centralized types across the system
   - Added JSDoc comments to all type definitions
   - Organized by domain (player, analysis, environment)

3. **Import Updates Progress**
   - Updated key analysis files to use centralized types:
     - `strikeouts.ts` - Now uses `PitcherPitchMixData` and `StrikeoutProjection`
     - `home-runs.ts` - Now uses `HomeRunAnalysis` and `PitcherHomeRunVulnerability`
     - `aggregate-scoring.ts` - Now uses `PitcherDFSPoints` and `PlayerProjection`
     - `innings-pitched.ts` - Now uses `InningsProjection` and `RareEventAnalysis`
   - Updated player-related files:
     - `base-stealing.ts` - Now uses `PlayerSBSeasonStats`, `PlayerSBCareerProfile`, `StolenBaseContext`, and `StolenBaseProjection`
     - `pitcher-stats.ts` - Now uses `PitcherStats`, `PitcherPitchMixData`, `PitcherBatterMatchup`, and `PitcherHomeRunVulnerability`
     - `defense-stats.ts` - Now uses `CatcherDefenseMetrics` and `BatteryVulnerability`
     - `batter-stats.ts` - Now uses `BatterSeasonStats`, `BatterStats`, `BatterSplits`, `BatterPlateDiscipline`, and `MLBBatter`
     - `matchups.ts` - Now uses `PitcherBatterMatchup`, `BatterPlateDiscipline`, `AdvancedMatchupAnalysis`, `HitterMatchupAnalysis` and StatcastData related types
   - Updated service files:
     - `batter-data-service.ts` - Now uses `BatterSeasonStats`, `BatterStats`, and `BatterStatcastData` 
     - `pitcher-data-service.ts` - Now uses `PitcherSeasonStats`, `PitcherCareerStatsSeason`, `PitcherStatcastData`, and `PitchUsage`
   - Added new types to centralized structure:
     - Added `CatcherDefenseMetrics` interface to `player/common.ts`
     - Added `BatteryVulnerability` interface to `player/common.ts`
     - Added `BatterPlateDiscipline` interface to `player/batter.ts`
     - Added `BatterSplits` interface to `player/batter.ts`
     - Added `BatterStats` interface to `player/batter.ts`
     - Added `AdvancedMatchupAnalysis` interface to `analysis/matchups.ts`
     - Added `HitterMatchupAnalysis` interface to `analysis/matchups.ts`

## 🚧 Remaining Tasks

1. **Continue Import Updates**

   - Update remaining files to use centralized types:
     - ✅ Files in `/lib/mlb/services/` directory
     - ✅ Key files in `/lib/mlb/dfs-analysis/` directory
     - Remaining files in `/lib/mlb/dfs-analysis/` directory 👈 Next priority

2. **Streamline Type Definitions**

   - Normalize naming conventions
   - Improve type reuse through composition
   - Eliminate duplicate type definitions
   - Ensure consistent JSDoc comments for all types

3. **Documentation**
   - Create a types reference guide
   - Include examples of proper type usage

## Simplified Implementation Guide

1. **For each file needing updates:**

   - Identify local types that should be imported from central location
   - Import appropriate types from `/lib/mlb/types/`
   - Run `pnpm typecheck` to verify changes

2. **Import pattern:**

   ```typescript
   // BEFORE
   interface LocalType { ... }

   // AFTER
   import { CentralizedType } from "../types/domain/file";
   ```

## Next Files to Update

1. ✅ Services files:
   - Files in `/lib/mlb/services/*.ts` completed
2. Analysis-related files:
   - ✅ Key files in `/lib/mlb/dfs-analysis/` updated:
      - `strikeouts.ts`
      - `home-runs.ts`
      - `aggregate-scoring.ts`
      - `innings-pitched.ts`
   - Remaining `/lib/mlb/dfs-analysis/*.ts` files 👈 Next priority:
      - `batter-analysis.ts`
      - `hits.ts`
      - `pitcher-control.ts`
      - `pitcher-win.ts`
      - `plate-discipline.ts`
      - `rare-events.ts`
      - `run-production.ts`
      - `starting-pitcher-analysis.ts`
      - `stolen-bases.ts`

3. Environment-related files:
   - `/lib/mlb/weather/*.ts`
   - `/lib/mlb/game/*.ts`

## Lessons Learned

1. **Fixed import issues:**

   - When updating `pitcher-stats.ts`, found a missing cache TTL property (`matchup`). Replaced with existing `player` TTL.
   - Ensured types are properly re-exported through index files

2. **Type centralization benefits:**

   - Improved code consistency
   - Better documentation through standardized JSDoc comments
   - Easier to find and use types with properly organized structure
   - Reduced duplication across the codebase

3. **Adapting property names:**

   - Found that `BatterSeasonStats` used `rbis` while some files were using `rbi`
   - Important to check source types carefully for property names to avoid typechecking errors
   - Consider adding type adapters for legacy interfaces to ease migration

4. **Property subset challenges:**

   - Some modules throw type errors when switching to centralized types with fewer properties
   - May need to expand centralized types to include all needed properties or create more specialized types

5. **Leveraging existing types:**
   - Check for existing types in the centralized system before creating new ones
   - Prefer updating and expanding existing types rather than creating new duplicates
   - For related domains (like statcast), consolidate types in one file instead of scattering them

6. **Type composition approach:**
   - Using type composition (like `PitcherSeasonStats & { additionalProps }`) works well for extending centralized types
   - This approach maintains core type integrity while allowing for context-specific extensions
   - Type checking catches missing required properties which helps ensure implementations are complete

7. **Safe defaults for required properties:**
   - Adding `|| 0` for numeric properties ensures type safety when dealing with potentially undefined values
   - This is especially important for properties marked as required in the type definitions
   - For services that combine data from multiple sources, defaulting to safe values prevents runtime errors

8. **Managing return type extensions:**
   - Using intersection types (like `InningsProjection & { additionalProps }`) allows adding custom properties to standard interfaces
   - When modifying a function to use centralized types, it's important to carefully align all return values with the new type
   - Adding null checking (e.g., `pitcherMetrics?.property || defaultValue`) improves robustness with optional properties
   - Remember to update all error/fallback return paths when changing interface definitions
