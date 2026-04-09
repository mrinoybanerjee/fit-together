// Shared 5-minute in-memory cache for Whoop + Terra API responses.
// Prevents rate limit abuse (Terra free tier: 100 calls/day).
//
// Cache flow:
//  get(key) → null (miss) → caller fetches API → set(key, data)
//  get(key) → data (hit, <5min) → return cached

const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function set(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export function invalidate(key) {
  cache.delete(key);
}

export function clear() {
  cache.clear();
}

export default { get, set, invalidate, clear };
