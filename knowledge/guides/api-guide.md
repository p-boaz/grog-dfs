# MLB DFS API Integration Guide

This guide provides a comprehensive overview of working with baseball data APIs in the MLB DFS application. It covers the MLB Stats API, Baseball Savant API, and best practices for API integration.

## MLB Stats API

The MLB Stats API is the primary source of data for our application. It provides comprehensive information about games, players, teams, and statistics.

### Base URLs

- **Production API**: `https://statsapi.mlb.com/api`
- **Version**: Our application uses API version `v1.1` for most endpoints

### Authentication

The MLB Stats API does not require authentication for most endpoints, but rate limiting applies.

### Key Endpoints

#### Game Data

```
GET /game/{gameId}/feed/live
```

Returns detailed information about a game, including:
- Game status and metadata
- Teams and venue information
- Current linescore
- Play-by-play data
- Boxscore with player statistics

#### Player Data

```
GET /people/{playerId}?hydrate=stats(group=[hitting],type=[yearByYear],season=2023)
```

Returns player information and statistics:
- Basic player information
- Current team
- Current season stats
- Career statistics

#### Schedule Data

```
GET /schedule?sportId=1&date=2023-07-15
```

Returns the schedule for a specific date:
- Game IDs and statuses
- Teams and probables
- Venue information
- Game start times

### Hydration Parameters

The MLB Stats API supports "hydration" to include additional data in a single request. Hydration parameters are added using the `hydrate` query parameter.

Common hydrations:
- `stats`: Include statistics (`group`, `type`, `season`)
- `team`: Include team information
- `person`: Include person information

Example:
```
GET /people/545361?hydrate=stats(group=[hitting,pitching],type=[yearByYear,career],season=2023),team,person
```

For more details, see the [MLB API Hydration Reference](/knowledge/reference/api/hydration.md).

## Baseball Savant API

Baseball Savant provides advanced Statcast metrics that complement the MLB Stats API data.

### Base URL

- **Production API**: `https://baseballsavant.mlb.com/api`

### Key Endpoints

#### Statcast Player Data

```
GET /player-stats?player_id=545361&year=2023
```

Returns advanced Statcast metrics for a player:
- Exit velocity and launch angle
- Barrel percentage
- Xwoba, xba, and other expected statistics
- Sprint speed and defensive metrics

#### Statcast Game Data

```
GET /game?game_pk=717465
```

Returns advanced Statcast metrics for a specific game:
- Pitch-by-pitch data
- Hit probabilities
- Advanced fielding metrics

## API Integration in the Application

### Making API Requests

The application uses a central API client for all MLB Stats API requests:

```typescript
import { makeMLBApiRequest } from '../core/api-client';
import { Api } from '../types';

// Generic API request with typed response
async function fetchGameData(gameId: string): Promise<Api.GameFeedApiResponse> {
  return makeMLBApiRequest<Api.GameFeedApiResponse>(
    `/game/${gameId}/feed/live`,
    'V11'
  );
}
```

### Caching Strategy

The application implements a multi-level caching strategy:

1. **Memory Cache**: Short-term in-memory cache (15 minutes to 1 hour)
2. **Persistent Cache**: Longer-term file-based cache (1 day to 1 week)

Caching is implemented using the `withCache` wrapper:

```typescript
import { withCache, DEFAULT_CACHE_TTL } from '../cache';

// Function with caching
export const getGameFeed = withCache(
  fetchGameFeed,
  'game-feed',
  DEFAULT_CACHE_TTL.game // 15 minutes
);
```

### Error Handling

API requests include robust error handling:

```typescript
try {
  const data = await makeMLBApiRequest<Api.GameFeedApiResponse>(
    `/game/${gameId}/feed/live`,
    'V11'
  );
  
  // Process successful response
  return processGameData(data);
} catch (error) {
  // Log error
  console.error(`Error fetching game data for ${gameId}:`, error);
  
  // Fallback strategy
  try {
    // Try alternate API endpoint
    return await fetchGameBoxScore(gameId);
  } catch (fallbackError) {
    // Final error handling
    throw new Error(`Failed to fetch game data: ${error.message}`);
  }
}
```

### Data Transformation

API responses are transformed into domain models:

```typescript
import { Api, Domain } from '../types';

// Transform API response to domain model
function transformGameData(apiResponse: Api.GameFeedApiResponse): Domain.Game {
  return {
    id: apiResponse.gamePk,
    date: apiResponse.gameData.datetime.originalDate,
    startTime: apiResponse.gameData.datetime.dateTime,
    status: mapGameStatus(apiResponse.gameData.status),
    // Additional transformations...
  };
}
```

## Capturing and Analyzing API Responses

The application includes utilities for capturing and analyzing API responses:

```bash
# Capture API responses to the data/api-samples directory
pnpm tsx scripts/capture-api-samples.ts

# Analyze captured responses
pnpm tsx scripts/analyze-api-response.ts data/api-samples/game_feed_123456.json
```

For more details, see the [API Capture Guide](/knowledge/guides/api-capture-guide.md).

## Best Practices

### 1. Use Type-Safe API Requests

Always specify the expected response type:

```typescript
// ✅ Typed request
const data = await makeMLBApiRequest<Api.GameFeedApiResponse>(
  `/game/${gameId}/feed/live`,
  'V11'
);

// ❌ Untyped request
const data = await makeMLBApiRequest(
  `/game/${gameId}/feed/live`,
  'V11'
);
```

### 2. Implement Proper Error Handling

Include proper error handling for all API requests:

```typescript
try {
  const data = await makeMLBApiRequest<Api.PlayerApiResponse>(
    `/people/${playerId}`,
    'V1'
  );
  return processPlayerData(data);
} catch (error) {
  console.error(`Error fetching player ${playerId}:`, error);
  // Return default/fallback data or re-throw
  return createDefaultPlayerData();
}
```

### 3. Use Caching Appropriately

Match cache TTL (time-to-live) with data volatility:

- Live game data: 1-2 minutes
- Player statistics: 1 day
- Historical data: 1 week

```typescript
// Live game data - short TTL
export const getGameFeed = withCache(
  fetchGameFeed,
  'game-feed',
  DEFAULT_CACHE_TTL.game // 15 minutes
);

// Historical player data - longer TTL
export const getPlayerCareerStats = withCache(
  fetchPlayerCareerStats,
  'player-career',
  DEFAULT_CACHE_TTL.historical // 1 day
);
```

### 4. Batch Requests When Possible

Use hydration parameters to reduce the number of API calls:

```typescript
// ❌ Multiple requests
const playerData = await makeMLBApiRequest(`/people/${playerId}`);
const stats = await makeMLBApiRequest(`/people/${playerId}/stats`);
const team = await makeMLBApiRequest(`/teams/${playerData.teamId}`);

// ✅ Single hydrated request
const playerData = await makeMLBApiRequest(
  `/people/${playerId}?hydrate=stats,team`
);
```

### 5. Implement Retry Logic

Add retry logic for transient failures:

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry<T>(url: string, version: string): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await makeMLBApiRequest<T>(url, version);
    } catch (error) {
      console.warn(`Error fetching ${url} (attempt ${attempt}/${MAX_RETRIES}):`, error);
      lastError = error;
      
      if (attempt < MAX_RETRIES) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
}
```

## Troubleshooting

### Common Issues and Solutions

#### Rate Limiting

**Symptom**: Frequent 429 errors ("Too Many Requests")

**Solution**:
- Implement exponential backoff
- Add jitter to retry intervals
- Optimize caching to reduce request volume

#### API Version Mismatches

**Symptom**: Unexpected fields missing in responses

**Solution**:
- Check API version in request ('V1' vs 'V11')
- Review API documentation for changes
- Capture and analyze response examples

#### Hydration Errors

**Symptom**: Missing or unexpected data in hydrated responses

**Solution**:
- Check hydration syntax (e.g., proper bracket usage)
- Verify hydration parameter support for the endpoint
- Split complex hydrations into multiple requests

## Reference Documentation

- [MLB API Reference](/knowledge/reference/api/mlb-api.md): Detailed MLB API endpoints
- [Savant API Reference](/knowledge/reference/api/savant-api.md): Baseball Savant API details
- [Hydration Reference](/knowledge/reference/api/hydration.md): MLB API hydration parameters
- [API Capture Guide](/knowledge/guides/api-capture-guide.md): How to capture API responses