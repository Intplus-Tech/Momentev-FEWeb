"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { GoogleIcon } from "./GoogleIcon";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  async function handleSubmit(values: LoginFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("login", values);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="mx-auto w-full max-w-xl pb-6">
      <Logo className="hidden xl:block" />
      <div className="mt-4 flex flex-col gap-y-6 p-4 text-center">
        <div>
          <h2 className="text-xl">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            Please login to continue your account.
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    type="password"
                    autoComplete="current-password"
                    label="Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-sm text-slate-600">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-slate-600">
                    Keep me logged in
                  </FormLabel>
                </FormItem>
              )}
            />

            <Link
              href="/vendor/auth/password-reset"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Logging in...
              </span>
            ) : (
              "Log in"
            )}
          </Button>

          <Button type="button" variant="outline" className="w-full gap-2">
            <GoogleIcon /> Sign in with Google
          </Button>
        </form>
      </Form>

      <p className="mt-2 text-center text-sm text-slate-600">
        Need an account?{" "}
        <Link
          href="/vendor/auth/sign-up"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
