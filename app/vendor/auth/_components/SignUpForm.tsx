"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { GoogleIcon } from "./GoogleIcon";

const signUpSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
    },
  });

  async function handleSubmit(values: SignUpFormValues) {
    // Simulate the request lifecycle until the API hook is wired in.
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("sign-up", values);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <Logo className="mx-auto" />
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Get Started with Momentev
          </h2>
          <p className="text-sm text-slate-500">
            Not a vendor?{" "}
            <Link
              href="/client/auth/sign-up"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Majestic Moments" {...field} />
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500"
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
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

          <Button type="button" variant="outline" className="w-full gap-2">
            <GoogleIcon /> Continue with Google
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-slate-600">
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
