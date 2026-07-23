"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, Loader2 } from "lucide-react";

import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";
import { uploadFile } from "@/lib/actions/upload";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { cn } from "@/lib/utils";
import { PermissionActionGate } from "@/components/auth/permission-gate";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import { VendorActionBlockedDialog } from "@/components/shared/vendor-action-blocked-dialog";

import { SectionShell } from "./section-shell";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Phone is required"),
  gender: z.string().optional(),
  dob: z.date({ message: "Date of birth is required" }),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function normalizeGender(value?: string | null): string {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();
  if (normalized === "male" || normalized === "m") return "male";
  if (normalized === "female" || normalized === "f") return "female";
  if (
    normalized === "other" ||
    normalized === "non-binary" ||
    normalized === "non_binary" ||
    normalized === "nonbinary"
  ) {
    return "other";
  }

  return normalized;
}

function formatGender(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const ProfileSection = () => {
  const [open, setOpen] = useState(false);
  const { data: user, isLoading } = useUserProfile();
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const emptyDefaults: ProfileFormValues = {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "" as unknown as Date,
    avatar: "",
  };

  // Derived, memoized snapshot of the server data mapped to form shape.
  // Only recomputes when the underlying user object actually changes
  // (react-query keeps a stable reference between renders), so it never
  // spuriously marks the form dirty on unrelated re-renders.
  const values = useMemo<ProfileFormValues | undefined>(() => {
    if (!user) return undefined;
    const profileData = user as typeof user & {
      user?: { gender?: string | null };
      profile?: { gender?: string | null };
    };
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber || "",
      gender: normalizeGender(
        user.gender ?? profileData.user?.gender ?? profileData.profile?.gender,
      ),
      dob: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
      avatar: user.avatar?.url || "",
    };
  }, [user]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: values ?? emptyDefaults,
    values,
    // Preserve any in-progress, unsaved edits if a background refetch
    // (e.g. window refocus) resolves while the user is typing.
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!canPerformAction(() => setShowBlockedDialog(true))) {
      return;
    }

    try {
      let finalAvatarId = undefined;
      let finalAvatarUrl = values.avatar;

      // Handle file upload if a new file was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResult = await uploadFile(formData);

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Failed to upload image");
          return;
        }
        finalAvatarId = uploadResult.data?._id;
        finalAvatarUrl = uploadResult.data?.url || finalAvatarUrl;
      }

      // Split full name into first and last name (naive implementation)
      const names = values.fullName.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "";

      const payload: Record<string, unknown> = {
        firstName,
        lastName,
        phoneNumber: values.phone,
        dateOfBirth: values.dob ? format(values.dob, "yyyy-MM-dd") : undefined,
        ...values,
      };

      // Cleanup payload
      delete payload.fullName;
      delete payload.avatar;
      delete payload.phone; // Mapped to phoneNumber
      delete payload.dob; // Mapped to dateOfBirth

      if (finalAvatarId) {
        payload.avatar = finalAvatarId;
      }

      const result = await updateUserProfile(payload);

      if (result.success) {
        toast.success("Profile updated successfully");
        setSelectedFile(null);
        // Mark the form clean immediately with what was just saved, then
        // reconcile with the server in the background.
        form.reset({ ...values, avatar: finalAvatarUrl });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Vendor Profile][Personal Information] submit error:", error);
      }
      toast.error("An unexpected error occurred");
    }
  };

  const isDirty = form.formState.isDirty || !!selectedFile;
  const isSubmitting = form.formState.isSubmitting;

  const onReset = () => {
    setSelectedFile(null);
    if (values) {
      form.reset(values);
    }
  };

  return (
    <SectionShell title="Personal Information">
      {isLoading ? (
        <div className="flex items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Form {...form}>
          <form
            className="flex flex-col gap-6 p-4 sm:p-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <fieldset disabled={Boolean(restriction)} className="contents">
              <div className="flex justify-center">
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          variant="avatar"
                          value={field.value}
                          onFileSelect={(file) => {
                            setSelectedFile(file);
                            if (file) {
                              try {
                                field.onChange(URL.createObjectURL(file));
                              } catch (e) {
                                // Fallback
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label="Email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          readOnly
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label="Phone Number"
                          inputMode="tel"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            {field.value && !["female", "male", "other"].includes(field.value) && (
                              <SelectItem value={field.value}>{formatGender(field.value)}</SelectItem>
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
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="mt-1">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-2.5 py-1 text-base shadow-xs min-h-10.5 rounded-md border border-input bg-white font-medium transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/40 text-foreground"
                              >
                                <span className={cn(!field.value && "opacity-0")}>
                                  {field.value ? format(field.value, "PPP") : "Select date"}
                                </span>
                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                              </button>
                              <label
                                className={cn(
                                  "pointer-events-none absolute left-4 z-10 bg-background px-2 transition-all duration-200 -translate-y-4",
                                  field.value || open
                                    ? "top-2.5 text-xs text-muted-foreground"
                                    : "top-2/3 text-sm text-muted-foreground"
                                )}
                              >
                                Date of Birth
                              </label>
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            onSelect={(newDate) => {
                              if (newDate) {
                                field.onChange(newDate);
                              }
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-4">
                <PermissionActionGate module="business_profile" action="write">
                  <Button
                    type="submit"
                    className="px-6"
                    disabled={!isDirty || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </PermissionActionGate>
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onReset}
                    disabled={isSubmitting}
                  >
                    Reset Changes
                  </Button>
                )}
              </div>
            </fieldset>

            <VendorActionBlockedDialog
              open={showBlockedDialog}
              onOpenChange={setShowBlockedDialog}
              restriction={restriction}
            />
          </form>
        </Form>
      )}
    </SectionShell>
  );
};