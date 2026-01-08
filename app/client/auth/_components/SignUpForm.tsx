"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { register, resendVerificationEmail } from "@/lib/actions/auth/auth";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { signUpSchema } from "@/validation/auth";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function ClientSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [lastEmail, setLastEmail] = useState<string>("");
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function handleSubmit(values: SignUpFormValues) {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: "CUSTOMER",
      });

      setSuccessMessage(
        "Account created. Check your email for the verification link."
      );
      setLastEmail(values.email);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to complete sign up.";
      setServerError(message);
    }
  }

  async function handleResend() {
    if (!lastEmail) return;
    setResendStatus("loading");
    setServerError(null);
    try {
      await resendVerificationEmail({ email: lastEmail });
      setResendStatus("sent");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to resend verification email.";
      setServerError(message);
      setResendStatus("error");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="space-y-3 text-center xl:text-left">
        <h2 className="text-4xl font-bold text-foreground">Sign up</h2>
        <p className="text-sm text-muted-foreground">
          Sign up to enjoy the features of Momentev.
        </p>
      </div>

      {serverError ? (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {lastEmail ? (
        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>Didn&apos;t get the email?</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resendStatus === "loading"}
            onClick={handleResend}
          >
            {resendStatus === "loading" ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-3 w-3" /> Sending...
              </span>
            ) : resendStatus === "sent" ? (
              "Sent"
            ) : (
              "Resend verification"
            )}
          </Button>
        </div>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-8 space-y-4"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    id="firstName"
                    autoComplete="given-name"
                    label="First Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    id="lastName"
                    autoComplete="family-name"
                    label="Last Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    id="email"
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
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    label="Password"
                    suffix={
                      <button
                        type="button"
                        className="text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <Button type="button" variant="outline" className="w-full gap-2">
            <GoogleIcon /> Continue with Google
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/client/auth/log-in"
          className="font-semibold text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
