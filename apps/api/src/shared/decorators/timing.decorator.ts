import { Logger } from '@ghit/core';

const logger = Logger.getInstance();

/**
 * Timing decorator
 * Measures and logs execution time of methods
 */
export function Timing() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const className = target.constructor.name;

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        logger.debug(
          {
            class: className,
            method: propertyKey,
            duration,
          },
          'Method execution completed'
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error(
          {
            class: className,
            method: propertyKey,
            duration,
            error,
          },
          'Method execution failed'
        );

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache decorator
 * Caches method results for a specified time
 */
export function Cache(ttlSeconds: number = 60) {
  const cache = new Map<string, { value: any; expiresAt: number }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      const now = Date.now();

      // Check cache
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        logger.debug({ cacheKey }, 'Cache hit');
        return cached.value;
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      cache.set(cacheKey, {
        value: result,
        expiresAt: now + ttlSeconds * 1000,
      });

      logger.debug({ cacheKey, ttlSeconds }, 'Cache miss - stored result');

      return result;
    };

    return descriptor;
  };
}
