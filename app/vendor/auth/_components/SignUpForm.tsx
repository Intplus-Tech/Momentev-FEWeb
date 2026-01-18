"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { GoogleIcon } from "@/components/icons/google-icon";
import { Spinner } from "@/components/ui/spinner";
import { getGoogleAuthUrl, register } from "@/lib/actions/auth";
import { toast } from "sonner";
import { signUpSchema } from "@/validation/auth";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
    },
  });

  async function handleSubmit(values: SignUpFormValues) {
    try {
      const result = await register({
        firstName: values.companyName,
        lastName: values.companyName,
        email: values.email,
        password: values.password,
        role: "VENDOR",
      });

      if (!result.success) {
        toast.error(result.error || "Unable to complete sign up.");
        return;
      }

      // Redirect to email verification page with email
      router.push(
        `/vendor/auth/email-verification?email=${encodeURIComponent(
          values.email,
        )}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete sign up right now.";
      toast.error(message);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const { url } = await getGoogleAuthUrl("vendor");
      window.location.href = url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in.";
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="mx-auto w-full xl:min-w-sm ">
      <Logo className="hidden xl:block" />
      <div className="flex flex-col gap-y-4 text-center p-4">
        <div>
          <h2 className="text-xl">Get Started with Momentev</h2>
          <p className="text-sm text-muted-foreground">
            Not a vendor?
            <Button variant={"link"} className="underline" asChild>
              <Link href="/client/auth/log-in">Sign in here</Link>
            </Button>
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mx-auto w-full xl:px-4 sm:px-0 md:px-10"
        >
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    autoComplete="given-name"
                    label="Company Name"
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

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Creating workspace...
                </span>
              ) : (
                "Sign up"
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
                  <GoogleIcon /> Continue with Google
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{" "}
        <Link
          href="/vendor/auth/log-in"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
