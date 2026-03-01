import {
  ClipboardList,
  ArrowRight,
  Sparkles,
  Send,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No requests yet",
  description = "Create your first request and let vendors come to you with quotes for your event.",
  actionLabel = "Create New Request",
  actionHref = "/client/custom-request",
}: EmptyStateProps) {
  return (
    <div className="flex min-h-120 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-linear-to-b from-muted/30 to-background">
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <ClipboardList className="h-9 w-9 text-primary" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        </div>

        {/* Copy */}
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-sm">
          {description}
        </p>

        {/* CTA */}
        <Button asChild size="lg" className="mt-6 rounded-full px-8 gap-2">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {/* How it works */}
        <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-md">
          {[
            {
              icon: ClipboardList,
              label: "Describe your event",
            },
            {
              icon: Send,
              label: "Vendors are notified",
            },
            {
              icon: FileText,
              label: "Compare quotes",
            },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <step.icon className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground leading-tight">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
