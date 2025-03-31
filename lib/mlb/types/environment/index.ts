/**
 * MLB Environment Type Definitions - Index File
 *
 * This file re-exports all environment-related type definitions.
 */

export type * from './ballpark';
export type * from './weather'; 

// Export alias for backward compatibility
export type { MLBWeatherData as WeatherData } from './weather';
export type { WeatherForecast } from './weather';