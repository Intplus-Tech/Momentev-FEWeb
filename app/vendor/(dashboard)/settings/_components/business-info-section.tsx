"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const yearsInBusinessOptions = [
  { value: "less_than_1_year", label: "Less than 1 year" },
  { value: "1_to_5_years", label: "1-5 years" },
  { value: "6_to_12_years", label: "6-12 years" },
  { value: "13_to_20_years", label: "13-20 years" },
  { value: "more_than_20_years", label: "More than 20 years" },
];

function normalizeYearInBusiness(value?: string | null): string {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();

  const aliases: Record<string, string> = {
    less_than_1_year: "less_than_1_year",
    "less than 1 year": "less_than_1_year",
    "<1 year": "less_than_1_year",
    "1_to_5_years": "1_to_5_years",
    "1 to 5 years": "1_to_5_years",
    "1-5 years": "1_to_5_years",
    "6_to_12_years": "6_to_12_years",
    "6 to 12 years": "6_to_12_years",
    "6-12 years": "6_to_12_years",
    "13_to_20_years": "13_to_20_years",
    "13 to 20 years": "13_to_20_years",
    "13-20 years": "13_to_20_years",
    "more_than_20_years": "more_than_20_years",
    "more than 20 years": "more_than_20_years",
    ">20 years": "more_than_20_years",
  };

  if (aliases[normalized]) {
    return aliases[normalized];
  }

  const exactOption = yearsInBusinessOptions.find((option) => option.value === normalized);
  if (exactOption) {
    return exactOption.value;
  }

  const optionFromLabel = yearsInBusinessOptions.find(
    (option) => option.label.toLowerCase() === normalized,
  );
  return optionFromLabel?.value || value.trim();
}

function formatYearInBusiness(value: string): string {
  const documentedRanges: Record<string, string> = {
    "1_3_years": "1-3 years",
    "4_6_years": "4-6 years",
    "7_10_years": "7-10 years",
    "11_15_years": "11-15 years",
    "16_20_years": "16-20 years",
  };

  return (
    documentedRanges[value.toLowerCase()] ||
    value
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

interface BusinessInfoSectionProps {
  businessProfile: any;
  isLoading?: boolean;
}

export function BusinessInfoSection({ businessProfile, isLoading }: BusinessInfoSectionProps) {
  const queryClient = useQueryClient();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const businessProfileId = businessProfile?._id;
  const address = businessProfile?.contactInfo?.addressId;

  // Derived, memoized snapshot of the server data mapped to form shape.
  // Only recomputes when the underlying businessProfile object actually
  // changes, so it never spuriously marks the form dirty on unrelated
  // re-renders (e.g. background query refetches with equal data).
  const values = useMemo<BusinessInfoFormValues | undefined>(() => {
    if (!businessProfile) return undefined;
    const profileData = businessProfile as {
      yearsInBusiness?: string | null;
      year_in_business?: string | null;
    };
    return {
      businessName: businessProfile.businessName || "",
      yearInBusiness: normalizeYearInBusiness(
        businessProfile.yearInBusiness ??
        profileData.yearsInBusiness ??
        profileData.year_in_business,
      ),
      companyRegNo: businessProfile.companyRegNo || "",
      businessDescription: businessProfile.businessDescription || "",
    };
  }, [businessProfile]);

  const emptyDefaults: BusinessInfoFormValues = {
    businessName: "",
    yearInBusiness: "",
    companyRegNo: "",
    businessDescription: "",
  };

  const form = useForm<BusinessInfoFormValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: values ?? emptyDefaults,
    values,
    // Preserve any in-progress, unsaved edits if a background refetch
    // resolves while the user is typing.
    resetOptions: { keepDirtyValues: true },
  });

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
    if (process.env.NODE_ENV !== "production") {
      console.log("[Vendor Profile][Business Information] updateBusinessProfile response:", result);
    }
    if (!result.success) {
      toast.error(result.error || "Failed to update business information");
      return;
    }

    toast.success("Business information updated successfully");
    // Mark the form clean immediately with what was just saved, then
    // reconcile with the server in the background.
    form.reset(values);
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
    if (process.env.NODE_ENV !== "production") {
      console.log("[Vendor Profile][Business Address] updateBusinessProfile response:", result);
    }

    if (result.success) {
      await refreshProfile();
    }

    return result;
  };

  if (isLoading) {
    return (
      <SectionShell title="Business Information">
        <div className="flex items-center justify-center p-8 min-h-[30vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionShell>
    );
  }

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
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Years in Business" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearsInBusinessOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                            {field.value &&
                              !yearsInBusinessOptions.some(
                                (option) => option.value === field.value,
                              ) && (
                                <SelectItem value={field.value}>
                                  {formatYearInBusiness(field.value)}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
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
