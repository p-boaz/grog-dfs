# DFS Database Seeding Guide

This guide explains how to use the robust database seeding mechanism for the MLB DFS application. The seeding tools provide reliable test data for development and testing purposes.

## Available Seeding Tools

The application includes several tools for seeding the database:

1. **Robust DFS Seed Script** (`/scripts/robust-dfs-seed.ts`)
   - The primary tool for seeding MLB DFS data
   - Handles date formatting correctly for PostgreSQL
   - Includes comprehensive error handling
   - Supports multiple options for selective seeding

2. **Run DFS Seed Script** (`/scripts/run-dfs-seed.ts`)
   - A simple wrapper for the robust seed script
   - Makes it easier to run the seed script with common options

3. **Sample DFS Data** (`/data/sample-dfs-data.json`)
   - A static JSON file with sample DFS data
   - Used as a fallback when database access fails
   - Ensures the application works even without a database connection

## Command Line Options

The robust seed script accepts several options:

- `--reset`: Clear existing data before seeding
- `--sample`: Use sample data only (default)
- `--players`: Seed players only
- `--games`: Seed games only
- `--projections`: Seed projections only
- `--env=dev|test`: Specify environment (defaults to dev)

## Usage Examples

### Basic Seeding

To seed the database with all data (players, games, and projections):

```bash
pnpm tsx scripts/run-dfs-seed.ts
```

### Reset and Seed

To clear existing data and create fresh seed data:

```bash
pnpm tsx scripts/run-dfs-seed.ts --reset
```

### Selective Seeding

To only update specific types of data:

```bash
# Seed only player data
pnpm tsx scripts/run-dfs-seed.ts --players

# Seed only game data
pnpm tsx scripts/run-dfs-seed.ts --games

# Seed only projections
pnpm tsx scripts/run-dfs-seed.ts --projections
```

### Environmental Seeding

To seed data for a specific environment:

```bash
pnpm tsx scripts/run-dfs-seed.ts --env=test
```

## Database Schema

The MLB DFS database has the following tables:

1. `mlb_players`: Basic player information
2. `mlb_batter_stats`: Statistics for batters
3. `mlb_pitcher_stats`: Statistics for pitchers
4. `mlb_games`: Game schedule and information
5. `mlb_batter_projections`: DFS projections for batters
6. `mlb_pitcher_projections`: DFS projections for pitchers

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Ensure PostgreSQL is running: `docker compose ps`
2. Check if the database exists: `psql -h localhost -p 54323 -U postgres -d postgres`
3. Verify environment variables in `.env`

### Date Handling

Dates in PostgreSQL are handled specially:

1. The database client is configured to format dates correctly (see `/lib/db/drizzle.ts`)
2. The seed script formats dates as simple YYYY-MM-DD strings
3. When working with dates directly, use `formatDateForDb()` from `/lib/db/utils.ts`

### Sample Data Fallback

The API is configured to use sample data as a fallback when:

1. Database connection fails
2. No database records exist for the requested date
3. An error occurs during database query

This ensures the frontend always has data to display, even when the database is unavailable.

## Adding New Seed Data

To add new player, game, or projection data:

1. Edit `/scripts/robust-dfs-seed.ts`
2. Add new entries to the relevant sections (players, games, projections)
3. Run the seed script with `--reset` to apply changes

## Database Utilities

The `/lib/db/utils.ts` file contains helper functions for working with the database:

- `formatDateForDb()`: Format dates for PostgreSQL
- `checkDbConnection()`: Test database connectivity
- `getTableCount()`: Count records in a table
- `hasDataForDate()`: Check if data exists for a specific date
- `getAllTeams()`: Get all MLB teams in the database
- `getGamesBetweenDates()`: Get games within a date range
- `getGamesByStatus()`: Get games with a specific status
- `getGamesByTeam()`: Get games for a specific team
- `closeDbConnection()`: Close the database connection

Use these utilities to simplify common database operations.