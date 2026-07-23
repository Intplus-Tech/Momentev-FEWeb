"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { updateBusinessProfile } from "@/lib/actions/vendor-setup";
import { queryKeys } from "@/lib/react-query/keys";
import { PermissionActionGate } from "@/components/auth/permission-gate";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import { VendorActionBlockedDialog } from "@/components/shared/vendor-action-blocked-dialog";

import { AddressForm } from "./address-form";
import { SectionShell } from "./section-shell";

const businessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  yearInBusiness: z.string().min(1, "Years in business is required"),
  companyRegNo: z.string().min(1, "Company registration number is required"),
  businessDescription: z.string().optional(),
});

type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

interface BusinessInfoSectionProps {
  businessProfile: any;
}

export function BusinessInfoSection({ businessProfile }: BusinessInfoSectionProps) {
  const queryClient = useQueryClient();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const businessProfileId = businessProfile?._id;
  const address = businessProfile?.contactInfo?.addressId;

  const form = useForm<BusinessInfoFormValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: "",
      yearInBusiness: "",
      companyRegNo: "",
      businessDescription: "",
    },
  });

  useEffect(() => {
    form.reset({
      businessName: businessProfile?.businessName || "",
      yearInBusiness: businessProfile?.yearInBusiness || "",
      companyRegNo: businessProfile?.companyRegNo || "",
      businessDescription: businessProfile?.businessDescription || "",
    });
  }, [businessProfile, form]);

  const refreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  };

  const onSubmit = async (values: BusinessInfoFormValues) => {
    if (!businessProfileId) {
      toast.error("Business profile is unavailable");
      return;
    }

    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    const result = await updateBusinessProfile(businessProfileId, values);
    if (!result.success) {
      toast.error(result.error || "Failed to update business information");
      return;
    }

    toast.success("Business information updated successfully");
    await refreshProfile();
  };

  const linkAddress = async (addressId: string) => {
    if (!businessProfileId) {
      return { success: false, error: "Business profile is unavailable" };
    }

    const result = await updateBusinessProfile(businessProfileId, {
      contactInfo: {
        ...(businessProfile?.contactInfo || {}),
        addressId,
      },
    });

    if (result.success) {
      await refreshProfile();
    }

    return result;
  };

  return (
    <SectionShell title="Business Information">
      <div className="space-y-6 p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <fieldset disabled={Boolean(restriction) || !businessProfileId} className="contents">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="Business Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearInBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="Years in Business" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyRegNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="Company Registration Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormControl>
                        <Textarea placeholder="Business Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <PermissionActionGate module="business_profile" action="write">
                <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Business Information
                </Button>
              </PermissionActionGate>
            </fieldset>
          </form>
        </Form>

        <div className="border-t pt-6">
          <h3 className="mb-4 text-sm font-medium">Business Address</h3>
          <AddressForm address={address} onAddressCreated={linkAddress} />
        </div>
      </div>
      <VendorActionBlockedDialog
        open={showBlockedDialog}
        onOpenChange={setShowBlockedDialog}
        restriction={restriction}
      />
    </SectionShell>
  );
}
