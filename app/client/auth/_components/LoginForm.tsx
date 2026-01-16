"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { loginSchema } from "@/validation/auth";
import { getGoogleAuthUrl, login } from "@/lib/actions/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

type ClientLoginFormProps = {
  verificationToken?: string;
};

export function ClientLoginForm({ verificationToken }: ClientLoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  // If token is present, redirect to verification-successful page
  useEffect(() => {
    if (verificationToken) {
      router.replace(
        `/client/auth/verification-successful?token=${encodeURIComponent(
          verificationToken
        )}`
      );
    }
  }, [verificationToken, router]);

  async function handleSubmit(values: LoginFormValues) {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const result = await login({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });

      if (!result.success) {
        setServerError(result.error || "Unable to log in.");
        return;
      }

      setSuccessMessage("Login successful.");
      form.reset();
      router.push("/client/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to log in.";
      setServerError(message);
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  async function handleGoogle() {
    setServerError(null);
    setGoogleLoading(true);
    try {
      const { url } = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in.";
      setServerError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="space-y-3 text-center xl:text-left">
        <h2 className="text-4xl font-bold text-foreground">Login</h2>
        <p className="text-sm text-muted-foreground">
          Please login to continue to your account.
        </p>
      </div>

      {serverError && (
        <p className="my-2 w-fit mx-auto rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {serverError}
        </p>
      )}

      {successMessage && (
        <p className="my-2 w-fit mx-auto rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {successMessage}
        </p>
      )}

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

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" /> Starting...
              </span>
            ) : (
              <>
                <GoogleIcon /> Sign in with Google
              </>
            )}
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
