'use strict';

/**
 * Small in-memory, fixed-window rate limiter (no dependency).
 * NOTE: counters live in process memory. On serverless platforms (Vercel) each
 * instance keeps its own counters, so treat this as basic protection and add
 * a platform-level firewall / Redis-backed limiter if you need strict limits.
 */
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map(); // key -> { count, resetAt }

  const purge = (now) => {
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  };

  const middleware = (req, res, next) => {
    const now = Date.now();
    if (hits.size > 10000) purge(now);

    const key = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    const remaining = Math.max(max - entry.count, 0);
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(remaining));
    res.set('RateLimit-Reset', String(Math.ceil((entry.resetAt - now) / 1000)));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please wait a while and try again.',
      });
    }
    return next();
  };

  middleware.reset = () => hits.clear();
  return middleware;
}

module.exports = { createRateLimiter };
