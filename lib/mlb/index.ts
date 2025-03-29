/**
 * MLB API Module
 * This is the main entry point for the MLB API integration.
 *
 * This file provides a clean, organized API for the MLB integration,
 * with modules separated by domain for better maintainability.
 */

// Core types and client
export * from "./core/types";
export {
  makeMLBApiRequest,
  RATE_LIMIT,
  API_VERSION,
  MLB_API_BASE,
  MLB_API_HEADERS,
} from "./core/api-client";

// Schedule module
export {
  getSchedule,
  findGameByTeams,
  getTeamRoster,
  getTeamStats,
} from "./schedule/schedule";

// Weather module
export {
  getGameWeatherData,
  getGameEnvironmentData,
  getBallparkFactors,
  getDetailedWeatherInfo,
} from "./weather/weather";

// Batter module
export {
  getBatterStats,
  getBatterInfo,
  getBatterPlateDiscipline,
} from "./player/batter-stats";

// Pitcher module
export {
  getPitcherStats,
  getPitcherInfo,
  getPitcherPitchMix,
  getPitcherBatterMatchup,
  getPitcherHomeRunVulnerability,
} from "./player/pitcher-stats";

// Stolen base module
export {
  getPlayerSeasonStats,
  getCareerStolenBaseProfile,
  getCatcherStolenBaseDefense,
} from "./dfs-analysis/stolen-bases";
// Game module
export {
  getGameFeed,
  getGameContent,
  getGameStatus,
  refreshGameData,
} from "./game/game-feed";

export { getProbableLineups } from "./game/lineups";

// Cache utilities
export {
  withCache,
  invalidateCache,
  DEFAULT_CACHE_TTL,
  markAsApiSource,
  isApiSource,
  clearCache,
} from "./cache";

// Do not export test utilities in production code
// Test utilities are imported directly in test files
