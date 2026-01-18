"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(
  (
    { className, label, error, showCharCount, maxLength, id, ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    const textareaId =
      id || `textarea-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const isFloating =
      isFocused || hasValue || props.value || props.defaultValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value.length > 0);
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <textarea
          id={textareaId}
          ref={ref}
          maxLength={maxLength}
          className={cn(
            "peer min-h-[100px] w-full rounded-md border bg-background px-3 pt-6 pb-2 text-sm transition-colors resize-none",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive focus:ring-destructive"
              : "border-input",
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
            props.onBlur?.(e);
          }}
          onChange={handleChange}
          placeholder=""
          {...props}
        />
        <label
          htmlFor={textareaId}
          className={cn(
            "absolute left-3 top-4 text-sm text-muted-foreground transition-all duration-200 pointer-events-none",
            "peer-focus:top-2 peer-focus:text-xs -translate-y-4 bg-background px-2",
            isFloating && "top-2 text-xs",
            error && "text-destructive",
          )}
        >
          {label}
        </label>
        {(error || (showCharCount && maxLength)) && (
          <div className="mt-1 flex items-center justify-between">
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <span />
            )}
            {showCharCount && maxLength && (
              <p className="text-xs text-muted-foreground">
                {charCount} / {maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingLabelTextarea };
