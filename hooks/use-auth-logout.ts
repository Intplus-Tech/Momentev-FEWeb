"use client";

import { useQueryClient } from "@tanstack/react-query";

import { logout } from "@/lib/actions/auth";
import { queryKeys } from "@/lib/react-query/keys";

export function useAuthLogout() {
  const queryClient = useQueryClient();

  return async function authLogout(redirectTo: string = "/client/auth/log-in") {
    queryClient.setQueryData(queryKeys.auth.user(), null);
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    await logout(redirectTo);
  };
}