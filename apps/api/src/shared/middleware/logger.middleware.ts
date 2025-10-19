import type { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '@ghit/core';

const logger = Logger.getInstance();

/**
 * Request logger middleware
 * Logs incoming requests and their responses
 */
export async function loggerMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now();

  // Log incoming request
  logger.info(
    {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    },
    'Incoming request'
  );

  // Hook to log response
  reply.raw.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration,
      },
      'Request completed'
    );
  });
}

/**
 * Create a child logger with request context
 */
export function createRequestLogger(request: FastifyRequest) {
  return logger.child({
    requestId: request.id,
    method: request.method,
    url: request.url,
  });
}
