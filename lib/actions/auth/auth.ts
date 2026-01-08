'use server';

export type RegisterClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
};

export async function registerClient(input: RegisterClientInput) {
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


export type LoginClientInput = {
  email: string;
  password: string;
};

export async function loginClient(input: LoginClientInput) {
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

  console.log('Login client response data:', data);

  if (!response.ok) {
    const message = (data as { message?: string } | null)?.message;
    throw new Error(message || `Failed to login (${response.status})`);
  }

  return data;
}