"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCustomerRequests } from "@/lib/react-query/hooks/use-custom-requests";
import { RequestCard } from "./_components/RequestCard";
import { EmptyState } from "./_components/EmptyState";
import { RequestsSkeleton } from "./_components/RequestsSkeleton";

export default function ClientRequestsPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const { data, isLoading, isError } = useCustomerRequests(page, limit);

  const requests = data?.data || [];
  const total = data?.total || 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between space-y-1">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Requests</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "..." : total} Total Requests
          </p>
        </div>
        <Button asChild>
          <Link href="/client/custom-request">Create New Request</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <RequestsSkeleton />
        ) : isError ? (
          <div className="py-10 text-center text-muted-foreground">
            Failed to load requests. Please try again later.
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
