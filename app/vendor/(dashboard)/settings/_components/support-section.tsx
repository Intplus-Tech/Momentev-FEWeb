"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LifeBuoy, Clock, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import type { SupportPrefill } from "../types";
import { SectionShell } from "./section-shell";
import { createSupportRequest, getMySupportRequests } from "@/lib/actions/support";
import type { SupportRequest, SupportRequestStatus } from "@/lib/actions/support";

// ─── Schema ───────────────────────────────────────────────────────────────────

const supportSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportFormValues = z.infer<typeof supportSchema>;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  resolved:    { label: "Resolved",    className: "bg-green-100 text-green-700" },
};

function StatusBadge({ status }: { status: SupportRequestStatus | string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Past Requests ────────────────────────────────────────────────────────────

function PastRequestRow({ req }: { req: SupportRequest }) {
  const [open, setOpen] = useState(false);

  const preview = req.subject?.trim()
    ? req.subject
    : req.message.slice(0, 60) + (req.message.length > 60 ? "…" : "");

  return (
    <div className="rounded-lg border border-border/50 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <LifeBuoy className="h-4 w-4 shrink-0 text-primary/70" />
          <span className="text-sm font-medium truncate">{preview}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={req.status} />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {format(new Date(req.createdAt), "MMM d, yyyy")}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-border/40 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span><span className="font-medium text-foreground">From: </span>{req.firstName} {req.lastName}</span>
            <span><span className="font-medium text-foreground">Email: </span>{req.email}</span>
            {req.subject && (
              <span className="col-span-2">
                <span className="font-medium text-foreground">Subject: </span>{req.subject}
              </span>
            )}
            <span className="col-span-2">
              <span className="font-medium text-foreground">Submitted: </span>
              {format(new Date(req.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">{req.message}</p>

          {req.adminNotes && (
            <div className="flex gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-blue-700">Admin Note</p>
                <p className="text-xs text-blue-600 leading-relaxed">{req.adminNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PastRequestsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["support-requests", "me"],
    queryFn: async () => {
      const result = await getMySupportRequests(1, 20);
      if (!result.success) throw new Error(result.error || "Failed to load requests");
      return result.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-center text-sm text-muted-foreground py-6">
        Could not load your past requests.
      </p>
    );
  }

  const requests = data.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No past support requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((req) => (
        <PastRequestRow key={req._id} req={req} />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const SupportSection = ({ prefill }: { prefill: SupportPrefill }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      firstName: prefill.firstName,
      lastName: prefill.lastName,
      email: prefill.email,
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: SupportFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createSupportRequest(values);
      if (result.success) {
        toast.success("Support request sent successfully");
        form.reset({ ...values, subject: "", message: "" });
      } else {
        toast.error(result.error || "Failed to send support request");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New request form */}
      <SectionShell title="Submit a Support Request">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="First Name" />
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
                    <FormLabel className="text-xs text-muted-foreground">Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Last Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Subject</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="How can we help?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Let us know how we can help"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Button type="submit" className="px-6" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </SectionShell>

      {/* Past requests list */}
      <SectionShell title="My Past Requests">
        <div className="p-4">
          <PastRequestsList />
        </div>
      </SectionShell>
    </div>
  );
};
