"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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

const resetSchema = z.object({
  email: z.string().email("Please enter the email you registered with."),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export function PasswordResetForm() {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(values: ResetFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("password-reset", values);
  }

  const isSubmitting = form.formState.isSubmitting;

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
                  You&apos;ll receive a link that stays active for 20 minutes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
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
