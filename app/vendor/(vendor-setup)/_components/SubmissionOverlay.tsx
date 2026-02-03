"use client";

import { Loader2 } from "lucide-react";

interface SubmissionOverlayProps {
  isVisible: boolean;
  message?: string;
}

/**
 * Full-page overlay that blocks user interaction during form submission
 * Shows a loading spinner and optional message
 */
export function SubmissionOverlay({
  isVisible,
  message = "Submitting...",
}: SubmissionOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-lg border">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          Please wait, do not close this page
        </p>
      </div>
    </div>
  );
}
