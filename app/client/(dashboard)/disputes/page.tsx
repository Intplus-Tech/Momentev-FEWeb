import { getClientDisputes } from "@/lib/actions/disputes";
import { DisputesFilter } from "./_components/disputes-filter";
import { DisputeCard } from "./_components/DisputeCard";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function ClientDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "all";

  // Using a fixed high page limit like bookings for simple MVP
  const response = await getClientDisputes(1, 50, statusFilter);

  if (!response.success || !response.data) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">My Disputes</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and track your active and past dispute cases
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {response.error ||
              "Failed to load disputes. Please try again later."}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  const disputes = response.data.data || [];
  const totalDisputes = response.data.total;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">My Disputes</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and track your active and past dispute cases
          </p>
        </div>
      </div>

      <DisputesFilter />

      {disputes.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center animate-in fade-in duration-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No Disputes Found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            {statusFilter === "all"
              ? "You don't have any dispute records. If you experience issues with an event booking, you can open a dispute from your Bookings."
              : `You don't have any disputes matching the '${statusFilter}' status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {disputes.length} {disputes.length === 1 ? "dispute" : "disputes"}
          </div>
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {disputes.map((dispute) => (
              <DisputeCard key={dispute._id} dispute={dispute} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
