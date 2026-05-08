import type { UserProfile } from "@/types/auth";

export const CLIENT_BANNED_STATUS = "banned";
export const CLIENT_SUPPORT_EMAIL = "support@momentev.com";
export const CLIENT_SUPPORT_HREF = `mailto:${CLIENT_SUPPORT_EMAIL}`;
export const CLIENT_BAN_TITLE = "Account banned";
export const CLIENT_BAN_DESCRIPTION =
  "Your account is currently banned, so dashboard actions are disabled. You can still review your dashboard, but you cannot create custom requests or book vendors until the restriction is lifted.";
export const CLIENT_BAN_HELP_TEXT =
  "If you believe this is a mistake, contact support and include the email on your account.";

export type ClientActionRestriction = {
  kind: "banned";
  title: string;
  description: string;
  helpText: string;
  supportHref: string;
};

const bannedRestriction: ClientActionRestriction = {
  kind: "banned",
  title: CLIENT_BAN_TITLE,
  description: CLIENT_BAN_DESCRIPTION,
  helpText: CLIENT_BAN_HELP_TEXT,
  supportHref: CLIENT_SUPPORT_HREF,
};

export function isBannedClientStatus(status?: string | null) {
  return status?.trim().toLowerCase() === CLIENT_BANNED_STATUS;
}

export function getClientActionRestriction(
  user?: Pick<UserProfile, "status"> | null,
) {
  if (!user || !isBannedClientStatus(user.status)) {
    return null;
  }

  return bannedRestriction;
}