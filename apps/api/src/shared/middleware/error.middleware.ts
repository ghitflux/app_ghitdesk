import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '@ghit/core';
import { ZodError } from 'zod';

const logger = Logger.getInstance();

/**
 * Global error handler middleware
 */
export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // Log error with context
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
      },
    },
    'Request error'
  );

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation,
    });
  }

  // Handle specific error codes
  switch (error.statusCode) {
    case 400:
      return reply.code(400).send({
        error: 'Bad Request',
        message: error.message,
      });

    case 401:
      return reply.code(401).send({
        error: 'Unauthorized',
        message: error.message || 'Authentication required',
      });

    case 403:
      return reply.code(403).send({
        error: 'Forbidden',
        message: error.message || 'Insufficient permissions',
      });

    case 404:
      return reply.code(404).send({
        error: 'Not Found',
        message: error.message || 'Resource not found',
      });

    case 409:
      return reply.code(409).send({
        error: 'Conflict',
        message: error.message,
      });

    case 429:
      return reply.code(429).send({
        error: 'Too Many Requests',
        message: error.message || 'Rate limit exceeded',
      });

    default:
      // Internal server error
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      });
  }
}

/**
 * Not found handler
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  logger.debug({ method: request.method, url: request.url }, 'Route not found');

  return reply.code(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
  });
}
