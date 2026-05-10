const logger = require('./logger');

let redisClient = null;
const memoryCache = new Map();
const DEFAULT_TTL = Number(process.env.CACHE_TTL_SECONDS || 60);

async function connectRedis() {
  if (process.env.CACHE_DRIVER === 'memory') {
    logger.info('Memory cache enabled by CACHE_DRIVER=memory');
    return null;
  }

  try {
    const { createClient } = require('redis');
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (error) => {
      logger.warn('Redis error. Memory cache fallback is used.', { message: error.message });
    });

    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('Redis cache connected');
    }

    return redisClient;
  } catch (error) {
    redisClient = null;
    logger.warn('Redis is not available. Memory cache fallback is used.', { message: error.message });
    return null;
  }
}

function isRedisReady() {
  return redisClient && redisClient.isOpen;
}

function buildKey(req) {
  return `cache:${req.method}:${req.originalUrl}`;
}

async function getCache(key) {
  if (isRedisReady()) {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
}

async function setCache(key, value, ttlSeconds = DEFAULT_TTL) {
  if (isRedisReady()) {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function delByPrefix(prefix) {
  if (isRedisReady()) {
    const keys = await redisClient.keys(`${prefix}*`);
    if (keys.length) await redisClient.del(keys);
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}

function cacheMiddleware(ttlSeconds = DEFAULT_TTL) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = buildKey(req);

    try {
      const cached = await getCache(key);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, ttlSeconds).catch((error) => {
            logger.warn('Cache save failed', { message: error.message });
          });
        }

        res.set('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.warn('Cache middleware skipped', { message: error.message });
      next();
    }
  };
}

module.exports = {
  connectRedis,
  cacheMiddleware,
  delByPrefix,
  getCache,
  setCache,
};
