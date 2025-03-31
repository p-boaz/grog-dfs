/**
 * MLB Weather Type Definitions
 *
 * This file contains type definitions for weather data related to MLB games.
 */

/**
 * Raw weather data from MLB API
 * 
 * @property condition - Weather condition description
 * @property temp - Temperature as a string
 * @property wind - Wind speed and direction as a string
 * @property sourceTimestamp - When the data was retrieved
 */
export interface MLBWeatherData {
  condition: string;
  temp: string; // MLB API returns temperature as string
  wind: string;
  sourceTimestamp?: Date;
}

/**
 * Processed weather information
 * 
 * @property temperature - Temperature in Fahrenheit
 * @property condition - Weather condition description
 * @property wind - Detailed wind information
 * @property isOutdoor - Whether the game is outdoors
 * @property isPrecipitation - Whether precipitation is present
 */
export interface DetailedWeatherInfo {
  temperature: number;
  condition: string;
  wind: {
    speed: number;
    direction: string;
    isCalm: boolean;
  };
  isOutdoor: boolean;
  isPrecipitation: boolean;
}

/**
 * Game environment data
 * 
 * @property temperature - Temperature in Fahrenheit
 * @property windSpeed - Wind speed in mph
 * @property windDirection - Wind direction
 * @property precipitation - Whether precipitation is present
 * @property isOutdoor - Whether the game is outdoors
 * @property humidityPercent - Humidity percentage
 * @property pressureMb - Barometric pressure in millibars
 * @property venueId - MLB venue ID
 * @property venueName - Venue name
 * @property hasRoof - Whether the stadium has a roof
 * @property roofStatus - Current status of retractable roof
 * @property sourceTimestamp - When the data was retrieved
 */
export interface GameEnvironmentData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: boolean;
  isOutdoor: boolean;
  humidityPercent?: number;
  pressureMb?: number;
  venueId?: number;
  venueName?: string;
  hasRoof?: boolean;
  roofStatus?: string;
  sourceTimestamp?: Date;
}

/**
 * Weather impact analysis for baseball performance
 * 
 * @property overall - Overall impact rating
 * @property homeRuns - Impact on home run probability
 * @property distance - Impact on fly ball distance
 * @property pitchMovement - Impact on pitch movement
 * @property temperature - Impact of temperature
 * @property wind - Impact of wind
 * @property humidity - Impact of humidity
 */
export interface WeatherImpactAnalysis {
  overall: number; // -10 to +10 scale where 0 is neutral
  homeRuns: number; // -10 to +10 scale where 0 is neutral
  distance: number; // Estimated impact on fly ball distance in feet
  pitchMovement: number; // -10 to +10 scale where 0 is neutral
  factors: {
    temperature: number; // -10 to +10 scale where 0 is neutral
    wind: number; // -10 to +10 scale where 0 is neutral
    humidity: number; // -10 to +10 scale where 0 is neutral
    altitude: number; // -10 to +10 scale where 0 is neutral
  };
}