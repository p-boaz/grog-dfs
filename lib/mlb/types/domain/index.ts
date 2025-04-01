/**
 * MLB Domain Types - Main Export File
 * 
 * This file re-exports all MLB domain model type definitions.
 * These types are built on top of the raw API types and provide
 * normalized, validated data structures for the application.
 */

// Player domain types (batters, pitchers)
export * from './player';

// Game domain types (schedules, environments, boxscores)
export * from './game';