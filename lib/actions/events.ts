'use server';

export async function getEvents() {
  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL is not configured');
  }

  const response = await fetch(`${process.env.BACKEND_URL}/events`);

  if (!response.ok) {
    throw new Error(`Failed to fetch events (${response.status})`);
  }

  return response.json();
}
