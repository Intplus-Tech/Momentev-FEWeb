"use client";

import { MessageSquare } from "lucide-react";

/**
 * ClientMessagesPage (Root of /messages)
 *
 * This page renders inside the MessagesLayout.
 * On Desktop: It appears in the right column as an "Empty State" instructing the user to select a chat.
 * On Mobile: The Layout hides this page (via CSS/logic) because the Sidebar is shown instead.
 */
const ClientMessagesPage = () => {
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
};

export default ClientMessagesPage;
