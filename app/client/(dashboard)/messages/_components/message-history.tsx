import { useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Check,
  CheckCheck,
  FileIcon,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { ChatMessage } from "@/types/chat";
import type { ConversationMessage } from "../data";

export type UploadingMessage = {
  id: string;
  previewUrl?: string;
  fileName: string;
  fileSize: number;
  isImage: boolean;
  status: "uploading" | "success" | "error";
  text?: string;
};

export type MessageHistoryProps = {
  messages: (ChatMessage | ConversationMessage)[];
  isTyping?: boolean;
  typingLabel?: string;
  className?: string;
  userSide?: "user" | "vendor";
  counterpartyLastReadAt?: string;
  uploadingMessage?: UploadingMessage | null;
};

export const MessageHistory = ({
  messages,
  isTyping,
  typingLabel,
  className,
  userSide = "user",
  counterpartyLastReadAt,
  uploadingMessage,
}: MessageHistoryProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping, uploadingMessage]);

  const renderAttachment = (
    attachments: any[] | undefined,
    type: string,
    isUser: boolean,
  ) => {
    if (!attachments || attachments.length === 0) return null;

    return attachments.map((attachment, idx) => {
      // Check mimeType or URL extension for image detection
      const imageExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".svg",
        ".bmp",
      ];
      const url = attachment.url || "";
      const hasImageExtension = imageExtensions.some((ext) =>
        url.toLowerCase().includes(ext),
      );
      const isImage =
        attachment.mimeType?.startsWith("image/") || hasImageExtension;

      if (isImage) {
        return (
          <div key={idx} className="mt-2 overflow-hidden rounded-xl">
            <img
              src={attachment.url}
              alt={attachment.originalName || "Image"}
              className="max-h-64 w-auto max-w-full rounded-xl object-cover"
            />
          </div>
        );
      }

      // File attachment
      return (
        <a
          key={idx}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-2 flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50",
            isUser
              ? "border-primary-foreground/20 bg-primary-foreground/10"
              : "border-border bg-background",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isUser ? "bg-primary-foreground/20" : "bg-muted",
            )}
          >
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">
              {attachment.originalName || "File"}
            </p>
            <p className="text-xs opacity-70">
              {attachment.size
                ? `${(attachment.size / 1024).toFixed(1)} KB`
                : "Download"}
            </p>
          </div>
          <Download className="h-4 w-4 opacity-70" />
        </a>
      );
    });
  };

  return (
    <ScrollArea className={cn("flex-1 px-5 py-5", className)}>
      <div className="flex flex-col gap-4">
        {messages.map((msg) => {
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

          const hasAttachments = m.attachments && m.attachments.length > 0;
          const hasText = !!text;

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
                {hasText && <p>{text}</p>}
                {renderAttachment(m.attachments, m.type, isUser)}
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

        {/* Uploading message preview */}
        {uploadingMessage && (
          <div className="flex flex-col gap-1 items-end">
            <div className="max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-sm bg-primary text-primary-foreground">
              {uploadingMessage.text && <p>{uploadingMessage.text}</p>}
              <div className="mt-2 relative overflow-hidden rounded-xl">
                {uploadingMessage.isImage && uploadingMessage.previewUrl ? (
                  <div className="relative">
                    <img
                      src={uploadingMessage.previewUrl}
                      alt="Uploading"
                      className="max-h-64 w-auto max-w-full rounded-xl object-cover opacity-70"
                    />
                    {uploadingMessage.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                    {uploadingMessage.status === "error" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-xl">
                        <AlertCircle className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3",
                      "border-primary-foreground/20 bg-primary-foreground/10",
                    )}
                  >
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
                      {uploadingMessage.status === "uploading" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : uploadingMessage.status === "error" ? (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      ) : (
                        <FileIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {uploadingMessage.fileName}
                      </p>
                      <p className="text-xs opacity-70">
                        {uploadingMessage.status === "uploading"
                          ? "Uploading..."
                          : uploadingMessage.status === "error"
                            ? "Failed to upload"
                            : `${(uploadingMessage.fileSize / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 px-1">
              <span className="text-[11px] text-muted-foreground">
                {uploadingMessage.status === "uploading"
                  ? "Sending..."
                  : uploadingMessage.status === "error"
                    ? "Failed"
                    : format(new Date(), "p")}
              </span>
            </div>
          </div>
        )}

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
