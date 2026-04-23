/**
 * Auth Error Classification and Utilities
 * Distinguishes between auth failures, network issues, and server errors
 */

export enum AuthErrorType {
  /** User is not authenticated (no token) */
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  /** Token expired or invalid (401 from server) */
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  /** Network/fetch error (no response or connection issue) */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Server error (5xx or other non-auth error) */
  SERVER_ERROR = 'SERVER_ERROR',
  /** Backend not configured */
  CONFIG_ERROR = 'CONFIG_ERROR',
}

/**
 * Typed auth error with classification
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  statusCode?: number;
}

/**
 * Create a typed auth error for error handling
 */
export function createAuthError(
  type: AuthErrorType,
  message: string,
  statusCode?: number
): AuthError {
  return { type, message, statusCode };
}

/**
 * Check if an error message indicates a session/auth issue
 */
export function isAuthError(error: any): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('session expired') ||
    msg.includes('not authenticated') ||
    msg.includes('unauthorized')
  );
}

/**
 * Check if an error is retryable (network/server errors, but not auth errors)
 */
export function isRetryableError(error: any): boolean {
  if (!isAuthError(error)) {
    return true; // Network and server errors are retryable
  }
  return false; // Auth errors are not retryable
}
