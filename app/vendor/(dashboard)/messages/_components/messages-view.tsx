"use client";

import { MessageSquare } from "lucide-react";

/**
 * MessagesView — the client-side empty state for /vendor/messages root.
 *
 * Rendered by the Server Component page.tsx after the chat permission
 * check passes. Kept as a client component because the messages layout
 * uses client-side socket/chat hooks.
 *
 * Desktop: "Select a conversation" empty state
 * Mobile: Hidden by the messages layout
 */
export function MessagesView() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Select a conversation</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Choose a conversation from the sidebar to start messaging.
      </p>
    </div>
  );
}
