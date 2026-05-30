import { useRef } from "react";
import { Send, Smile, Paperclip, X, FileIcon, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import type { VendorActionRestriction } from "@/lib/vendor-access";

export type PendingAttachment = {
  file: File;
  previewUrl?: string;
};

export type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  pendingAttachment?: PendingAttachment | null;
  onFileSelect?: (file: File) => void;
  onRemoveAttachment?: () => void;
  isUploading?: boolean;
  restriction?: VendorActionRestriction | null;
  showInlineBanner?: boolean;
};

export const MessageComposer = ({
  value,
  onChange,
  onSend,
  pendingAttachment,
  onFileSelect,
  onRemoveAttachment,
  isUploading,
  restriction = null,
  showInlineBanner = true,
}: MessageComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isRestricted = Boolean(restriction);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    event.target.value = "";
  };

  const isImage = pendingAttachment?.file.type.startsWith("image/");

  return (
    <div className="shrink-0 border-t bg-background px-4 py-4">
      {isRestricted && showInlineBanner ? (
        <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">{restriction?.title}</p>
              <p className="text-xs text-foreground/80">{restriction?.description}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pending attachment preview */}
      {pendingAttachment && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          {isImage && pendingAttachment.previewUrl ? (
            <img
              src={pendingAttachment.previewUrl}
              alt="Preview"
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">
              {pendingAttachment.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(pendingAttachment.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemoveAttachment}
            disabled={isUploading || isRestricted}
          >
            <X className="h-4 w-4" />
          </Button>
          {/* Send button for attachment */}
          <Button
            type="button"
            variant="default"
            size="icon-sm"
            className="rounded-full"
            onClick={onSend}
            disabled={isUploading || isRestricted}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Composer input row */}
      <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 px-3 py-2 shadow-inner">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              disabled={isUploading || isRestricted}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={16}
            className="w-full border-none bg-transparent p-0 shadow-none"
          >
            <EmojiPicker
              theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
              onEmojiClick={(emojiData) => {
                onChange(value + emojiData.emoji);
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={handleAttachClick}
          disabled={isUploading || isRestricted}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (!isRestricted) {
                onSend();
              }
            }
          }}
          placeholder="Type your message here..."
          className="h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isUploading || isRestricted}
        />
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          className="rounded-full"
          onClick={onSend}
          disabled={isUploading || isRestricted}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
