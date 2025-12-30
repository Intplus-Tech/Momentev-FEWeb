import { Send, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export const MessageComposer = ({
  value,
  onChange,
  onSend,
}: MessageComposerProps) => {
  return (
    <div className="border-t px-4 py-4">
      <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 px-3 py-2 shadow-inner">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
        >
          <Smile className="h-4 w-4" />
        </Button>
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
        />
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          className="rounded-full"
          onClick={onSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
