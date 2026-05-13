'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getStaffSession } from '@/lib/actions/staff';
import type { UserRole, StaffPermission } from '@/types/auth';
import type { PermissionModule, PermissionAction } from '@/types/permissions';

// ─── Context Shape ─────────────────────────────────────────────────────────

interface PermissionsContextValue {
  /** The role decoded from the JWT. null while loading. */
  role: UserRole | null;
  /**
   * The full permissions array for VENDORSTAFF.
   * Empty array for all other roles (owner bypass handles those in the hook).
   */
  permissions: StaffPermission[];
  /** The vendor this staff member belongs to. undefined for non-staff roles. */
  vendorId: string | undefined;
  /** True while the initial JWT decode is in progress. */
  isLoading: boolean;
}

const defaultValue: PermissionsContextValue = {
  role: null,
  permissions: [],
  vendorId: undefined,
  isLoading: true,
};

export const PermissionsContext =
  createContext<PermissionsContextValue>(defaultValue);

// ─── Provider ─────────────────────────────────────────────────────────────

interface PermissionsProviderProps {
  children: ReactNode;
}

/**
 * PermissionsProvider
 *
 * Mount this once inside the vendor (dashboard)/layout.tsx, inside
 * VendorOnboardingGuard so it only runs for authenticated vendor-zone users.
 *
 * On mount it calls getStaffSession() — a Server Action that decodes the
 * HTTP-only auth cookie with jose. No extra network requests.
 */
export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [state, setState] = useState<PermissionsContextValue>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await getStaffSession();

        if (cancelled) return;

        if (!session) {
          setState({ role: null, permissions: [], vendorId: undefined, isLoading: false });
          return;
        }

        setState({
          role: session.role,
          permissions: session.permissions,
          vendorId: session.vendorId,
          isLoading: false,
        });
      } catch {
        if (!cancelled) {
          setState({ role: null, permissions: [], vendorId: undefined, isLoading: false });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PermissionsContext.Provider value={state}>
      {children}
    </PermissionsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * usePermissions
 *
 * Returns true if the current user may perform `action` on `module`.
 *
 * Vendor owners (role === 'VENDOR') and Admins always get true.
 * VendorStaff are checked against their JWT-embedded permissions array.
 * Returns false while loading to prevent flicker of restricted content.
 *
 * @example
 * const canReadChat = usePermissions('chat', 'read');
 * const canWriteFinance = usePermissions('finance', 'write');
 */
export function usePermissions(
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const { role, permissions, isLoading } = useContext(PermissionsContext);

  // Deny by default while the session hasn't resolved yet
  if (isLoading) return false;

  // Vendor owners and admins bypass all granular permission checks
  if (role === 'VENDOR' || role === 'ADMIN') return true;

  // VendorStaff — look up their specific permission entry
  if (role === 'VENDORSTAFF') {
    const perm = permissions.find(
      (p) => p.name.toLowerCase() === module.toLowerCase()
    );
    if (!perm) return false;
    return action === 'read' ? perm.read : perm.write;
  }

  // All other roles (CUSTOMER, AUDITOR, null) — no access
  return false;
}

/**
 * usePermissionsContext
 *
 * Low-level hook to access the full permissions context value.
 * Prefer usePermissions() for boolean checks in most cases.
 * Use this when you need role, vendorId, or isLoading directly.
 *
 * @example
 * const { role, isLoading, vendorId } = usePermissionsContext();
 */
export function usePermissionsContext(): PermissionsContextValue {
  return useContext(PermissionsContext);
}
