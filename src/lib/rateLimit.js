export const rateLimitCache = new Map();

const CLEANUP_INTERVAL_MS = 60_000;

let lastCleanup = Date.now();

function evictExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimitCache) {
    if (now > record.resetTime) rateLimitCache.delete(ip);
  }
}

/**
 * Checks if a given IP has exceeded its rate limit.
 * @param {string} ip - The IP address of the client.
 * @param {number} maxRequests - Maximum allowed requests in the time window.
 * @param {number} windowMs - The time window in milliseconds.
 * @returns {boolean} - Returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(ip, maxRequests = 5, windowMs = 60 * 1000) {
  evictExpired();
  const now = Date.now();

  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimitCache.get(ip);
  if (now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}
