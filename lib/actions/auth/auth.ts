'use server';

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
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Too many login attempts. Please wait a moment and try again.' };
      }
      const message = (data as { message?: string } | null)?.message;
      return { success: false, error: message || `Failed to login (${response.status})` };
    }

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

export async function getGoogleAuthUrl() {
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