"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import {
  VENDOR_SUSPENDED_DESCRIPTION,
  VENDOR_SUSPENDED_TITLE,
} from "@/lib/vendor-access";

export function VendorBanner() {
  const { restriction, isSuspended } = useVendorActionGuard();

  if (!isSuspended) return null;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-50 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-start gap-3 sm:items-center">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-semibold">
              {restriction?.title || VENDOR_SUSPENDED_TITLE}
            </p>
            <p className="text-xs text-foreground/80 sm:text-sm max-w-4xl">
              {restriction?.description || VENDOR_SUSPENDED_DESCRIPTION}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 border-amber-500/30 bg-background/70 text-foreground hover:bg-background"
          >
            <a href="/vendor/settings?tab=support">
              Contact support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}