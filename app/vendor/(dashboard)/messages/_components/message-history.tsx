import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { ConversationMessage } from "../data";

export type MessageHistoryProps = {
  messages: ConversationMessage[];
  isTyping?: boolean;
  typingLabel?: string;
  className?: string;
};

export const MessageHistory = ({
  messages,
  isTyping,
  typingLabel,
  className,
}: MessageHistoryProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  return (
    <ScrollArea className={cn("flex-1 px-5 py-5", className)}>
      <div className="flex flex-col gap-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1",
                isUser ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-sm",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {msg.message}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {msg.time}
              </span>
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
