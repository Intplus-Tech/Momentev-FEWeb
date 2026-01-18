"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface StepSectionProps {
  number: number;
  title: string;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function StepSection({
  number,
  title,
  isCompleted,
  isExpanded,
  onToggle,
  children,
}: StepSectionProps) {
  return (
    <div
      className={`overflow-hidden rounded transition-all
         ${isExpanded ? "border-b-2" : ""}
`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 sm:p-4 text-left transition-colors"
      >
        <div
          className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            isCompleted
              ? "bg-primary text-primary-foreground"
              : isExpanded
                ? "bg-primary text-primary-foreground"
                : "border-2 border-muted-foreground bg-background text-muted-foreground"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <span>{number}</span>
          )}
        </div>
        <span
          className={`text-sm sm:text-base font-medium ${
            isCompleted || isExpanded ? "text-foreground" : "text-foreground"
          }`}
        >
          {title}
        </span>
        {isCompleted && !isExpanded && (
          <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
        )}
      </button>

      {isExpanded && children && (
        <div className="border-t bg-background/50 px-2 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
