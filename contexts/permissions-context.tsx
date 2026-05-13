'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { UserRole, StaffPermission } from '@/types/auth';
import type { PermissionModule, PermissionAction } from '@/types/permissions';

// ─── Context Shape ─────────────────────────────────────────────────────────

interface PermissionsContextValue {
  /** The role decoded from the JWT. */
  role: UserRole | null;
  /**
   * The full permissions array for VENDORSTAFF.
   * Empty array for all other roles.
   */
  permissions: StaffPermission[];
  /** The vendor this staff member belongs to. */
  vendorId: string | undefined;
}

const defaultValue: PermissionsContextValue = {
  role: null,
  permissions: [],
  vendorId: undefined,
};

export const PermissionsContext = createContext<PermissionsContextValue>(defaultValue);

// ─── Provider ─────────────────────────────────────────────────────────────

interface PermissionsProviderProps extends PermissionsContextValue {
  children: ReactNode;
}

/**
 * PermissionsProvider
 *
 * Mount this once inside the vendor (dashboard)/layout.tsx, inside
 * VendorOnboardingGuard so it only runs for authenticated vendor-zone users.
 *
 * It accepts the server-decoded role, permissions, and vendorId directly
 * to avoid unnecessary network round-trips.
 */
export function PermissionsProvider({
  role,
  permissions,
  vendorId,
  children,
}: PermissionsProviderProps) {
  return (
    <PermissionsContext.Provider value={{ role, permissions, vendorId }}>
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
 * Vendor owners (role === 'VENDOR') always get true.
 * VendorStaff are checked against their JWT-embedded permissions array.
 *
 * @example
 * const canReadChat = usePermissions('chat', 'read');
 * const canWriteFinance = usePermissions('finance', 'write');
 */
export function usePermissions(
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const { role, permissions } = useContext(PermissionsContext);

  // Vendor owners bypass all granular permission checks
  if (role === 'VENDOR') return true;

  // VendorStaff — look up their specific permission entry
  if (role === 'VENDORSTAFF') {
    const perm = permissions.find(
      (p) => p.name.toLowerCase() === module.toLowerCase()
    );
    if (!perm) return false;
    return action === 'read' ? perm.read : perm.write;
  }

  // All other roles — no access
  return false;
}

/**
 * usePermissionsContext
 *
 * Low-level hook to access the full permissions context value.
 * Prefer usePermissions() for boolean checks in most cases.
 * Use this when you need role or vendorId directly.
 *
 * @example
 * const { role, vendorId } = usePermissionsContext();
 */
export function usePermissionsContext(): PermissionsContextValue {
  return useContext(PermissionsContext);
}
