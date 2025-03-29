import { markAsApiSource } from "../cache";

export const MLB_API_BASE = "https://statsapi.mlb.com/api";

// API versions
export const API_VERSION = {
  V1: "v1",
  V11: "v1.1",
} as const;

export const MLB_API_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// Rate limiting configuration
export const RATE_LIMIT = {
  capacity: 20,          // Max tokens in the bucket
  refillRate: 20,        // Tokens per second to refill
  interval: 1000,        // Refill interval in ms (1 second)
  retries: 3,            // Number of retries for failed requests
  retryDelay: 1000,      // Base delay between retries in ms
  maxRetryDelay: 5000,   // Maximum retry delay in ms
};

// Token bucket implementation for more precise rate limiting
class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;
  private refillTimer: NodeJS.Timeout | null;
  
  constructor(
    private capacity: number,
    private refillRate: number,
    private refillInterval: number
  ) {
    this.tokens = capacity;
    this.lastRefillTime = Date.now();
    this.refillTimer = null;
    this.startRefillTimer();
  }

  private startRefillTimer() {
    // Clear any existing timer
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
    }
    
    // Set up periodic refill
    this.refillTimer = setInterval(() => this.refill(), this.refillInterval);
  }

  private refill() {
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTime;
    const tokensToAdd = Math.floor((elapsedTime / this.refillInterval) * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTime = now;
    }
  }

  public async getToken(): Promise<void> {
    this.refill(); // Refill before checking if we have tokens
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }
    
    // Calculate wait time until next token is available
    const waitTime = Math.ceil(this.refillInterval / this.refillRate);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return this.getToken(); // Try again after waiting
  }

  // For testing/monitoring purposes
  public getTokenCount(): number {
    return this.tokens;
  }
}

// Create a singleton token bucket
export const apiRateLimiter = new TokenBucket(
  RATE_LIMIT.capacity,
  RATE_LIMIT.refillRate,
  RATE_LIMIT.interval
);

export async function checkRateLimit() {
  return apiRateLimiter.getToken();
}

// Helper function for making API requests with rate limiting and exponential backoff
export async function makeMLBApiRequest<T>(
  endpoint: string,
  version: keyof typeof API_VERSION = "V1",
  options: RequestInit = {}
): Promise<T> {
  // Acquire a token from the rate limiter
  await checkRateLimit();

  const url = `${MLB_API_BASE}/${API_VERSION[version]}${endpoint}`;
  
  // Extract requested season from URL for debugging purposes
  // This will be helpful for tracking historical data requests
  const seasonMatch = endpoint.match(/season=(\d{4})/);
  const requestedSeason = seasonMatch ? seasonMatch[1] : null;

  const requestOptions: RequestInit = {
    headers: MLB_API_HEADERS,
    ...options,
    // Add timeout for fetch
    signal: AbortSignal.timeout(30000), // 30 second timeout
  };

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < RATE_LIMIT.retries; attempt++) {
    try {
      // Add request ID for debugging/tracking
      const requestId = Math.random().toString(36).substring(2, 10);
      const requestStart = Date.now();
      const augmentedOptions = {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'X-Request-ID': requestId,
        }
      };
      
      console.log(`Making MLB API request to ${endpoint} (attempt ${attempt + 1}/${RATE_LIMIT.retries})`);
      const response = await fetch(url, augmentedOptions);
      const requestDuration = Date.now() - requestStart;
      
      // Handle different status codes
      if (response.status === 429) {
        // Handle rate limiting with exponential backoff
        const retryAfter = response.headers.get('Retry-After');
        let waitTime = RATE_LIMIT.retryDelay * Math.pow(2, attempt);
        
        // Use Retry-After header if available
        if (retryAfter) {
          const retrySeconds = parseInt(retryAfter, 10);
          if (!isNaN(retrySeconds)) {
            waitTime = retrySeconds * 1000;
          }
        }
        
        // Apply maximum limit to prevent excessive waits
        waitTime = Math.min(waitTime, RATE_LIMIT.maxRetryDelay);
        
        console.warn(`Rate limit hit for ${endpoint}, waiting ${waitTime}ms before retry (attempt ${attempt + 1}/${RATE_LIMIT.retries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.status === 504 || response.status === 503) {
        // Gateway timeout or service unavailable - use exponential backoff
        const waitTime = RATE_LIMIT.retryDelay * Math.pow(2, attempt);
        console.warn(`Server error ${response.status} for ${endpoint}, retrying in ${waitTime}ms (attempt ${attempt + 1}/${RATE_LIMIT.retries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `MLB API error: ${response.status} ${response.statusText} for ${endpoint}`
        );
      }

      // Log successful response time for monitoring
      if (requestDuration > 500) {
        console.warn(`Slow API request to ${endpoint}: ${requestDuration}ms`);
      }

      // Check content type to ensure we're getting JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get some of the response text for debugging
        const responseText = await response.text();
        const previewText = responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '');
        throw new Error(`Failed to parse JSON response: Received ${contentType || 'unknown content type'} instead of JSON. Preview: ${previewText}`);
      }
      
      try {
        const data = await response.json();
        
        // If we extracted a season from the URL, attach it to the response
        // This helps with historical data requests
        if (requestedSeason) {
          (data as any).__requestedSeason = requestedSeason;
        }
        
        // Log data shape for debugging if there's no people array and it was expected
        if (endpoint.includes('/people/') && !data.people) {
          console.warn(`Unexpected data shape for player request to ${endpoint}`);
          console.log(`Response keys: ${Object.keys(data).join(', ')}`);
        }
        
        return data;
      } catch (jsonError) {
        throw new Error(`Failed to parse JSON from response: ${jsonError.message}`);
      }
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < RATE_LIMIT.retries - 1) {
        // Use exponential backoff with jitter for retries
        const jitter = Math.random() * 0.3 + 0.85; // Random factor between 0.85 and 1.15
        const waitTime = Math.min(
          RATE_LIMIT.retryDelay * Math.pow(2, attempt) * jitter, 
          RATE_LIMIT.maxRetryDelay
        );
        
        console.error(`Error fetching ${endpoint} (attempt ${attempt + 1}/${RATE_LIMIT.retries}): ${(error as Error).message}`);
        console.error(`Retrying in ${Math.round(waitTime)}ms`);
        
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch data from ${endpoint} after ${RATE_LIMIT.retries} retries`);
}