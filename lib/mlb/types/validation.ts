/**
 * MLB Validation Type Definitions
 *
 * This file contains Zod validation schemas for MLB data types.
 */

import { z } from "zod";

/**
 * Schema for pitch movement metrics validation
 */
export const MovementMetricsSchema = z.object({
  horizontal_break: z.number().min(-30).max(30), // Typical range for horizontal break in inches
  induced_vertical_break: z.number().min(-30).max(30), // Typical range for vertical break in inches
  release_extension: z.number().min(4).max(8), // Typical range for release extension in feet
  release_height: z.number().min(3).max(8), // Typical range for release height in feet
});

/**
 * Schema for pitch control metrics validation
 */
export const ControlMetricsSchema = z.object({
  zone_rate: z.number().min(0).max(100),
  first_pitch_strike: z.number().min(0).max(100),
  whiff_rate: z.number().min(0).max(100),
  chase_rate: z.number().min(0).max(100),
  csw_rate: z.number().min(0).max(100),
  called_strike_rate: z.number().min(0).max(100),
  edge_percent: z.number().min(0).max(100),
  zone_contact_rate: z.number().min(0).max(100),
  chase_contact_rate: z.number().min(0).max(100),
});

/**
 * Schema for pitch result metrics validation
 */
export const ResultMetricsSchema = z.object({
  hard_hit_percent: z.number().min(0).max(100),
  batting_avg_against: z.number().min(0).max(1),
  slugging_against: z.number().min(0).max(5),
  woba_against: z.number().min(0).max(1),
  expected_woba: z.number().min(0).max(1),
});

/**
 * Schema for pitch type data validation
 */
export const PitchTypeDataSchema = z.object({
  pitch_type: z.string(),
  count: z.number().min(0),
  percentage: z.number().min(0).max(100),
  velocity: z.number().min(50).max(110), // MLB pitch velocities typically range from 50-110 mph
  spin_rate: z.number().min(0).max(4000), // Typical spin rates range from 1000-3500 rpm
  vertical_movement: z.number().min(-30).max(30),
  horizontal_movement: z.number().min(-30).max(30),
  whiff_rate: z.number().min(0).max(1),
  put_away_rate: z.number().min(0).max(1),
  release_extension: z.number().min(4).max(8).optional(),
  release_height: z.number().min(3).max(8).optional(),
  zone_rate: z.number().min(0).max(1).optional(),
  chase_rate: z.number().min(0).max(1).optional(),
  zone_contact_rate: z.number().min(0).max(1).optional(),
  chase_contact_rate: z.number().min(0).max(1).optional(),
  batting_avg_against: z.number().min(0).max(1).optional(),
  expected_woba: z.number().min(0).max(1).optional(),
});

/**
 * Schema for pitch usage distribution validation
 * Includes refinement to ensure percentages sum to 100%
 */
export const PitchUsageSchema = z
  .object({
    fastball: z.number().min(0).max(100),
    slider: z.number().min(0).max(100),
    curve: z.number().min(0).max(100),
    changeup: z.number().min(0).max(100),
    sinker: z.number().min(0).max(100),
    cutter: z.number().min(0).max(100),
    splitter: z.number().min(0).max(100),
    sweep: z.number().min(0).max(100),
    fork: z.number().min(0).max(100),
    knuckle: z.number().min(0).max(100),
    other: z.number().min(0).max(100),
  })
  .refine(
    (data) => {
      const total = Object.values(data).reduce((sum, val) => sum + val, 0);
      return Math.abs(total - 100) < 0.1; // Allow for small rounding errors
    },
    {
      message: "Pitch usage percentages must sum to 100%",
    }
  );

/**
 * Schema for DraftKings player validation
 */
export const DraftKingsPlayerSchema = z.object({
  mlbId: z.number(),
  id: z.number(),
  name: z.string(),
  position: z.string(),
  salary: z.number(),
  avgPointsPerGame: z.number(),
  team: z.string(),
});

/**
 * Schema for weather data validation
 */
export const WeatherDataSchema = z.object({
  temperature: z.number().nullable(),
  windSpeed: z.number().nullable(),
  windDirection: z.string(),
  precipitation: z.number().nullable().optional(),
  isOutdoor: z.boolean(),
});

/**
 * Schema for player stats validation
 */
export const PlayerStatsSchema = z.object({
  gamesPlayed: z.number().nullable(),
  battingAverage: z.number().nullable().optional(),
  era: z.number().nullable().optional(),
  whip: z.number().nullable().optional(),
  strikeouts: z.number().nullable().optional(),
  homeRuns: z.number().nullable().optional(),
  stolenBases: z.number().nullable().optional(),
});