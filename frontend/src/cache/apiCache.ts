// apiCache.ts
// This is our local cache. Every API call goes through here.
// If fresh data exists, return it instantly.
// If stale, fetch fresh data, store it, return it.

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

const cache: Record<string, CacheEntry> = {};

export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMinutes: number = 5
): Promise<{ data: T; lastUpdated: Date; isStale: boolean }> {
  const now = Date.now();
  const ttlMs = ttlMinutes * 60 * 1000;
  const existing = cache[key];

  // If we have fresh data, return it immediately
  if (existing && now - existing.timestamp < existing.ttl) {
    return {
      data: existing.data as T,
      lastUpdated: new Date(existing.timestamp),
      isStale: false,
    };
  }

  // Otherwise fetch fresh data
  try {
    const data = await fetchFn();
    cache[key] = { data, timestamp: now, ttl: ttlMs };
    return {
      data,
      lastUpdated: new Date(now),
      isStale: false,
    };
  } catch (error) {
    // If fetch fails but we have stale data, return it with a warning
    if (existing) {
      console.warn(`[Cache] Fetch failed for ${key}, serving stale data`);
      return {
        data: existing.data as T,
        lastUpdated: new Date(existing.timestamp),
        isStale: true,
      };
    }
    throw error;
  }
}