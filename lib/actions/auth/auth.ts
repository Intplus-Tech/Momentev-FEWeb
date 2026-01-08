'use server';

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
};

export async function register(input: RegisterInput) {
  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL is not configured');
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
    const message = (data as { message?: string } | null)?.message;
    throw new Error(message || `Failed to register (${response.status})`);
  }

  return data;
}


export type LoginInput = {
  email: string;
  password: string;
};

export async function login(input: LoginInput) {
  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL is not configured');
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

  console.log('Login  response data:', data);

  if (!response.ok) {
    const message = (data as { message?: string } | null)?.message;
    throw new Error(message || `Failed to login (${response.status})`);
  }

  return data;
}

export type ResendVerificationInput = {
  email: string;
};

export async function resendVerificationEmail(input: ResendVerificationInput) {
  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL is not configured');
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
    const message = (data as { message?: string } | null)?.message;
    throw new Error(message || `Failed to resend verification email (${response.status})`);
  }

  return data;
}