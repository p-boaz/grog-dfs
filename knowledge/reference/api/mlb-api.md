---
description: 
globs: 
alwaysApply: false
---
# MLB API Integration Guide

This document outlines the structure of the MLB Stats API integration, including implementation details, endpoint information, and best practices for working with MLB data in the system.

## API Client Implementation

### Core Design

The MLB API client is implemented in `/lib/mlb/core/api-client.ts` with these key features:

- Centralized request management through `makeMLBApiRequest()`
- Strong typing with Zod schemas for runtime validation
- Comprehensive error handling and logging

### Rate Limiting

```typescript
// Token bucket implementation for precise rate limiting
const mlbRateLimiter = new TokenBucket({
  capacity: 20,         // 20 requests max capacity
  refillRate: 20,       // 20 tokens per second refill
  refillInterval: 1000  // Refill every second
});
```

- Uses token bucket algorithm for accurate rate control
- Queues requests when rate limit is reached
- Distributes requests evenly to prevent API throttling

### Retry Strategy

```typescript
// Exponential backoff with jitter
const retryOptions = {
  retries: 3,
  minTimeout: 1000,    // Base 1 second delay
  maxTimeout: 5000,    // Maximum 5 second delay
  factor: 2,           // Exponential factor
  randomize: true,     // Add jitter (0.85-1.15 multiplier)
  onRetry: (error) => logRetryAttempt(error)
};
```

- Implements exponential backoff pattern
- Honors Retry-After headers in 429 responses
- Adds randomized jitter to prevent thundering herd

### Caching System

```typescript
// Cache implementation with varying TTLs by data type
export const withCache = <T>(
  key: string,
  ttlMs: number,
  fetchFn: () => Promise<T>
): Promise<T> => {
  // Cache implementation with expiration handling
};
```

- In-memory cache with configurable TTL
- Default TTLs by data type:
  - Schedule data: 1 hour
  - Player data: 6 hours
  - Game data: 5 minutes
  - Lineup data: 15 minutes
- Invalidation functions for manual refreshing

## Main Endpoints and Data Structures

### Schedule Endpoint

```typescript
// GET /api/v1/schedule
interface GameSchedule {
  dates: {
    date: string;
    games: {
      gamePk: number;
      gameDate: string;
      status: {statusCode: string};
      teams: {
        away: {team: Team, score: number};
        home: {team: Team, score: number};
      };
      venue: {id: number, name: string};
    }[];
  }[];
}
```

- Used for retrieving game schedules by date
- Contains basic game information and status
- Available at `/api/v1/schedule?date=YYYY-MM-DD`

### Player Endpoint

```typescript
// GET /api/v1/people/{id}
interface PlayerResponse {
  people: {
    id: number;
    fullName: string;
    firstName: string;
    lastName: string;
    primaryNumber: string;
    currentTeam: {id: number, name: string};
    primaryPosition: {code: string, name: string};
    batSide: {code: string};
    pitchHand: {code: string};
    stats?: PlayerStats[];
  }[];
}
```

- Retrieves detailed player information
- Can include stats with `?hydrate=stats(group=[hitting,pitching],type=season)`
- Supports specific season filtering with `&season=2024`

### Game Feed Endpoint

```typescript
// GET /api/v1.1/game/{id}/feed/live
interface GameFeedResponse {
  gameData: {
    game: {pk: number};
    datetime: {dateTime: string};
    status: {abstractGameState: string};
    teams: {away: Team, home: Team};
    venue: {id: number, name: string};
    weather: {condition: string, temp: string, wind: string};
  };
  liveData: {
    boxscore: {/* Box score data */};
    plays: {/* Detailed play data */};
    linescore: {/* Line score data */};
  };
}
```

- Provides comprehensive live game data
- Contains detailed play-by-play information
- Includes current game state and statistics

### Box Score Endpoint

```typescript
// GET /api/v1/game/{id}/boxscore
interface GameBoxScoreResponse {
  teams: {
    away: {
      team: Team;
      players: Record<string, BoxScorePlayer>;
      teamStats: TeamStats;
    };
    home: {
      team: Team;
      players: Record<string, BoxScorePlayer>;
      teamStats: TeamStats;
    };
  };
  officials: Array<{official: {fullName: string}, officialType: string}>;
  info: Array<{label: string, value: string}>;
}
```

- Contains detailed game statistics
- Organized by team (away/home)
- Includes player performance data

## Best Practices for Handling MLB API

### Response Validation

```typescript
// Example of response validation with fallback
const validatePlayerResponse = (data: unknown): PlayerResponse => {
  try {
    return playerResponseSchema.parse(data);
  } catch (error) {
    logger.warn('Invalid player response format', { error });
    return defaultPlayerResponse();
  }
};
```

1. Always validate response structures with schemas
2. Implement fallback strategies for missing or invalid data
3. Log validation errors for debugging

### Error Handling

```typescript
// Robust error handling pattern
try {
  const response = await makeMLBApiRequest(url, options);
  return processResponse(response);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limiting specifically
    logger.warn('MLB API rate limit reached', { retryAfter: error.retryAfter });
    return fallbackStrategy();
  }
  
  if (error instanceof ApiError) {
    // Handle API-specific errors
    logger.error('MLB API error', { statusCode: error.statusCode, message: error.message });
    return defaultResponse();
  }
  
  // Handle unexpected errors
  logger.error('Unexpected error fetching MLB data', { error });
  throw error;
}
```

1. Use specific error types for different failure modes
2. Implement fallbacks for common error scenarios
3. Log detailed error information for troubleshooting
4. Consider retrying only for transient failures

### Data Processing

```typescript
// Process player stats with proper typing
const processPlayerStats = (
  stats: PlayerStats[],
  year: number = currentYear
): ProcessedPlayerStats => {
  // Find current season stats first
  const currentYearStats = stats.find(s => s.season === year.toString());
  
  // Fall back to previous season if current not available
  const prevYearStats = stats.find(s => s.season === (year - 1).toString());
  
  // Create normalized stats object with defaults for missing values
  return {
    avg: currentYearStats?.avg ?? prevYearStats?.avg ?? .000,
    obp: currentYearStats?.obp ?? prevYearStats?.obp ?? .000,
    // Other stats processing...
  };
};
```

1. Normalize inconsistent field names across endpoints
2. Provide sensible defaults for missing values
3. Implement fallback chains (current season → previous season → default)
4. Document data transformations for maintainability

## Common Pitfalls and Solutions

### Rate Limiting Issues

- **Problem**: API returns 429 Too Many Requests
- **Solution**: Implement token bucket algorithm with proper capacity
- **Prevention**: Monitor request patterns and adjust rate limiting parameters

### Stale Data

- **Problem**: Cached data becomes outdated
- **Solution**: Use appropriate TTL values by data type
- **Prevention**: Provide cache invalidation methods for time-sensitive operations

### Missing Data Fields

- **Problem**: Expected fields missing from API response
- **Solution**: Always use optional chaining and fallback values
- **Prevention**: Validate responses against schemas with default values

### API Changes

- **Problem**: MLB API structure changes without notice
- **Solution**: Use loose typing when needed, implement version detection
- **Prevention**: Regularly test integration points, implement alerting

## Testing and Monitoring

1. **Integration Tests**: Verify core API functionality
2. **Mock Responses**: Use recorded responses for predictable tests
3. **Request Logging**: Track all API calls with timing information
4. **Error Alerting**: Set up alerts for unusual error patterns
5. **Rate Monitoring**: Track request rates and throttling incidents

## Conclusion

The MLB API integration provides comprehensive access to baseball data with robust error handling, caching, and rate limiting. Follow the best practices outlined in this document to ensure reliable data access and processing.