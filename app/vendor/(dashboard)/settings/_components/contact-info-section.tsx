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
}

export function ContactInfoSection({ businessProfile }: ContactInfoSectionProps) {
  const queryClient = useQueryClient();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const businessProfileId = businessProfile?._id;
  const contactInfo = businessProfile?.contactInfo || {};

  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      primaryContactName: "",
      emailAddress: "",
      phoneNumber: "",
      meansOfIdentification: "",
    },
  });

  useEffect(() => {
    form.reset({
      primaryContactName: contactInfo.primaryContactName || "",
      emailAddress: contactInfo.emailAddress || "",
      phoneNumber: contactInfo.phoneNumber || "",
      meansOfIdentification: contactInfo.meansOfIdentification || "",
    });
  }, [businessProfile, form, contactInfo]);

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
        ...contactInfo,
        ...values,
      },
    });

    if (!result.success) {
      toast.error(result.error || "Failed to update contact information");
      return;
    }

    toast.success("Contact information updated successfully");
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  };

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
