"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { GoogleIcon } from "@/components/icons/google-icon";
import { Spinner } from "@/components/ui/spinner";
import { getGoogleAuthUrl, login } from "@/lib/actions/auth";
import { getUserProfile } from "@/lib/actions/user";
import { toast } from "sonner";
import { loginSchema } from "@/validation/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  verificationToken?: string;
};

export function LoginForm({ verificationToken }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
        `/vendor/auth/verification-successful?token=${encodeURIComponent(
          verificationToken,
        )}`,
      );
    }
  }, [verificationToken, router]);

  async function handleSubmit(values: LoginFormValues) {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
        remember: values.remember,
        expectedRole: "VENDOR",
      });

      if (!result.success) {
        toast.error(result.error || "Unable to log in.");
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
        return;
      }

      toast.success("Login successful.");
      form.reset();

      // Check onboarding status and redirect accordingly
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.data?.vendor) {
        const { vendor } = profileResult.data;

        if (!vendor.onBoarded) {
          // Redirect to appropriate setup step based on onBoardingStage
          const stageRoutes: Record<number, string> = {
            0: "/vendor/business-setup",
            1: "/vendor/business-setup",
            2: "/vendor/service-setup",
            3: "/vendor/payment-setup",
            4: "/vendor/profile-setup",
          };
          const redirectRoute =
            stageRoutes[vendor.onBoardingStage] || "/vendor/business-setup";
          router.push(redirectRoute);
          return;
        }
      }

      // Vendor is onboarded, go to dashboard
      router.push("/vendor/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to log in right now.";
      toast.error(message);
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      // Store role in sessionStorage before redirecting to Google
      sessionStorage.setItem("google_auth_role", "vendor");

      const { url } = await getGoogleAuthUrl("vendor");
      window.location.href = url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in.";
      toast.error(message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-6">
      <Logo className="hidden xl:block" />
      <div className="mt-4 flex flex-col gap-y-6 my-4 sm:px-0 md:px-10 xl:px-10">
        <div>
          <h2 className="text-xl">Login</h2>
          <p className="text-sm text-muted-foreground">
            Please login to continue your account.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mx-auto w-full sm:px-0 md:px-10 xl:px-10"
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
                    Keep me logged in
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button variant="link">
              <Link
                href="/vendor/auth/password-reset"
                className="font-semibold "
              >
                Forgot password?
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
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

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                or
              </span>
              <Separator className="flex-1" />
            </div>

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
          </div>
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
