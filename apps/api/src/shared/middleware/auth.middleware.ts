import type { FastifyRequest, FastifyReply } from 'fastify';
import { BetterAuthService } from '../../infrastructure/auth/BetterAuthService';
import { Logger } from '@ghit/core';

const logger = Logger.getInstance();
const betterAuth = BetterAuthService.getInstance();

/**
 * Extract token from Authorization header
 */
function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Support "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Support direct token
  return authHeader;
}

/**
 * Authentication middleware
 * Verifies session token and attaches user to request
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = extractToken(request);

  if (!token) {
    logger.debug({ path: request.url }, 'No authentication token provided');
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Authentication token required',
    });
  }

  try {
    const session = await betterAuth.verifySession(token);

    if (!session || !session.user) {
      logger.debug({ path: request.url }, 'Invalid authentication token');
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Attach user to request
    (request as any).user = session.user;
    (request as any).session = session.session;

    logger.debug({ userId: session.user.id, path: request.url }, 'User authenticated');
  } catch (error) {
    logger.error({ error, path: request.url }, 'Authentication error');
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * Does not fail if no token is provided, but verifies if present
 */
export async function optionalAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = extractToken(request);

  if (!token) {
    return; // No token, continue without user
  }

  try {
    const session = await betterAuth.verifySession(token);

    if (session && session.user) {
      (request as any).user = session.user;
      (request as any).session = session.session;
      logger.debug({ userId: session.user.id, path: request.url }, 'User authenticated (optional)');
    }
  } catch (error) {
    logger.debug({ error, path: request.url }, 'Optional authentication failed, continuing without user');
    // Continue without user
  }
}

/**
 * Role-based authorization middleware factory
 */
export function requireRoles(...roles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;

    if (!user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const userRoles = user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      logger.warn({ userId: user.id, requiredRoles: roles, userRoles }, 'Insufficient permissions');
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    logger.debug({ userId: user.id, roles }, 'Authorization successful');
  };
}

/**
 * Declare user property on FastifyRequest
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      roles?: string[];
    };
    session?: {
      token: string;
      expiresAt: Date;
    };
  }
}
