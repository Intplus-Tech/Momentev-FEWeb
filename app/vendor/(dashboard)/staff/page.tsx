import { checkPageAccess } from "@/lib/actions/staff";
import { NotAuthorized } from "@/components/vendor/NotAuthorized";
import { TeamSection } from "../settings/_components/team-section";

export const dynamic = "force-dynamic";

export default async function VendorStaffPage() {
  const { allowed } = await checkPageAccess("manage_staff", "read");
  if (!allowed) return <NotAuthorized module="manage_staff" />;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your team members and their access permissions.
        </p>
      </div>
      <TeamSection />
    </section>
  );
}
