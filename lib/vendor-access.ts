import type { UserProfile } from "@/types/auth";

export const VENDOR_SUSPENDED_STATUS = "banned";
export const VENDOR_SUPPORT_EMAIL = "support@momentev.com";
export const VENDOR_SUPPORT_HREF = `mailto:${VENDOR_SUPPORT_EMAIL}`;
export const VENDOR_SUSPENDED_TITLE = "Vendor account suspended";
export const VENDOR_SUSPENDED_DESCRIPTION =
  "Your vendor account is currently suspended, so dashboard actions are disabled. You can still review your dashboard, but you cannot create quotes, manage bookings, or change payout settings until the restriction is lifted.";
export const VENDOR_SUSPENDED_HELP_TEXT =
  "If you believe this is a mistake, contact support and include the email on your vendor account.";

export type VendorActionRestriction = {
  kind: "suspended";
  title: string;
  description: string;
  helpText: string;
  supportHref: string;
};

const suspendedRestriction: VendorActionRestriction = {
  kind: "suspended",
  title: VENDOR_SUSPENDED_TITLE,
  description: VENDOR_SUSPENDED_DESCRIPTION,
  helpText: VENDOR_SUSPENDED_HELP_TEXT,
  supportHref: VENDOR_SUPPORT_HREF,
};

function isSuspendedVendorStatus(status?: string | null) {
  const normalized = status?.trim().toLowerCase();
  return normalized === "banned" || normalized === "suspended" || normalized === "inactive";
}

export function getVendorActionRestriction(user?: Pick<UserProfile, "status" | "vendor"> | null) {
  if (!user) {
    return null;
  }

  const vendor = user.vendor as
    | {
      isActive?: boolean;
      status?: string;
    }
    | undefined;

  const isRestricted =
    isSuspendedVendorStatus(user.status) ||
    isSuspendedVendorStatus(vendor?.status);

  return isRestricted ? suspendedRestriction : null;
}