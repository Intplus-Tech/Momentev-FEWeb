'use server';

import { decodeJwt } from 'jose';
import { getAccessToken } from '@/lib/session';
import type { UserRole, StaffPermission, VendorStaffJWTData } from '@/types/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffSessionData {
  role: UserRole;
  /** undefined when role is not 'VENDORSTAFF' */
  vendorStaff?: VendorStaffJWTData;
  /** Convenience shortcut — populated for VENDORSTAFF, empty array otherwise */
  permissions: StaffPermission[];
  /** Convenience shortcut — populated for VENDORSTAFF, undefined otherwise */
  vendorId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decode the HTTP-only auth cookie using jose and extract session data.
 *
 * This does NOT verify the JWT signature — that is the backend's responsibility
 * on every authenticated API call. We only decode to read the claims that
 * drive client-side UI decisions (role, permissions).
 *
 * Returns null if there is no access token or if decoding fails.
 */
async function decodeSessionFromCookie(): Promise<StaffSessionData | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  try {
    // jose's decodeJwt is a lightweight decode-only helper (no crypto verify)
    const payload = decodeJwt(token) as {
      role?: string;
      vendorStaff?: {
        vendorId?: string;
        permissions?: Array<{ name: string; read: boolean; write: boolean }>;
      };
    };

    const rawRole = payload.role?.toUpperCase() as UserRole | undefined;

    if (!rawRole) {
      return null;
    }

    if (rawRole === 'VENDORSTAFF' && payload.vendorStaff) {
      const vendorStaffData: VendorStaffJWTData = {
        vendorId: payload.vendorStaff.vendorId ?? '',
        permissions: payload.vendorStaff.permissions ?? [],
      };

      return {
        role: rawRole,
        vendorStaff: vendorStaffData,
        permissions: vendorStaffData.permissions,
        vendorId: vendorStaffData.vendorId,
      };
    }

    // For all other roles (VENDOR, ADMIN, CUSTOMER, AUDITOR):
    // permissions are conceptually "all allowed" — the empty array + role check
    // in usePermissions() handles the bypass logic.
    return {
      role: rawRole,
      permissions: [],
    };
  } catch {
    // Malformed token — treat as unauthenticated
    return null;
  }
}

// ─── Public Server Actions ─────────────────────────────────────────────────

/**
 * Reads and decodes the current user's session from the HTTP-only auth cookie.
 *
 * Used by PermissionsProvider on mount to hydrate global permission state
 * without any extra API round-trips.
 */
export async function getStaffSession(): Promise<StaffSessionData | null> {
  return decodeSessionFromCookie();
}

/**
 * Server-side access check for Server Components / page.tsx files.
 *
 * Decodes the JWT and checks whether the current user may perform `action`
 * on `module`. Vendor owners and admins always pass.
 *
 * Usage inside a page (Server Component):
 * ```tsx
 * const { allowed } = await checkPageAccess('finance', 'read');
 * if (!allowed) return <NotAuthorized module="finance" />;
 * ```
 */
export async function checkPageAccess(
  module: string,
  action: 'read' | 'write'
): Promise<{ allowed: boolean; role: UserRole | null }> {
  const session = await decodeSessionFromCookie();

  if (!session) {
    return { allowed: false, role: null };
  }

  const { role, permissions } = session;

  // Owners and admins bypass all granular checks
  if (role === 'VENDOR' || role === 'ADMIN') {
    return { allowed: true, role };
  }

  if (role === 'VENDORSTAFF') {
    const perm = permissions.find(
      (p) => p.name.toLowerCase() === module.toLowerCase()
    );

    if (!perm) {
      return { allowed: false, role };
    }

    const allowed = action === 'read' ? perm.read : perm.write;
    return { allowed, role };
  }

  // CUSTOMER, AUDITOR, or unknown role — no access to vendor pages
  return { allowed: false, role };
}
