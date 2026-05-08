import { useUserProfile } from "@/hooks/api/use-user-profile";
import {
  getClientActionRestriction,
  type ClientActionRestriction,
} from "@/lib/client-access";

export function useClientActionGuard() {
  const profileQuery = useUserProfile();
  const restriction = getClientActionRestriction(profileQuery.data);

  const canPerformAction = (
    onBlocked?: (restriction: ClientActionRestriction) => void,
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
    isBanned: Boolean(restriction),
    canPerformAction,
  };
}