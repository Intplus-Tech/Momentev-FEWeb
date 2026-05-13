// Settings page — Server Component shell for permission gating.
// The actual settings UI lives in ./_components/settings-client-page.tsx
import { checkPageAccess } from "@/lib/actions/staff";
import { NotAuthorized } from "@/components/vendor/NotAuthorized";
import { SettingsClientPage } from "./_components/settings-client-page";

export default async function VendorSettingsPage() {
  const { allowed } = await checkPageAccess("business_profile", "read");
  if (!allowed) return <NotAuthorized module="business_profile" />;

  return <SettingsClientPage />;
}

