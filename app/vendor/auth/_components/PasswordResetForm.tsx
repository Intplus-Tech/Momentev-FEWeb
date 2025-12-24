"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Logo className="mx-auto" />
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Reset password
          </h2>
          <p className="text-sm text-slate-500">
            Enter your account email and we&apos;ll send a secure reset link.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder="studio@momentev.com"
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

      <p className="text-center text-sm text-slate-600">
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
