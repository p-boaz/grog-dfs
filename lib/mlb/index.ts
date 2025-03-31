/**
 * MLB API Module
 * This is the main entry point for the MLB API integration.
 *
 * This file provides a clean, organized API for the MLB integration,
 * with modules separated by domain for better maintainability.
 */

// Core types and client
export {
  API_VERSION,
  makeMLBApiRequest,
  MLB_API_BASE,
  MLB_API_HEADERS,
  RATE_LIMIT,
} from "./core/api-client";
export * from "./types/core";

// Schedule module
export {
  findGameByTeams,
  getSchedule,
  getTeamRoster,
  getTeamStats,
} from "./schedule/schedule";

// Weather module
export {
  getBallparkFactors,
  getDetailedWeatherInfo,
  getGameEnvironmentData,
  getGameWeatherData,
} from "./weather/weather";

// Batter module
export {
  getBatterInfo,
  getBatterPlateDiscipline,
  getBatterStats,
} from "./player/batter-stats";

// Pitcher module
export {
  getPitcherBatterMatchup,
  getPitcherHomeRunVulnerability,
  getPitcherInfo,
  getPitcherPitchMix,
  getPitcherStats,
} from "./player/pitcher-stats";

// Stolen base module
export {
  getCareerStolenBaseProfile,
  getCatcherStolenBaseDefense,
  getPlayerSeasonStats,
} from "./dfs-analysis/stolen-bases";
// Game module
export {
  getGameContent,
  getGameFeed,
  getGameStatus,
  refreshGameData,
} from "./game/game-feed";

export { getProbableLineups } from "./game/lineups";

// Cache utilities
export {
  clearCache,
  DEFAULT_CACHE_TTL,
  invalidateCache,
  isApiSource,
  markAsApiSource,
  withCache,
} from "./cache";

// Do not export test utilities in production code
// Test utilities are imported directly in test files
