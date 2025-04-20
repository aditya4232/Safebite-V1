/**
 * Simple in-memory cache service with TTL (Time To Live)
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get an item from the cache
   * @param key - Cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set an item in the cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional, defaults to 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Remove an item from the cache
   * @param key - Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set cache item with a factory function
   * @param key - Cache key
   * @param factory - Function to create the data if not in cache
   * @param ttl - Time to live in milliseconds (optional)
   * @returns The cached or newly created data
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedItem = this.get<T>(key);
    if (cachedItem !== null) {
      return cachedItem;
    }
    
    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }
}

// Export a singleton instance
export const cacheService = new CacheService();
