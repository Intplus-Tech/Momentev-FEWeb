"use server";

import { getAccessToken, tryRefreshToken } from "@/lib/session";

type AuthFetchResult = {
  response: Response | null;
  error?: string;
  token?: string;
  refreshed?: boolean;
};

export async function fetchWithAuthRetry(
  request: (token: string) => Promise<Response>,
  options?: { token?: string }
): Promise<AuthFetchResult> {
  const accessToken = options?.token ?? await getAccessToken();

  if (!accessToken) {
    return { response: null, error: "Authentication required" };
  }

  const initialResponse = await request(accessToken);

  if (initialResponse.status !== 401) {
    return { response: initialResponse, token: accessToken };
  }

  const refreshResult = await tryRefreshToken();

  if (!refreshResult.success || !refreshResult.token) {
    return { response: null, error: "Session expired" };
  }

  const retryResponse = await request(refreshResult.token);

  return {
    response: retryResponse,
    token: refreshResult.token,
    refreshed: true,
  };
}
