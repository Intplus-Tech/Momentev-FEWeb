import { useUserProfile } from "@/hooks/api/use-user-profile";
import {
  getVendorActionRestriction,
  type VendorActionRestriction,
} from "@/lib/vendor-access";

export function useVendorActionGuard() {
  const profileQuery = useUserProfile();
  const restriction = getVendorActionRestriction(profileQuery.data);

  const canPerformAction = (
    onBlocked?: (restriction: VendorActionRestriction) => void,
  ) => {
    if (restriction) {
      onBlocked?.(restriction);
      return false;
    }

    return true;
  };

  return {
    ...profileQuery,
    restriction,
    isSuspended: Boolean(restriction),
    canPerformAction,
  };
}