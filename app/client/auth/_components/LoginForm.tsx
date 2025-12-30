"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "@/components/icons/google-icon";

const loginSchema = z.object({
  email: z.email("Please use a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function ClientLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
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
    console.log("client-login", values);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="space-y-3 text-center xl:text-left">
        <h2 className="text-4xl font-bold text-foreground">Login</h2>
        <p className="text-sm text-muted-foreground">
          Please login to continue to your account.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-8 space-y-5"
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    label="Password"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-muted-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
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
                    Keep me signed in
                  </FormLabel>
                </FormItem>
              )}
            />

            <Link
              href="/client/auth/password-reset"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          <Button type="button" variant="outline" className="w-full gap-2">
            <GoogleIcon /> Sign in with Google
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link
          href="/client/auth/sign-up"
          className="font-semibold text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
