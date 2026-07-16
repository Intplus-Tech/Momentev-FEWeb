/**
 * Vendor onboarding cache utility
 * 
 * Caches the `onBoarded` flag locally for 5 minutes after submission to prevent
 * looping when the backend hasn't updated yet. Uses localStorage with explicit TTL.
 */

const CACHE_KEY = 'vendor-onboarded-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface OnboardedCache {
  onBoarded: boolean;
  expiresAt: number;
  vendorId?: string;
}

/**
 * Get cached onboarded status if valid (not expired)
 * @returns Cache object if valid, null if expired or missing
 */
export function getOnboardedCache(): OnboardedCache | null {
  if (typeof window === 'undefined') {
    // Server-side, can't access localStorage
    return null;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const parsedCache: OnboardedCache = JSON.parse(cached);

    // Check if cache has expired
    if (Date.now() > parsedCache.expiresAt) {
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsedCache;
  } catch (error) {
    console.error('❌ [Vendor Cache] Error reading cache:', error);
    return null;
  }
}

/**
 * Set cached onboarded status with 5-minute TTL
 * @param onBoarded Whether the vendor is onboarded
 */
export function setOnboardedCache(onBoarded: boolean, vendorId?: string): void {
  if (typeof window === 'undefined') {
    // Server-side, can't access localStorage
    return;
  }

  try {
    const cache: OnboardedCache = {
      onBoarded,
      expiresAt: Date.now() + CACHE_TTL,
      ...(vendorId ? { vendorId } : {}),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    // console.log(`✅ [Vendor Cache] Cached onBoarded=${onBoarded} for 5 minutes`);
  } catch (error) {
    console.error('❌ [Vendor Cache] Error writing cache:', error);
  }
}

/**
 * Clear cached onboarded status (e.g., on logout)
 */
export function clearOnboardedCache(): void {
  if (typeof window === 'undefined') {
    // Server-side, can't access localStorage
    return;
  }

  try {
    localStorage.removeItem(CACHE_KEY);
    // console.log('✅ [Vendor Cache] Cache cleared');
  } catch (error) {
    console.error('❌ [Vendor Cache] Error clearing cache:', error);
  }
}

/**
 * Get the effective onboarded status considering cache
 * Uses cache if valid, otherwise uses backend value
 * @param backendOnBoarded The onBoarded value from the backend
 * @returns The effective onBoarded value to use
 */
export function getEffectiveOnboardedStatus(
  backendOnBoarded: boolean,
  vendorId?: string,
): boolean {
  const cache = getOnboardedCache();

  const isVendorMatch = !cache?.vendorId || !vendorId || cache.vendorId === vendorId;

  // If cache says onBoarded=true and is valid, trust the cache over stale backend data
  if (cache?.onBoarded === true && isVendorMatch) {
    // console.log(
    //   '✅ [Vendor Cache] Using cached onBoarded=true (backend:',
    //   backendOnBoarded,
    //   ', vendorId:',
    //   vendorId,
    //   ')',
    // );
    return true;
  }

  // Otherwise use backend value
  return backendOnBoarded;
}
