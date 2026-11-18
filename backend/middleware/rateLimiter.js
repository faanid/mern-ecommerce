const windows = new Map();

export const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  now = () => Date.now(),
}) => {
  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const currentTime = now();
    let entry = windows.get(key);

    if (!entry || currentTime >= entry.resetAt) {
      entry = { count: 0, resetAt: currentTime + windowMs };
      windows.set(key, entry);
    }

    entry.count += 1;

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000))));
      res.status(429).json({ message });
      return;
    }

    // Opportunistically discard expired entries to bound memory usage.
    if (windows.size > 1000) {
      for (const [storedKey, storedEntry] of windows) {
        if (currentTime >= storedEntry.resetAt) windows.delete(storedKey);
      }
    }

    next();
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts. Please try again in an hour.",
});
