# MLB Type System to Database Integration

## Overview

The MLB Type System has been integrated with a PostgreSQL database using Drizzle ORM, creating a persistent storage layer for MLB data. This document explains the design decisions, schema structure, and usage patterns for this integration.

## Schema Design

### Core Tables

1. **MLB Players** (`mlb_players`)
   - Maps directly to `Domain.Batter` and `Domain.Pitcher` types
   - Consolidates shared player metadata in a single table
   - Uses MLB API IDs as primary keys
   - Includes a discriminator column (`is_pitcher`) to differentiate player types

2. **Batter Stats** (`mlb_batter_stats`)
   - Maps to `Domain.BatterStats`
   - Contains all batter-specific statistics normalized from API responses
   - Includes derived metrics like ISO, BABIP, K-rate, etc.
   - Support for per-season stats and career aggregates

3. **Pitcher Stats** (`mlb_pitcher_stats`)
   - Maps to `Domain.PitcherStats`
   - Contains all pitcher-specific statistics normalized from API responses
   - Includes derived metrics like K/9, BB/9, etc.
   - Support for per-season stats and career aggregates

4. **MLB Games** (`mlb_games`)
   - Maps to `Domain.Game`
   - Stores schedule and game data
   - Includes venue info and game status
   - Contains both date and time information for filtering/grouping

### Analysis Tables

1. **Batter Projections** (`mlb_batter_projections`)
   - Maps to `Analysis.BatterProjection`
   - Links players to games for per-game projections
   - Stores DraftKings salaries and projected statistics
   - Includes confidence scores and supporting factors

2. **Pitcher Projections** (`mlb_pitcher_projections`)
   - Maps to `Analysis.PitcherProjection`
   - Links pitchers to games for per-game projections
   - Stores specialized projections for innings, strikeouts and win probability
   - Includes DraftKings-specific scoring components

## Relationship Structure

```
mlbPlayers 
├── mlbBatterStats (1:many)
├── mlbPitcherStats (1:many)
├── mlbBatterProjections (1:many)
└── mlbPitcherProjections (1:many)

mlbGames
├── mlbBatterProjections (1:many)
└── mlbPitcherProjections (1:many)
```

## Enum Definitions

The schema includes the following enums:

```typescript
export enum MLBGameStatus {
  SCHEDULED = 'SCHEDULED',
  PREGAME = 'PREGAME',
  LIVE = 'LIVE',
  FINAL = 'FINAL',
  POSTPONED = 'POSTPONED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}
```

## Data Access Patterns

The following data access functions have been implemented in `lib/db/queries.ts`:

### Data Import Functions

1. `insertPlayer(player: Domain.Batter | Domain.Pitcher)`: Inserts or updates a player record
2. `insertBatterStats(playerId, season, stats, isCareer)`: Inserts or updates batter statistics
3. `insertPitcherStats(playerId, season, stats, isCareer)`: Inserts or updates pitcher statistics
4. `insertGame(game: Domain.Game)`: Inserts or updates game information
5. `saveBatterProjection(projection)`: Saves batter projections with DFS scoring
6. `savePitcherProjection(projection)`: Saves pitcher projections with DFS scoring

### Data Retrieval Functions

1. `getAllPlayerIds()`: Returns all player IDs stored in the database
2. `getGamesByDate(date)`: Retrieves all games for a specific date
3. `getPlayerWithStats(playerId, isPitcher)`: Fetches a player profile with stats
4. `getTopProjectedBatters(date, limit)`: Gets top-projected batters for a date
5. `getTopProjectedPitchers(date, limit)`: Gets top-projected pitchers for a date

## Usage Example

```typescript
import { 
  insertPlayer, 
  insertBatterStats, 
  saveBatterProjection 
} from '@/lib/db/queries';
import { batterAnalysis } from '@/lib/mlb/dfs-analysis/batters/batter-analysis';

// Store player information
await insertPlayer(batter);

// Store player stats by season
await insertBatterStats(
  batter.id, 
  '2023', 
  batter.currentSeason, 
  false
);

// Generate and store projections
const projection = await batterAnalysis(batter, game);
await saveBatterProjection({
  playerId: batter.id,
  gamePk: game.gamePk,
  projectedPoints: projection.totalPoints,
  projectedHomeRuns: projection.homeRunPoints / 10, // Convert points to expected HRs
  confidence: projection.confidence,
  // other fields...
});
```

## Implementation Notes

1. All database model types are derived from table definitions using Drizzle's `$inferSelect` and `$inferInsert` utilities
2. The schema supports JSON columns for flexible storage of metadata and analysis factors
3. Unique constraints are applied to ensure data integrity
4. All tables include timestamp columns for tracking data freshness
5. Foreign key constraints maintain referential integrity

## API Integration

The MLB API integration with the database follows these patterns:

1. **Daily Data Collection**: The `daily-data-collector.ts` module collects and analyzes MLB data, then persists it to the database.
   - Game data is inserted using `insertGame` function
   - Player data is inserted using `insertPlayer` function 
   - Projections are saved using `saveBatterProjection` and `savePitcherProjection` functions

2. **Fallback Strategies**: The API endpoints implement fallback mechanisms when database queries fail:
   - First attempt: Database queries via the repository layer
   - Second attempt: Static JSON files in the data directory
   - Third attempt: In-memory sample data as a last resort

3. **Connection Pooling**: Database connections are managed via a connection pool in `drizzle.ts`:
   - Configuration includes idle timeout, connection limits, and error handling
   - Health checks are available through `checkDatabaseConnection()`
   - Graceful shutdown is handled through process exit handlers

## Data Refresh Workflow

The data refresh strategy follows this progression:

1. Collect MLB data from the API using the daily collector
2. Process and analyze the data for DFS scoring
3. Persist the data to PostgreSQL using the query functions
4. Provide API access to the persisted data for the frontend
5. Fall back to static files if the database is unavailable

## Migration Strategy

Database migrations are handled through Drizzle ORM:

1. Update `schema.ts` with new table definitions or changes
2. Run `pnpm db:generate` to create migration files
3. Apply migrations with `pnpm db:migrate`

Never manually edit migration files - always modify the schema definition first.