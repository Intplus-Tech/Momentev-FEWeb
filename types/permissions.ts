/**
 * Canonical permission module names as returned by the backend in the JWT
 * vendorStaff.permissions[].name field.
 *
 * These are the exact string literals used by the API — do NOT rename them
 * without a corresponding backend change.
 */
export type PermissionModule =
  | 'chat'
  | 'manage_services'
  | 'view_orders'
  | 'manage_staff'
  | 'view_reports'
  | 'finance'
  | 'business_profile';

export type PermissionAction = 'read' | 'write';
