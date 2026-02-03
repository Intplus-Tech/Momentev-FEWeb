'use server';

import { redirect } from 'next/navigation';
import { setAuthCookies, clearAuthCookies, getRefreshToken, refreshAccessToken } from '@/lib/session';
import type { LoginResponse } from '@/types/auth';

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
};

export async function register(input: RegisterInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        role: input.role ?? 'CUSTOMER',
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
      }
      const message = (data as { message?: string } | null)?.message;
      return { success: false, error: message || `Failed to register (${response.status})` };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}


export type LoginInput = {
  email: string;
  password: string;
  remember?: boolean;
  expectedRole?: 'CUSTOMER' | 'VENDOR';
};

export async function login(input: LoginInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null) as LoginResponse | null;

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Too many login attempts. Please wait a moment and try again.' };
      }
      const message = (data as { message?: string } | null)?.message;
      return { success: false, error: message || `Failed to login (${response.status})` };
    }

    const token = data?.data?.token;
    const refreshToken = data?.data?.refreshToken;

    // Validate tokens exist
    if (!token || !refreshToken) {
      return { success: false, error: 'Invalid authentication response from server' };
    }

    // Decode JWT token to extract role (without verifying signature - that's the server's job)
    let tokenRole: string | undefined;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false, error: 'Invalid token format' };
      }
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      tokenRole = payload.role;

      if (!tokenRole) {
        return { success: false, error: 'Token missing required role information' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to decode authentication token' };
    }

    // Validate user role if expectedRole is provided (case-insensitive comparison)
    if (input.expectedRole && tokenRole.toUpperCase() !== input.expectedRole) {
      const roleLabel = input.expectedRole === 'VENDOR' ? 'vendor' : 'client';
      const correctPage = input.expectedRole === 'VENDOR' ? '/client/auth/log-in' : '/vendor/auth/log-in';
      return {
        success: false,
        error: `This account is not registered as a ${roleLabel}. Please use the correct login page.`,
        redirectTo: correctPage
      };
    }

    // Store tokens in HTTP-only cookies (only after all validations pass)
    await setAuthCookies(token, refreshToken, input.remember ?? false);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export type ResendVerificationInput = {
  email: string;
};

export async function resendVerificationEmail(input: ResendVerificationInput) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/resend-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
      }
      const message = (data as { message?: string } | null)?.message;
      return { success: false, error: message || `Failed to resend verification email (${response.status})` };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Verify email with token from verification email link
 */
export async function verifyEmail(token: string) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    if (!token) {
      return { success: false, error: 'Verification token is required' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/verify-email/${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 400) {
        return { success: false, error: 'Verification token is required' };
      }
      if (response.status === 401) {
        return { success: false, error: 'Invalid or expired verification token' };
      }
      const message = (data as { message?: string } | null)?.message;
      return { success: false, error: message || `Failed to verify email (${response.status})` };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function getGoogleAuthUrl(role?: 'customer' | 'vendor') {
  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL is not configured');
  }

  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/google/auth-url`, {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null) as { data?: { url?: string }; message?: string } | null;

  if (!response.ok) {
    const message = data?.message;
    throw new Error(message || `Failed to fetch Google auth URL (${response.status})`);
  }

  const url = data?.data?.url;
  if (!url) {
    throw new Error('Google auth URL not available');
  }

  return { url };
}

/**
 * Logout - clears auth cookies and redirects to login page
 */
export async function logout(redirectTo: string = '/client/auth/log-in') {
  await clearAuthCookies();
  redirect(redirectTo);
}

/**
 * Try to refresh the access token using the stored refresh token
 */
export async function tryRefreshToken() {
  const refreshTokenValue = await getRefreshToken();

  if (!refreshTokenValue) {
    return { success: false, error: 'No refresh token available' };
  }

  return refreshAccessToken(refreshTokenValue);
}

/**
 * Handle Google OAuth callback - exchange authorization code for tokens
 */
export async function handleGoogleCallback(code: string, role?: 'customer' | 'vendor') {
  try {
    if (!code) {
      return { success: false, error: 'Authorization code is required' };
    }

    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    // Build URL with code and optional role
    const params = new URLSearchParams({ code });
    if (role) {
      params.append('role', role);
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/auth/google/callback?${params}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );

    const data = await response.json().catch(() => null) as {
      message?: string;
      data?: {
        user?: {
          _id: string;
          email: string;
          firstName: string;
          lastName: string;
          authProvider?: string;
          role?: string;
        };
        token?: string;
        refreshToken?: string;
        isNewUser?: boolean;
      };
    } | null;

    if (!response.ok) {
      if (response.status === 400) {
        return { success: false, error: 'Authorization code is missing or invalid' };
      }
      if (response.status === 401) {
        return { success: false, error: 'Failed to authenticate with Google' };
      }
      const message = data?.message;
      return { success: false, error: message || `Google authentication failed (${response.status})` };
    }

    const token = data?.data?.token;
    const refreshToken = data?.data?.refreshToken;
    const user = data?.data?.user;
    const isNewUser = data?.data?.isNewUser ?? false;

    if (!token || !refreshToken || !user) {
      return { success: false, error: 'Invalid response from server' };
    }

    // Store tokens in HTTP-only cookies
    await setAuthCookies(token, refreshToken, true);

    return {
      success: true,
      data: {
        user,
        isNewUser,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
