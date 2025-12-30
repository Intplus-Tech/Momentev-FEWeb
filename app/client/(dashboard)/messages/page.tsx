import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const conversations = [
  {
    vendor: "Golden Lens Studio",
    snippet: "We can include a second shooter for the ceremony…",
    unread: true,
    updated: "5m ago",
  },
  {
    vendor: "Velvet & Co.",
    snippet: "Sharing layout mockups for the welcome dinner",
    unread: false,
    updated: "1h ago",
  },
  {
    vendor: "North Bloom",
    snippet: "Sending over a refreshed floral palette tonight",
    unread: false,
    updated: "3h ago",
  },
];

export default function ClientMessagesPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Continue conversations with vendors across every request.
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Messages</h1>
        </div>
        <Button>Compose</Button>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            All threads sorted by latest replies.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {conversations.map((conversation) => (
            <div
              key={conversation.vendor}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">
                    {conversation.vendor}
                  </p>
                  {conversation.unread ? <Badge>New</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {conversation.snippet}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {conversation.updated}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
