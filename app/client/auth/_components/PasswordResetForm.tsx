"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

const resetSchema = z.object({
  email: z.string().email("Enter the email tied to your account."),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export function ClientPasswordResetForm() {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(values: ResetFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("client-password-reset", values);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="mx-auto w-full max-w-xl pb-6">
      <Logo className="hidden xl:block" />
      <div className="mt-4 flex flex-col gap-y-6 p-4 text-center">
        <div>
          <h2 className="text-xl">Reset password</h2>
          <p className="text-sm text-muted-foreground">
            We will email you a secure link that expires in 20 minutes.
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
                    label="Email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  We will send instructions if this email is on file.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Sending link...
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
          href="/client/auth/log-in"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
