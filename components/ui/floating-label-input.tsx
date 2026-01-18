import * as React from "react";

import { cn } from "@/lib/utils";

export type FloatingLabelInputProps =
  React.ComponentPropsWithoutRef<"input"> & {
    label: string;
    suffix?: React.ReactNode;
    error?: string;
  };

export const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(
  (
    {
      label,
      className,
      suffix,
      error,
      id,
      type = "text",
      placeholder = " ",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            "peer block px-2.5 py-1 text-base shadow-xs w-full rounded-md border border-input bg-white font-medium text-foreground transition-all",
            "focus:border-primary focus:ring-4 focus:ring-primary/40",
            "disabled:bg-slate-100 disabled:text-muted-foreground",
            "aria-invalid:border-rose-500 aria-invalid:ring-rose-100",
            suffix ? "pr-12" : "pr-4",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-4 top-2.5 z-10 -translate-y-4 bg-background px-2 text-xs transition-all duration-200 peer-placeholder-shown:top-2/3 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-primary",
            error ? "text-rose-500" : "text-muted-foreground",
          )}
        >
          {label}
        </label>
        {suffix ? (
          <div className="pointer-events-auto absolute inset-y-0 right-3 flex items-center">
            {suffix}
          </div>
        ) : null}
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);

FloatingLabelInput.displayName = "FloatingLabelInput";
