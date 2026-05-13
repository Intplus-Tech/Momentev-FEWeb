import "server-only";

import { getAccessToken, tryRefreshToken } from "@/lib/session";

export type AuthFetchErrorCode = "FORBIDDEN" | "SESSION_EXPIRED";

export type AuthFetchResult = {
  response: Response | null;
  error?: string;
  /**
   * Typed error discriminant for callers to pattern-match on without
   * inspecting raw Response objects.
   *
   * - 'FORBIDDEN'      → HTTP 403: user is authenticated but lacks permission
   * - 'SESSION_EXPIRED'→ HTTP 401 and token refresh also failed
   */
  errorCode?: AuthFetchErrorCode;
  token?: string;
  refreshed?: boolean;
};

export async function fetchWithAuthRetry(
  request: (token: string) => Promise<Response>,
  options?: { token?: string }
): Promise<AuthFetchResult> {
  const accessToken = options?.token ?? (await getAccessToken());

  if (!accessToken) {
    return { response: null, error: "Authentication required" };
  }

  const initialResponse = await request(accessToken);

  // 403 Forbidden — user is authenticated but lacks the required permission.
  // We trigger a silent token refresh here so that if an admin recently 
  // revoked their permissions, the frontend JWT cookie immediately syncs up 
  // with the backend state for the next page load.
  if (initialResponse.status === 403) {
    await tryRefreshToken(); // Silently update the cookie with fresh permissions
    return {
      response: initialResponse,
      error: "You do not have permission to perform this action.",
      errorCode: "FORBIDDEN",
      token: accessToken,
    };
  }

  // Any status other than 401 is returned as-is (success or other errors).
  if (initialResponse.status !== 401) {
    return { response: initialResponse, token: accessToken };
  }

  // 401 — attempt token refresh
  const refreshResult = await tryRefreshToken();

  if (!refreshResult.success || !refreshResult.token) {
    return {
      response: null,
      error: "Session expired",
      errorCode: "SESSION_EXPIRED",
    };
  }

  const retryResponse = await request(refreshResult.token);

  return {
    response: retryResponse,
    token: refreshResult.token,
    refreshed: true,
  };
}
