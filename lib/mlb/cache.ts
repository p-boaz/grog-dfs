/**
 * Cache utility for MLB API responses
 * Simple in-memory cache with TTL support
 */

// Cache default TTL (time-to-live) settings in milliseconds
export const DEFAULT_CACHE_TTL = {
  schedule: 60 * 60 * 1000, // 1 hour
  weather: 30 * 60 * 1000,  // 30 minutes
  player: 6 * 60 * 60 * 1000, // 6 hours
  game: 5 * 60 * 1000,   // 5 minutes
  lineups: 15 * 60 * 1000, // 15 minutes
  default: 60 * 60 * 1000  // 1 hour
};

// Internal cache store
const cache: Record<string, { value: any; expires: number; isApiSource?: boolean }> = {};

/**
 * Marker for API sourced data
 */
export function markAsApiSource<T>(data: T): T {
  if (data && typeof data === 'object') {
    (data as any).__isApiSource = true;
  }
  return data;
}

/**
 * Check if data is from API
 */
export function isApiSource(data: any): boolean {
  return !!(data && typeof data === 'object' && (data as any).__isApiSource);
}

/**
 * Higher-order function to add caching to any async function
 * @param fn The function to cache
 * @param keyPrefix Prefix for cache keys
 * @param ttl Time-to-live in milliseconds
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  ttl: number = DEFAULT_CACHE_TTL.default
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Generate cache key from function name, prefix and arguments
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    
    // Check if we have a valid cached value
    const now = Date.now();
    const cached = cache[key];
    
    if (cached && cached.expires > now) {
      // Check if it's an API source and needs to be marked
      if (cached.isApiSource) {
        return cached.value;
      }
      return cached.value;
    }
    
    // Otherwise, call the function and cache the result
    const result = await fn(...args);
    
    // Store in cache
    cache[key] = { 
      value: result, 
      expires: now + ttl,
      isApiSource: isApiSource(result)
    };
    
    return result;
  }) as T;
}

/**
 * Invalidate a specific cache entry
 * @param keyPrefix Prefix for cache keys 
 * @param args Arguments to generate the cache key
 */
export function invalidateCache(keyPrefix: string, args: any[] = []): void {
  const key = `${keyPrefix}:${JSON.stringify(args)}`;
  delete cache[key];
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  for (const key in cache) {
    delete cache[key];
  }
}