/**
 * Comprehensive Type Fix Plan - Main Issues
 *
 * This is a planning file to outline the steps needed to fix the type system.
 * 
 * KEY ISSUES:
 *
 * 1. BatterSeasonStats vs SeasonStats conflict
 *    - BatterSeasonStats in player/batter.ts
 *    - SeasonStats in analysis/batter.ts
 *    - Different required/optional properties causing conflicts
 *
 * 2. export type vs export issues
 *    - Need to use 'export type' with isolatedModules
 *    - Many index files need updating
 *
 * 3. Missing properties in object literals
 *    - Many implementations incomplete compared to interfaces
 *    - Missing required properties like hitByPitches, plateAppearances, etc.
 *
 * 4. Ambiguous exports
 *    - Multiple exports of same name from different modules
 *    - Need explicit re-exports
 *
 * IMPLEMENTATION PLAN:
 *
 * 1. Harmonize BatterSeasonStats and SeasonStats
 *    - Make SeasonStats = BatterSeasonStats
 *    - Update all implementations
 *
 * 2. Fix all index.ts files to use 'export type'
 *    - Update lib/mlb/types/analysis/index.ts
 *    - Update lib/mlb/types/index.ts
 *
 * 3. Fix enum/const value exports
 *    - Move HIT_TYPE_POINTS and HitType to non-type exports
 *
 * 4. Add missing properties to implementations
 *    - Update default/empty objects to include all required props
 *    - Focus on hitByPitches, plateAppearances
 *
 * 5. Fix MLB type index exports
 *    - Use explicit exports with renaming for conflicts
 */
