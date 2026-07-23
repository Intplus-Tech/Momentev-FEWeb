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

import { SectionShell } from "./section-shell";

const contactInfoSchema = z.object({
  primaryContactName: z.string().min(2, "Primary contact name is required"),
  emailAddress: z.email("Enter a valid contact email"),
  phoneNumber: z.string().min(7, "Contact phone number is required"),
  meansOfIdentification: z.string().optional(),
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

interface ContactInfoSectionProps {
  businessProfile: any;
  isLoading?: boolean;
}

export function ContactInfoSection({ businessProfile, isLoading }: ContactInfoSectionProps) {
  const queryClient = useQueryClient();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const businessProfileId = businessProfile?._id;
  const contactInfo = businessProfile?.contactInfo;

  // Derived, memoized snapshot of the server data mapped to form shape.
  // Only recomputes when the underlying businessProfile object actually
  // changes, so it never spuriously marks the form dirty on unrelated
  // re-renders (e.g. background query refetches with equal data).
  const values = useMemo<ContactInfoFormValues | undefined>(() => {
    if (!businessProfile) return undefined;
    return {
      primaryContactName: contactInfo?.primaryContactName || "",
      emailAddress: contactInfo?.emailAddress || "",
      phoneNumber: contactInfo?.phoneNumber || "",
      meansOfIdentification: contactInfo?.meansOfIdentification || "",
    };
  }, [businessProfile, contactInfo]);

  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      primaryContactName: "",
      emailAddress: "",
      phoneNumber: "",
      meansOfIdentification: "",
    },
    values,
    // Preserve any in-progress, unsaved edits if a background refetch
    // resolves while the user is typing.
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values: ContactInfoFormValues) => {
    if (!businessProfileId) {
      toast.error("Business profile is unavailable");
      return;
    }

    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    const result = await updateBusinessProfile(businessProfileId, {
      contactInfo: {
        ...(contactInfo || {}),
        ...values,
      },
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("[Vendor Profile][Contact Information] updateBusinessProfile response:", result);
    }

    if (!result.success) {
      toast.error(result.error || "Failed to update contact information");
      return;
    }

    toast.success("Contact information updated successfully");
    // Mark the form clean immediately with what was just saved, then
    // reconcile with the server in the background.
    form.reset(values);
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  };

  if (isLoading) {
    return (
      <SectionShell title="Contact Information">
        <div className="flex items-center justify-center p-8 min-h-[30vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Contact Information">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 sm:p-6">
          <fieldset disabled={Boolean(restriction) || !businessProfileId} className="contents">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label="Primary Contact Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label="Contact Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label="Contact Phone Number" inputMode="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meansOfIdentification"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label="Means of Identification" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <PermissionActionGate module="business_profile" action="write">
              <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Contact Information
              </Button>
            </PermissionActionGate>
          </fieldset>
        </form>
      </Form>
      <VendorActionBlockedDialog
        open={showBlockedDialog}
        onOpenChange={setShowBlockedDialog}
        restriction={restriction}
      />
    </SectionShell>
  );
}
