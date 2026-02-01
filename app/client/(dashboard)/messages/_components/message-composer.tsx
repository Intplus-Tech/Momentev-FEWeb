import { useRef } from "react";
import { Send, Smile, Paperclip, X, FileIcon, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
};

export const MessageComposer = ({
  value,
  onChange,
  onSend,
  pendingAttachment,
  onFileSelect,
  onRemoveAttachment,
  isUploading,
}: MessageComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  const isImage = pendingAttachment?.file.type.startsWith("image/");

  return (
    <div className="border-t px-4 py-4">
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
            disabled={isUploading}
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
            disabled={isUploading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Composer input row */}
      <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 px-3 py-2 shadow-inner">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={handleAttachClick}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Type your message here..."
          className="h-11 flex-1 border-0 bg-transparent px-1 text-sm focus-visible:ring-0"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          className="rounded-full"
          onClick={onSend}
          disabled={isUploading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
