# Grog DFS Development Guide

## Important Rules

- ALWAYS use `pnpm` for running scripts, NEVER use `npx`
- The project is configured for pnpm, using npx can cause dependency and environment issues
- ALWAYS remove the use of default values in functions, use the actual values instead
- NEVER run `pnpm typecheck` - use `pnpm lint` for code quality checks
- NEVER run tests directly - instead, ask the user to run tests and wait for their response
- IMPORTANT: This is a PRODUCTION codebase. Every decision must reflect professional standards. Verify all information from context. Never make assumptions or speculate without evidence
- NEVER create new types/interfaces in code - all types must be defined in `/lib/mlb/types` and imported as needed

## Git Workflow

- Create detailed commit messages with clear explanations of changes
- Format commit messages with:
  - Brief summary line describing the change
  - Detailed bullet points explaining implementation details
  - Each bullet should be specific about what was changed and why
- Always include changes to documentation with related code changes
- Group related changes in a single commit
- When migrating code, note specific patterns and replacements made

## Database Schema Changes & Migrations

- NEVER manually write migration files
- Always update schema.ts first, then run `pnpm db:generate` to create migration files automatically
- Finally run `pnpm db:migrate` to apply migrations
- No exceptions to this workflow
- For enum changes: Add new values to the enum in schema.ts, regenerate migration

## Commands

- Build: `pnpm run build`
- Dev server: `pnpm run dev`
- Test:
  - Lint: `pnpm lint`
  - TypeCheck: `pnpm typecheck`
  - Run TypeScript files: `pnpm tsx <file>` (NEVER use ts-node)
- Database:
  - Setup: `pnpm run db:setup`
  - Seed: `pnpm run db:seed`
  - Migrations: `pnpm run db:migrate`
  - Schema generate: `pnpm run db:generate`
  - Studio: `pnpm run db:studio`

## MLB Scoring System

### DraftKings MLB Classic Scoring

#### Hitters

- Single: +3 Pts
- Double: +5 Pts
- Triple: +8 Pts
- Home Run: +10 Pts
- Run Batted In: +2 Pts
- Run: +2 Pts
- Base on Balls: +2 Pts
- Hit By Pitch: +2 Pts
- Stolen Base: +5 Pts

#### Pitchers

- Inning Pitched: +2.25 Pts (+0.75 Pts / Out)
- Strikeout: +2 Pts
- Win: +4 Pts
- Earned Run Allowed: -2 Pts
- Hit Against: -0.6 Pts
- Base on Balls Against: -0.6 Pts
- Hit Batsman: -0.6 Pts
- Complete Game: +2.5 Pts
- Complete Game Shutout: +2.5 Pts
- No Hitter: +5 Pts

### Key Analysis Modules

The `/lib/mlb/dfs-analysis` directory contains specialized modules organized by player type:

#### Batter Analysis (`/lib/mlb/dfs-analysis/batters/`)

1. **batter-analysis.ts**: Comprehensive batter projection system

   - Orchestrates multiple analysis components for complete batter evaluation
   - Combines multi-season data with preference for current season stats
   - Integrates environmental factors and lineup position into projections
   - Provides category-specific scoring breakdowns with confidence ratings

2. **hits.ts**: Foundation for hit analysis

   - Core hit probability calculations by type (singles, doubles, etc.)
   - Baseline for most other batter scoring projections
   - Incorporates matchup data and situational analysis

3. **home-runs.ts**: Home run probability analysis (10 pts)

   - Evaluates batter power metrics and career/recent HR trends
   - Analyzes pitcher vulnerability to home runs by handedness
   - Incorporates ballpark-specific HR factors and weather impacts
   - Estimates HR probability and expected DFS points

4. **run-production.ts**: Runs and RBI analysis (2 pts each)

   - Projects run scoring and run production opportunities
   - Analyzes lineup position impact on RBI opportunities
   - Integrates with team offensive context

5. **stolen-bases.ts**: Stolen base opportunity analysis (5 pts)

   - Connects player steal tendencies with catcher defense metrics
   - Analyzes historical stolen base success rates and trends
   - Redirects to specialized modules for base stealing and defense

#### Pitcher Analysis (`/lib/mlb/dfs-analysis/pitchers/`)

1. **starting-pitcher-analysis.ts**: Master pitcher analysis module

   - Integrates all pitcher metrics into comprehensive projections
   - Handles multi-season data with prioritization rules
   - Combines strikeouts, innings, wins, and control metrics
   - Offers relative rankings and filtering for lineup construction

2. **pitcher-control.ts**: Control metrics analysis

   - Evaluates walks and hits allowed (-0.6 pts each)
   - Analyzes command and location patterns
   - Critical for predicting negative point events

3. **pitcher-win.ts**: Win probability modeling (4 pts)

   - Calculates win probability based on pitcher performance metrics
   - Factors in team run support and bullpen strength
   - Considers home/away advantage and environmental conditions
   - Provides confidence scores acknowledging inherent uncertainty

4. **strikeouts.ts**: Strikeout projection system (2 pts)

   - Projects strikeout totals based on pitcher skills and team vulnerability
   - Incorporates pitch mix data and control metrics
   - Provides expected strikeout ranges (low/mid/high) with confidence scores
   - Identifies high-K upside pitchers against vulnerable lineups

5. **innings-pitched.ts**: Pitcher longevity analysis (2.25 pts/inning)

   - Evaluates pitcher durability, efficiency, and team "hook" tendencies
   - Analyzes complete game and shutout potential for bonus points
   - Factors in pitch efficiency and environmental impacts on endurance
   - Provides foundation for overall pitcher scoring projections

6. **rare-events.ts**: High-upside pitcher events
   - Analyzes complete games, shutouts, and no-hitters
   - Models probability of bonus point achievements
   - Identifies high-ceiling pitchers for tournaments

#### Shared Analysis (`/lib/mlb/dfs-analysis/shared/`)

1. **plate-discipline.ts**: Plate approach analysis

   - Evaluates walks and strikeouts from both perspectives
   - Used in both batter and pitcher projections
   - Models batter patience vs. pitcher command

2. **quality-metrics.ts**: Standardized player evaluation

   - Creates normalized quality ratings for players
   - Enables relative comparisons across positions
   - Provides foundation for consistency modeling

3. **aggregate-scoring.ts**: DFS point calculations
   - Unified scoring system for all player types
   - Combines individual scoring elements into projections
   - Handles point breakdowns and expected value ranges

These modules work together to create detailed fantasy scoring projections by analyzing specific scoring categories and combining them into comprehensive player evaluations.

## Code Style

- **TypeScript**: Strict mode enabled, explicit type definitions for all functions
- **Imports**: Group imports by domain (React, third-party, internal)
- **Formatting**: 2-space indentation, semicolons required
- **Testing**:
  - Browser tests use `.browser.test.ts` suffix
  - Node tests use `.test.ts` suffix
  - Tests in `__tests__` directories
- **Naming**:
  - React components: PascalCase
  - Functions/variables: camelCase
  - Types/interfaces: PascalCase with prefix (e.g., `PlayerData`)
  - Database tables: snake*case with domain prefixes (`mlb*`)
- **Error Handling**: Use try/catch with typed errors, return early pattern
- **Components**: Single responsibility, modular design using shadcn/ui

## Project Structure

- `/app`: Next.js App Router components and pages
- `/components`: Reusable UI components (shadcn/ui)
- `/lib`: Business logic and utilities by domain
  - `/lib/mlb`: MLB API integration and data analysis
    - `/lib/mlb/core`: Fundamental type definitions and API client implementation
    - `/lib/mlb/player`: Player stats, matchups, and profiles
    - `/lib/mlb/dfs-analysis`: Specialized analysis modules for scoring categories
    - `/lib/mlb/game`: Game feeds, lineups, and real-time data
    - `/lib/mlb/schedule`: Schedule data and game lookups
    - `/lib/mlb/weather`: Weather data and environment factors
  - `/lib/db`: Database schema and migrations
- `/docs`: Project documentation and guides
  - `/docs/internal`: Internal documentation

## MLB Module Details

### Data Sources

- MLB Stats API: Primary source for schedules, stats, and game data
- Baseball Savant: Advanced Statcast metrics (exit velocity, barrels, etc.)
- Weather services: Game environment data

### Key Functionality

- Player analysis: Comprehensive batter and pitcher metrics
- Matchup analysis: Historical performance and advanced matchup algorithms
- Game environment: Ballpark factors and weather impacts
- Real-time data: Game feeds and live stat updates

### Analysis Components

- Predictive models for key scoring events (HRs, SBs, etc.)
- Pitcher performance analysis (strikeouts, innings, control)
- Batter analysis (power, contact, discipline)
- Rare event prediction (triples, steals, etc.)
