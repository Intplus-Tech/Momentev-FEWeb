"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { resetPassword } from "@/lib/actions/auth";

const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export function ClientNewPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function handleSubmit(values: NewPasswordFormValues) {
    if (!token) {
      toast.error("Reset token is missing. Please use the link from your email.");
      return;
    }

    const result = await resetPassword(token, values.newPassword);
    if (result.success) {
      setSuccess(true);
    } else {
      toast.error(result.error || "Failed to reset password. Please try again.");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-xl pb-6">
        <div className="mt-4 flex flex-col items-center gap-y-4 p-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Invalid reset link</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This reset link is missing a token. Please use the link sent to your email.
            </p>
          </div>
          <Link
            href="/client/auth/password-reset"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-xl pb-6">
        <div className="mt-4 flex flex-col items-center gap-y-4 p-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Password reset!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
          <Button className="w-full max-w-xs" onClick={() => router.push("/client/auth/log-in")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-6">
      <div className="mt-4 flex flex-col gap-y-6 p-4 text-center">
        <div>
          <h2 className="text-4xl font-bold">Set new password</h2>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mx-auto w-full space-y-5 sm:px-0 md:px-10 xl:px-10"
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    type="password"
                    autoComplete="new-password"
                    label="New password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    type="password"
                    autoComplete="new-password"
                    label="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Resetting password...
              </span>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link
          href="/client/auth/password-reset"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Request a new link
        </Link>
      </p>
    </div>
  );
}
