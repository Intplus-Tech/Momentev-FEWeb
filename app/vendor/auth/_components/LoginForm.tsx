"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { GoogleIcon } from "./GoogleIcon";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().default(false),
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Logo className="mx-auto" />
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
          <p className="text-sm text-slate-500">
            Please login to continue your account.
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder="jonas.kahnwald@gmail.com"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
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
                <Loader2 className="h-4 w-4 animate-spin" />
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

      <p className="text-center text-sm text-slate-600">
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
