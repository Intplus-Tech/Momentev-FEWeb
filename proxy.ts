import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

const AUTH_TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'refresh-token';

type UserRole = 'customer' | 'vendor';

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

// Routes that require authentication
const protectedPatterns = [
  /^\/client\/(?!auth).*/,  // /client/* except /client/auth/*
  /^\/vendor\/(?!auth).*/,  // /vendor/* except /vendor/auth/*
];

// Routes that should redirect authenticated users (auth pages)
const authPatterns = [
  /^\/client\/auth\/.*/,
  /^\/vendor\/auth\/.*/,
];

function isProtectedRoute(pathname: string): boolean {
  return protectedPatterns.some(pattern => pattern.test(pathname));
}

function isAuthRoute(pathname: string): boolean {
  return authPatterns.some(pattern => pattern.test(pathname));
}

function getLoginRedirect(pathname: string): string {
  if (pathname.startsWith('/vendor')) {
    return '/vendor/auth/log-in';
  }
  return '/client/auth/log-in';
}

function getDashboardRedirect(role: UserRole): string {
  if (role === 'vendor') {
    return '/vendor/dashboard';
  }
  return '/client/dashboard';
}

/**
 * Decode JWT token to extract payload (without verification - verification happens on backend)
 */
function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = decodeJwt(token) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if user role matches the route they're trying to access
 */
function isRoleAllowedForRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith('/client') && role === 'customer') {
    return true;
  }
  if (pathname.startsWith('/vendor') && role === 'vendor') {
    return true;
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  const hasValidAuth = authToken || refreshToken;

  // Decode token to get user role
  let userRole: UserRole | null = null;
  if (authToken) {
    const payload = decodeToken(authToken);
    if (payload) {
      userRole = payload.role;
    }
  }

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname)) {
    if (!hasValidAuth) {
      const loginUrl = new URL(getLoginRedirect(pathname), request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If no access token but has refresh token, try to refresh
    if (!authToken && refreshToken && process.env.BACKEND_URL) {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          const newToken = data?.data?.token;

          if (newToken) {
            // Decode the new token to get the role
            const payload = decodeToken(newToken);
            if (payload) {
              userRole = payload.role;
            }

            const res = NextResponse.next();
            res.cookies.set(AUTH_TOKEN_KEY, newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60, // 1 hour
            });

            // Check role after getting new token
            if (userRole && !isRoleAllowedForRoute(userRole, pathname)) {
              const correctDashboard = new URL(getDashboardRedirect(userRole), request.url);
              return NextResponse.redirect(correctDashboard);
            }

            return res;
          }
        }

        // Refresh failed - clear cookies and redirect to login
        const loginUrl = new URL(getLoginRedirect(pathname), request.url);
        loginUrl.searchParams.set('from', pathname);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete(AUTH_TOKEN_KEY);
        res.cookies.delete(REFRESH_TOKEN_KEY);
        return res;
      } catch {
        // Refresh request failed - redirect to login
        const loginUrl = new URL(getLoginRedirect(pathname), request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Check if user role matches the route
    if (userRole && !isRoleAllowedForRoute(userRole, pathname)) {
      // Redirect to the correct dashboard for their role
      const correctDashboard = new URL(getDashboardRedirect(userRole), request.url);
      return NextResponse.redirect(correctDashboard);
    }
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    if (hasValidAuth && userRole) {
      const dashboardUrl = new URL(getDashboardRedirect(userRole), request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/vendor/:path*',
  ],
};
