import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVendorStaff,
  getVendorPermissions,
  addVendorStaff,
  updateVendorStaff,
  deleteVendorStaff,
  type VendorPermissionInput,
} from "@/lib/actions/user";
import { queryKeys } from "@/lib/react-query/keys";

export type StaffMember = {
  _id: string;
  vendorId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  permissions: {
    name: string;
    read: boolean;
    write: boolean;
  }[];
  isActive: boolean;
};

// --- Queries ---

export function useVendorStaff() {
  return useQuery<StaffMember[]>({
    queryKey: queryKeys.vendor.staff(),
    queryFn: async () => {
      const result = await getVendorStaff();
      if (!result.success) throw new Error(result.error || "Failed to fetch staff");
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorPermissions() {
  return useQuery<string[]>({
    queryKey: queryKeys.vendor.permissions(),
    queryFn: async () => {
      const result = await getVendorPermissions();
      if (!result.success) throw new Error(result.error || "Failed to fetch permissions");
      return result.data || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // Permissions rarely change, cache for 24h
  });
}

// --- Mutations ---

export function useAddVendorStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      permissions: VendorPermissionInput[];
      isActive: boolean;
    }) => {
      const result = await addVendorStaff(data);
      if (!result.success) throw new Error(result.error || "Failed to add staff member");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.staff() });
    },
  });
}

export function useUpdateVendorStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { permissions?: VendorPermissionInput[]; isActive?: boolean };
    }) => {
      const result = await updateVendorStaff(id, data);
      if (!result.success) throw new Error(result.error || "Failed to update staff member");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.staff() });
    },
  });
}

export function useDeleteVendorStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteVendorStaff(id);
      if (!result.success) throw new Error(result.error || "Failed to delete staff member");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.staff() });
    },
  });
}
