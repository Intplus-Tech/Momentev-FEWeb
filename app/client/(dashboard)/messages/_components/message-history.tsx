import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { ChatMessage } from "@/lib/types/chat";
import type { ConversationMessage } from "../data";

export type MessageHistoryProps = {
  messages: (ChatMessage | ConversationMessage)[];
  isTyping?: boolean;
  typingLabel?: string;
  className?: string;
  userSide?: "user" | "vendor";
  counterpartyLastReadAt?: string;
};

export const MessageHistory = ({
  messages,
  isTyping,
  typingLabel,
  className,
  userSide = "user",
  counterpartyLastReadAt,
}: MessageHistoryProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  return (
    <ScrollArea className={cn("flex-1 px-5 py-5", className)}>
      <div className="flex flex-col gap-4">
        {messages.map((msg) => {
          // Cast to any to handle both ChatMessage (API) and ConversationMessage (Mock) fields dynamically
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = msg as any;

          const isUser = m.senderSide === "user" || m.sender === "user";

          const id = m._id || m.id;
          const text = m.text || m.message;
          const timeDisplay = m.createdAt
            ? format(new Date(m.createdAt), "p")
            : m.time || "";

          const isMe = m.senderSide === userSide;
          const isRead =
            isMe &&
            counterpartyLastReadAt &&
            m.createdAt &&
            new Date(m.createdAt) <= new Date(counterpartyLastReadAt);

          return (
            <div
              key={id}
              className={cn(
                "flex flex-col gap-1",
                isUser ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-sm",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {text}
              </div>
              <div className="flex items-center gap-1 px-1">
                <span className="text-[11px] text-muted-foreground">
                  {timeDisplay}
                </span>
                {isMe &&
                  (isRead ? (
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Check className="h-3 w-3 text-muted-foreground" />
                  ))}
              </div>
            </div>
          );
        })}

        {isTyping ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs">{typingLabel ?? "Typing..."}</span>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
};
