/**
 * Auth-related TypeScript types
 */

export type UserRole = 'customer' | 'vendor';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: AuthUser;
    token: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
