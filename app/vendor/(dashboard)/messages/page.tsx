import { checkPageAccess } from "@/lib/actions/staff";
import { NotAuthorized } from "@/components/vendor/NotAuthorized";
import { MessagesView } from "./_components/messages-view";

export default async function VendorMessagesPage() {
  const { allowed } = await checkPageAccess("chat", "read");
  if (!allowed) return <NotAuthorized module="chat" />;

  return <MessagesView />;
}

