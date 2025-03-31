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

1. **Import Updates Completed** ✅

   - All targeted files have been updated to use centralized types:
     - ✅ Files in `/lib/mlb/services/` directory
     - ✅ Key files in `/lib/mlb/dfs-analysis/` directory
     - ✅ Remaining files in `/lib/mlb/dfs-analysis/` directory completed
     - ✅ Environment-related files in `/lib/mlb/weather/weather.ts` and `/lib/mlb/game/*.ts`

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

## Files Updated

1. ✅ Services files:
   - All files in `/lib/mlb/services/*.ts` completed

2. ✅ Analysis-related files:
   - Key files in `/lib/mlb/dfs-analysis/`:
      - `strikeouts.ts` ✅ Completed 
      - `home-runs.ts` ✅ Completed
      - `aggregate-scoring.ts` ✅ Completed
      - `innings-pitched.ts` ✅ Completed
      - `starting-pitcher-analysis.ts` ✅ Completed
      - `hits.ts` ✅ Completed (centralized types and fixed interface conflicts)
      - `pitcher-control.ts` ✅ Completed (improved existing types and added 7 new interfaces)
      - `pitcher-win.ts` ✅ Completed (implemented WinProbabilityAnalysis interface)
      - `plate-discipline.ts` ✅ Completed (implemented BatterControlFactors, ControlMatchupData, ControlProjection, PitcherControlProfile)
      - `rare-events.ts` ✅ Completed (implemented RareEventAnalysis interface)
      - `run-production.ts` ✅ Completed (implemented RunProductionStats, RunProductionAnalysis and added several new interfaces) 
      - `stolen-bases.ts` ✅ Completed (implemented StolenBaseAnalysis, PlayerSBSeasonStats, PlayerSBCareerProfile, PitcherHoldMetrics)
   - Fixed quality metrics calculation issue in `batter-analysis.ts` ✅

3. ✅ Environment-related files:
   - `/lib/mlb/weather/weather.ts` ✅ Completed (imported types from environment/weather.ts and environment/ballpark.ts)
   - `/lib/mlb/game/game-feed.ts` ✅ Completed (imported GameBoxScoreResponse and GameFeedResponse from types/game)
   - `/lib/mlb/game/lineups.ts` ✅ Completed (imported ProbableLineup from types/game)

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

9. **Interface mismatches causing runtime issues:**
   - Discovered quality metrics weren't appearing in test results because necessary properties were missing
   - The issue: `BatterQualityMetrics` interface and calculation functions referenced advanced stats that weren't being calculated
   - Fixed by:
     1. Adding missing advanced stats fields (`babip`, `iso`, `hrRate`, `kRate`, `bbRate`, `sbRate`) to the `BatterSeasonStats` interface
     2. Implementing calculation logic for these advanced metrics in `transformBatterStats()`
     3. Resolving a mismatch between the `BatterQualityMetrics` interface and calculation functions
   - Lesson: Just declaring fields in interfaces isn't enough; implementation functions must properly calculate and populate those fields

10. **Resolving interface naming conflicts:**
   - Discovered an interface naming conflict between `batter.ts` and `events.ts` which both defined a `HitProjection` interface
   - This caused type errors when both were imported in the same file
   - Fixed by:
     1. Renaming one interface to `DetailedHitProjection` in `events.ts`
     2. Updating all references to the renamed interface
     3. Adding type assertions where necessary for cross-file compatibility
   - Lesson: When working with a large codebase, it's important to choose unique names for interfaces or use namespaces to avoid conflicts

11. **Adding new type interfaces improves organization:**
   - While updating the dfs-analysis files, we found opportunities to add new type interfaces:
     - For `run-production.ts`, we added RunProductionStats, CareerRunProductionProfile, TeamOffensiveContext, etc.
     - For `pitcher.ts`, we added PitcherHoldMetrics for stolen base analysis
     - For `plate-discipline.ts`, we leveraged BatterControlFactors and ControlMatchupData
   - These new interfaces help organize the code and provide better documentation

12. **Type composition benefits:**
   - Used type intersection (e.g., `StolenBaseAnalysis & StolenBaseProbabilityResult`) to combine standardized interfaces with module-specific additions
   - This approach preserves the original interfaces while adding custom properties needed by specific modules
   - Makes it easy to gradually migrate to the new type system while maintaining backward compatibility

13. **Duplicated types across the codebase:**
   - Found duplicate weather and game-related types defined in both `/lib/mlb/core/types.ts` and in dedicated type modules 
   - Resolved by updating imports to use the centralized types from their dedicated modules
   - Kept module-specific imports (e.g., GameFeedResponse) from the appropriate modules rather than using the main index export
   - This approach reduces the risk of importing conflicting types through different paths
