"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { DeleteAccountModal } from "@/components/shared/delete-account-modal";
import {
  getUserProfile,
  setPassword,
  changePassword,
} from "@/lib/actions/user";

import { SectionShell } from "./section-shell";

// Schema for setting password (Google users)
const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

// Schema for changing password (Standard users)
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!result.success) {
        toast.error("Failed to change password", {
          description: result.error,
        });
        return;
      }

      toast.success("Password changed successfully");
      reset();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <FloatingLabelInput
        label="Current Password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <FloatingLabelInput
        label="New Password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <FloatingLabelInput
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmNewPassword?.message}
        {...register("confirmNewPassword")}
      />
      <Button type="submit" className="px-6" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}

export const SecuritySection = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
  });

  useEffect(() => {
    const checkAuthProvider = async () => {
      const result = await getUserProfile();
      if (result.success && result.data) {
        // Show "Set Password" only for Google users who haven't set a password yet
        const shouldShowSetPassword =
          result.data.authProvider === "google" &&
          result.data.hasPassword === false;
        setIsGoogleUser(shouldShowSetPassword);
      }
      setIsLoading(false);
    };

    checkAuthProvider();
  }, []);

  const onSetPassword = async (data: SetPasswordForm) => {
    setIsSubmitting(true);

    try {
      const result = await setPassword(data.password);

      if (!result.success) {
        toast.error("Failed to set password", {
          description: result.error || "An unexpected error occurred",
        });
        setIsSubmitting(false);
        return;
      }

      toast.success("Password set successfully", {
        description: "You can now login with either Google or email/password.",
      });

      reset();
      // Update state to show change password form instead
      setIsGoogleUser(false);
    } catch (error) {
      toast.error("Failed to set password", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SectionShell title="Security Settings">
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      </SectionShell>
    );
  }

  return (
    <>
      {isGoogleUser ? (
        <SectionShell title="Set Password">
          <div className="mb-4 p-4 flex gap-2 rounded-lg bg-blue-50 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <Info className="h-5 w-5 shrink-0" />
            <p>
              Set a password to enable login with both Google and
              email/password.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSetPassword)} className="space-y-4">
            <FloatingLabelInput
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <FloatingLabelInput
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" className="px-6" disabled={isSubmitting}>
              {isSubmitting ? "Setting Password..." : "Set Password"}
            </Button>
          </form>
        </SectionShell>
      ) : (
        <SectionShell title="Change Password">
          <ChangePasswordForm />
        </SectionShell>
      )}

      <SectionShell title="Danger Zone">
        <div>
          <div className="space-y-3 p-4">
            <div>
              <h3 className="font-semibold text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </SectionShell>

      <DeleteAccountModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </>
  );
};
