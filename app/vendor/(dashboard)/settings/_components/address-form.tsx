"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createAddress, updateAddress } from "@/lib/actions/address";
import { updateUserProfile } from "@/lib/actions/user";
import type { Address } from "@/types/address";
import { queryKeys } from "@/lib/react-query/keys";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().optional(),
  lat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
  long: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address | null;
}

export function AddressForm({ address }: AddressFormProps) {
  const [isEditing, setIsEditing] = useState(!address);
  const queryClient = useQueryClient();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      lat: undefined,
      long: undefined,
    },
  });

  useEffect(() => {
    if (address) {
      form.reset({
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || "",
        lat: address.lat,
        long: address.long,
      });
    }
  }, [address, form]);

  const onSubmit = async (values: AddressFormValues) => {
    try {
      const payload = {
        ...values,
        country: values.country || undefined,
        lat: values.lat || undefined,
        long: values.long || undefined,
      };

      let result;
      if (address) {
        // Update existing address
        result = await updateAddress(address._id, payload);
      } else {
        // Create new address
        result = await createAddress(payload);
      }

      if (result.success) {
        toast.success(
          address
            ? "Address updated successfully"
            : "Address created successfully",
        );
        // Invalidate user profile query to refetch with new addressId
        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.user(),
        });

        // If we created a new address, link it to the user profile
        if (!address && result.data?._id) {
          await updateUserProfile({ addressId: result.data._id });
          // Invalidate again to ensure profile reflects the link
          await queryClient.invalidateQueries({
            queryKey: queryKeys.auth.user(),
          });
        }

        // Invalidate address query
        if (result.data?._id) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.address.detail(result.data._id),
          });
        }
        setIsEditing(false);
      } else {
        // Show detailed error message
        const errorMessage = result.error || "Failed to save address";

        // Try to parse field-specific errors from the message
        if (errorMessage.includes(":")) {
          const [mainError, fieldErrors] = errorMessage.split(":");
          toast.error(
            <div className="space-y-1">
              <p className="font-semibold">{mainError}</p>
              <p className="text-sm">{fieldErrors}</p>
            </div>,
            { duration: 6000 },
          );
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
      }
    } catch (error) {
      console.error("Address submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleCancel = () => {
    if (address) {
      form.reset({
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || "",
        lat: address.lat,
        long: address.long,
      });
      setIsEditing(false);
    }
  };

  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  // Read-only view
  if (!isEditing && address) {
    return (
      <div>
        <div className="grid gap-4 rounded-lg bg-muted/30 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Street</p>
              <p className="text-sm font-medium">{address.street}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">City</p>
              <p className="text-sm font-medium">{address.city}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">State</p>
              <p className="text-sm font-medium">{address.state}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Postal Code</p>
              <p className="text-sm font-medium">{address.postalCode}</p>
            </div>
          </div>
          {address.country && (
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="text-sm font-medium">{address.country}</p>
            </div>
          )}
          {(address.lat || address.long) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {address.lat && (
                <div>
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="text-sm font-medium">{address.lat}</p>
                </div>
              )}
              {address.long && (
                <div>
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="text-sm font-medium">{address.long}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-start p-4 bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Address
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormControl>
                  <FloatingLabelInput
                    label="Street Address"
                    autoComplete="street-address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="City"
                    autoComplete="address-level2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="State/Province"
                    autoComplete="address-level1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="Postal Code"
                    autoComplete="postal-code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="Country (optional)"
                    autoComplete="country"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="Latitude (optional)"
                    type="number"
                    step="any"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="long"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="Longitude (optional)"
                    type="number"
                    step="any"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="px-6"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {address ? "Update Address" : "Create Address"}
          </Button>
          {address && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
