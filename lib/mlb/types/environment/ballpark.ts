/**
 * MLB Ballpark Type Definitions
 *
 * This file contains type definitions for ballpark factors and stadium data.
 */

/**
 * Ballpark factors affecting offensive production
 *
 * @property overall - Overall park factor (1.0 is neutral)
 * @property handedness - Handedness-specific factors
 * @property types - Hit type-specific factors
 * @property venueId - MLB venue ID
 * @property season - Season for the factors
 * @property sourceTimestamp - When the data was retrieved
 */
export interface BallparkFactors {
  overall: number;
  handedness: {
    rHB: number; // Factor for right-handed batters
    lHB: number; // Factor for left-handed batters
  };
  types: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    runs: number;
  };
  venueId?: number;
  season?: string;
  sourceTimestamp?: Date;
}

/**
 * Ballpark hit factor for specific hit types
 *
 * @property singles - Factor for singles (1.0 is neutral)
 * @property doubles - Factor for doubles (1.0 is neutral)
 * @property triples - Factor for triples (1.0 is neutral)
 * @property homeRuns - Factor for home runs (1.0 is neutral)
 * @property runFactor - Factor for runs (1.0 is neutral)
 * @property overall - Overall ballpark factor
 * @property rbiFactor - Factor specifically for RBIs
 */
export interface BallparkHitFactor {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  runFactor: number;
  overall: number;
  rbiFactor: number;
}

/**
 * Detailed ballpark dimensions
 *
 * @property leftField - Left field distance in feet
 * @property leftCenter - Left-center field distance in feet
 * @property center - Center field distance in feet
 * @property rightCenter - Right-center field distance in feet
 * @property rightField - Right field distance in feet
 * @property wallHeight - Wall heights in feet by location
 */
export interface BallparkDimensions {
  leftField: number;
  leftCenter: number;
  center: number;
  rightCenter: number;
  rightField: number;
  wallHeight: {
    leftField: number;
    leftCenter: number;
    center: number;
    rightCenter: number;
    rightField: number;
  };
}

/**
 * Stadium venue information
 *
 * @property venueId - MLB venue ID
 * @property name - Stadium name
 * @property city - Stadium city
 * @property state - Stadium state/province
 * @property hasRoof - Whether the stadium has a roof
 * @property roofType - Type of roof (fixed/retractable)
 * @property surface - Playing surface type
 * @property elevation - Elevation in feet above sea level
 * @property dimensions - Stadium dimensions
 * @property factors - Park factors
 */
export interface MLBVenue {
  venueId: number;
  name: string;
  city: string;
  state: string;
  hasRoof: boolean;
  roofType?: "fixed" | "retractable" | "none";
  surface: string;
  elevation: number;
  dimensions?: BallparkDimensions;
  factors?: BallparkFactors;
}
