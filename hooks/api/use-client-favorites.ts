import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyFavorites, checkFavoriteStatus, addFavorite, removeFavorite } from "@/lib/actions/favorites";
import { queryKeys } from "@/lib/react-query/keys";

export function useClientFavorites(page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.favorites.myFavorites(page, limit),
    queryFn: async () => {
      const result = await getMyFavorites(page, limit);
      console.log("useClientFavorites result:", result);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useFavoriteStatus(vendorId: string | undefined) {
  return useQuery({
    queryKey: vendorId ? queryKeys.favorites.status(vendorId) : [],
    queryFn: async () => {
      if (!vendorId) throw new Error("Vendor ID is required");
      const result = await checkFavoriteStatus(vendorId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data?.isFavorited ?? false;
    },
    enabled: !!vendorId,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const result = await addFavorite(vendorId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.setQueryData(queryKeys.favorites.status(vendorId), true);
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const result = await removeFavorite(vendorId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.setQueryData(queryKeys.favorites.status(vendorId), false);
    },
  });
}
