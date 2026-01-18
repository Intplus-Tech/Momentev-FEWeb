"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FloatingLabelSelectProps {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const FloatingLabelSelect = React.forwardRef<
  HTMLButtonElement,
  FloatingLabelSelectProps
>(
  (
    {
      className,
      label,
      error,
      options,
      value,
      onValueChange,
      placeholder,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = !!value;
    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            className={cn(
              "h-12 w-full rounded-md border bg-background px-3 text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-destructive focus:ring-destructive"
                : "border-input",
              !hasValue && "text-muted-foreground",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200 pointer-events-none",
            isFloating && "top-2 text-xs bg-background -translate-y-4 px-2",
            error && "text-destructive",
          )}
        >
          {label}
        </label>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

FloatingLabelSelect.displayName = "FloatingLabelSelect";

export { FloatingLabelSelect };
