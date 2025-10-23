// Cache implementation using in-memory store (can be easily replaced with Redis in production)

interface CacheItem {
  value: unknown;
  expiry: number;
  tags?: string[];
}

class CacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private readonly defaultTTL = 300; // 5 minutes in seconds

  constructor() {
    // Clean up expired items every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  set(key: string, value: unknown, ttlSeconds?: number, tags?: string[]): void {
    const expiry = Date.now() + (ttlSeconds || this.defaultTTL) * 1000;
    this.cache.set(key, { value, expiry, tags });
  }

  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalidate cache entries by tags
  invalidateByTags(tags: string[]): number {
    let count = 0;
    for (const [key, item] of this.cache.entries()) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  // Get cache statistics
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to implement hit/miss tracking
      misses: 0,
    };
  }

  // Cache with function wrapper
  async remember<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttlSeconds, tags);
    return result;
  }
}

// Create singleton instance
const cache = new CacheManager();

// Cache key generators
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user-profile:${id}`,
  designerProfile: (id: string) => `designer-profile:${id}`,
  supplierProfile: (id: string) => `supplier-profile:${id}`,
  designers: (filters: string) => `designers:${filters}`,
  suppliers: (filters: string) => `suppliers:${filters}`,
  portfolio: (userId: string) => `portfolio:${userId}`,
  reviews: (userId: string) => `reviews:${userId}`,
  analytics: (userId: string, range: string) => `analytics:${userId}:${range}`,
  platformStats: (range: string) => `platform-stats:${range}`,
  searchResults: (query: string, filters: string) => `search:${query}:${filters}`,
  conversation: (id: string) => `conversation:${id}`,
  messages: (conversationId: string) => `messages:${conversationId}`,
};

// Cache tags for invalidation
export const CacheTags = {
  USER: 'user',
  DESIGNER: 'designer',
  SUPPLIER: 'supplier',
  PORTFOLIO: 'portfolio',
  REVIEWS: 'reviews',
  ANALYTICS: 'analytics',
  SEARCH: 'search',
  MESSAGES: 'messages',
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

// Helper functions for common caching patterns
export const cacheUser = (user: Record<string, unknown>) => {
  cache.set(CacheKeys.user(user.id), user, CacheTTL.MEDIUM, [CacheTags.USER]);
};

export const getCachedUser = (id: string) => {
  return cache.get(CacheKeys.user(id));
};

export const invalidateUserCache = (id: string) => {
  cache.delete(CacheKeys.user(id));
  cache.delete(CacheKeys.userProfile(id));
  cache.invalidateByTags([CacheTags.USER]);
};

export const cacheSearchResults = (key: string, results: unknown, ttl: number = CacheTTL.SHORT) => {
  cache.set(key, results, ttl, [CacheTags.SEARCH]);
};

export const invalidateSearchCache = () => {
  cache.invalidateByTags([CacheTags.SEARCH]);
};

export const cacheAnalytics = (key: string, data: unknown, ttl: number = CacheTTL.MEDIUM) => {
  cache.set(key, data, ttl, [CacheTags.ANALYTICS]);
};

export const invalidateAnalyticsCache = (userId?: string) => {
  if (userId) {
    // Invalidate specific user analytics
    ['7d', '30d', '90d', '1y'].forEach(range => {
      cache.delete(CacheKeys.analytics(userId, range));
    });
  } else {
    // Invalidate all analytics
    cache.invalidateByTags([CacheTags.ANALYTICS]);
  }
};

// Database query caching wrapper
export const withCache = async <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM,
  tags?: string[]
): Promise<T> => {
  return cache.remember(key, queryFn, ttl, tags);
};

// Export the cache instance
export default cache;