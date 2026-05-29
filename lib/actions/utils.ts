"use server";

import { getUserProfile } from "@/lib/actions/user";
import { getClientActionRestriction } from "@/lib/client-access";
import { ClientActionBlockedError } from "./errors";
import type { UserProfile } from "@/types/auth";

/**
 * Ensure the current user is allowed to perform client actions.
 * Throws `ClientActionBlockedError` when the user is restricted.
 * If a `profile` is provided, it will be used instead of fetching.
 */
export async function ensureClientAllowedToAct(profile?: Pick<UserProfile, "status"> | null) {
  let resolvedProfile = profile;

  if (!resolvedProfile) {
    const result = await getUserProfile();
    if (!result.success || !result.data) {
      // Treat inability to fetch profile as authentication failure upstream
      return;
    }
    resolvedProfile = result.data;
  }

  const restriction = getClientActionRestriction(resolvedProfile as Pick<UserProfile, "status">);
  if (restriction) {
    throw new ClientActionBlockedError(restriction);
  }
}
