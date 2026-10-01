"use server";

import { fetchWithAuthRetry } from "@/lib/actions/auth-retry";

const API_URL = process.env.BACKEND_URL;

export interface CommissionRate {
  _id: string;
  type: string;
  amount: number;
  currency: string;
}

type CommissionListResponse = {
  data?: {
    data?: CommissionRate[];
  };
};

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function fetchCommissions(): Promise<ActionResponse<CommissionRate[]>> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const { response, error, errorCode } = await fetchWithAuthRetry((token) =>
      fetch(`${API_URL}/api/v1/commissions?page=1&limit=100`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }),
    );

    if (!response) {
      return { success: false, error: error || "Authentication required" };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error:
          errorCode === "FORBIDDEN"
            ? "You do not have permission to view commissions."
            : errorData?.message || `Failed to fetch commissions (${response.status})`,
      };
    }

    const result: CommissionListResponse = await response.json();
    return { success: true, data: result.data?.data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch commissions",
    };
  }
}