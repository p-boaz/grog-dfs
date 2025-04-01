/**
 * MLB DFS Analysis Module
 * 
 * This is the main entry point for the DFS analysis functionality.
 * The module is organized into three logical groupings:
 * 
 * 1. Batters: Modules focusing on batter performance analysis
 * 2. Pitchers: Modules focusing on pitcher performance analysis
 * 3. Shared: Modules used in both batter and pitcher analysis
 * 
 * This index file maintains backward compatibility by re-exporting
 * all functionality from the new directory structure.
 */

// =============================================
// Batter Analysis Modules
// =============================================

/**
 * hits.ts - Foundation for all hit analysis
 * Core hit probability calculations by type (singles, doubles, etc.)
 * 3 pts for singles, 5 pts for doubles, 8 pts for triples
 */
export * from "./batters/hits";

/**
 * run-production.ts - Runs and RBIs analysis
 * Analyzes run production and run scoring opportunities
 * 2 pts each for runs and RBIs
 */
export * from "./batters/run-production";

/**
 * home-runs.ts - Home run probability
 * High-value scoring event analysis (10 pts per HR)
 * Incorporates ballpark factors and matchups
 */
export * from "./batters/home-runs";

/**
 * stolen-bases.ts - Stolen base opportunities
 * Analysis of 5-pt scoring events
 * Includes catcher defense evaluation
 */
export * from "./batters/stolen-bases";

/**
 * batter-analysis.ts - Master batter projection
 * Comprehensive batter evaluation system
 * Integrates all batter metrics into DFS projections
 */
export * from "./batters/batter-analysis";

// =============================================
// Pitcher Analysis Modules
// =============================================

/**
 * pitcher-control.ts - Pitcher control metrics
 * Analyzes walk rate, hits allowed (-0.6 pts each)
 * Critical for pitcher projections
 */
export * from "./pitchers/pitcher-control";

/**
 * strikeouts.ts - Strikeout projections
 * Projects strikeout totals (2 pts each)
 * Based on pitcher skills and batter vulnerability
 */
export * from "./pitchers/strikeouts";

/**
 * innings-pitched.ts - Durability and longevity
 * Projects innings pitched (2.25 pts per inning)
 * Analyzes pitcher efficiency and team tendencies
 */
export * from "./pitchers/innings-pitched";

/**
 * pitcher-win.ts - Win probability modeling
 * Analyzes win likelihood (4 pts)
 * Factors team strength and matchup
 */
export * from "./pitchers/pitcher-win";

/**
 * rare-events.ts - High-upside events
 * Complete games, shutouts, no-hitters
 * Low probability but high-value bonus points
 */
export * from "./pitchers/rare-events";

/**
 * starting-pitcher-analysis.ts - Master pitcher projection
 * Comprehensive pitcher evaluation system
 * Integrates all metrics into DFS projections
 */
export * from "./pitchers/starting-pitcher-analysis";

// =============================================
// Shared Analysis Modules
// =============================================

/**
 * plate-discipline.ts - Plate approach analysis
 * Used in both batter and pitcher projections
 * Walks (2 pts for batters, -0.6 for pitchers)
 */
export * from "./shared/plate-discipline";

/**
 * quality-metrics.ts - Player quality evaluation
 * Standardized quality ratings for player comparison
 * Used across batter and pitcher analysis
 */
export * from "./shared/quality-metrics";

/**
 * aggregate-scoring.ts - DFS point calculations
 * Unified scoring system for projections
 * Combines all scoring elements into projections
 */
export * from "./shared/aggregate-scoring";
