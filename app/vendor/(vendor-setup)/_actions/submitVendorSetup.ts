'use server';

/**
 * Dummy API action functions for vendor setup submission
 * These will be replaced with real API calls when backend is ready
 * Each step submits to a separate endpoint
 */

export async function submitBusinessInfo(data: any, documentIds: any) {
  // TODO: POST /api/vendor/setup/business
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('✅ Step 1: Business info submitted:', { data, documentIds });
  return { success: true };
}

export async function submitServiceSetup(categories: any, pricing: any) {
  // TODO: POST /api/vendor/setup/services
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('✅ Step 2: Service setup submitted:', { categories, pricing });
  return { success: true };
}

export async function submitPaymentConfig(data: any) {
  // TODO: POST /api/vendor/setup/payment
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('✅ Step 3: Payment config submitted:', data);
  return { success: true };
}

export async function submitProfile(data: any, mediaIds: any) {
  // TODO: POST /api/vendor/setup/profile
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('✅ Step 4: Profile submitted:', { data, mediaIds });
  return { success: true };
}
