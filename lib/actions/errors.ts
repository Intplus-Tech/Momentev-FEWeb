import type { ClientActionRestriction } from "@/lib/client-access";

export class ClientActionBlockedError extends Error {
  restriction: ClientActionRestriction;

  constructor(restriction: ClientActionRestriction) {
    super(restriction?.title || "Action blocked");
    this.name = "ClientActionBlockedError";
    this.restriction = restriction;
  }
}
