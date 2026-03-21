"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { forgotPassword } from "@/lib/actions/auth";

const resetSchema = z.object({
  email: z.string().email("Please enter the email you registered with."),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export function PasswordResetForm() {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  async function handleSubmit(values: ResetFormValues) {
    const result = await forgotPassword(values.email);
    if (result.success) {
      setEmailSent(true);
    } else {
      toast.error(result.error || "Failed to send reset link. Please try again.");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  if (emailSent) {
    return (
      <div className="mx-auto w-full max-w-xl pb-6">
        <Logo className="hidden xl:block" />
        <div className="mt-4 flex flex-col items-center gap-y-4 p-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If an account exists for{" "}
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
              , you will receive a password reset link shortly. The link expires in 1 hour.
            </p>
          </div>
          <p className="text-sm text-slate-600">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Try again
            </button>
          </p>
          <Link
            href="/vendor/auth/log-in"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-6">
      <Logo className="hidden xl:block" />
      <div className="mt-4 flex flex-col gap-y-6 p-4 text-center">
        <div>
          <h2 className="text-xl">Reset password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your account email and we&apos;ll send a secure reset link.
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    label="Work email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You&apos;ll receive a link that stays active for 1 hour.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Sending reset link...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-2 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link
          href="/vendor/auth/log-in"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
