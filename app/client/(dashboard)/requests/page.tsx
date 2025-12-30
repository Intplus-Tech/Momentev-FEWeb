import { REQUESTS } from "./_data";
import { RequestCard } from "./_components/RequestCard";

export default function ClientRequestsPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">Request</h1>
        <p className="text-sm text-muted-foreground">
          {REQUESTS.length} Active
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-foreground">
          Active Request
        </p>

        <div className="space-y-4">
          {REQUESTS.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </section>
  );
}
