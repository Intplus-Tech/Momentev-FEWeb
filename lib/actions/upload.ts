'use server';

import { getAccessToken } from '@/lib/session';

export type UploadedFile = {
  _id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  provider: string;
};

export async function uploadFile(formData: FormData) {
  try {
    if (!process.env.BACKEND_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    console.log(data);

    if (!response.ok) {
      if (response.status === 413) {
        return { success: false, error: 'File too large (max 10MB)' };
      }
      const message = (data as { message?: string } | null)?.message;
      return { success: false, error: message || `Failed to upload file (${response.status})` };
    }

    return { success: true, data: data?.data as UploadedFile };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during upload';
    return { success: false, error: message };
  }
}
