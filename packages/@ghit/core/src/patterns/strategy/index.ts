/**
 * Strategy Pattern Exports
 *
 * These classes follow the Strategy pattern to define different algorithms
 * for authentication and SLA calculations.
 */

// Auth Strategies
export {
  AuthStrategy,
  AuthUser,
  AuthResult,
  VerifyResult,
  isAuthStrategy,
} from './AuthStrategy';

export { JWTAuthStrategy, JWTConfig } from './JWTAuthStrategy';

export { SessionAuthStrategy, SessionConfig } from './SessionAuthStrategy';

// SLA Strategies
export {
  SLAStrategy,
  SLATargets,
  SLABreach,
  SLAResult,
  BusinessHoursConfig,
  HighPrioritySLAStrategy,
  MediumPrioritySLAStrategy,
  LowPrioritySLAStrategy,
  getSLAStrategy,
} from './SLAStrategy';
