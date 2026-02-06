"use client";

import { useCustomRequestStore } from "../../_store/customRequestStore";

export function ReviewStep() {
  const eventBasic = useCustomRequestStore((state) => state.eventBasic);
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const budgetPlanning = useCustomRequestStore((state) => state.budgetPlanning);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculatePercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((amount / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Event Summary Card */}
      {eventBasic && (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <div className="bg-primary/5 p-4 space-y-1">
            <h3 className="font-semibold text-lg">{eventBasic.eventName}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(eventBasic.eventDate)} • {eventBasic.eventStartTime}-
              {eventBasic.eventEndTime} • {eventBasic.guestCount} guests
            </p>
            <p className="text-sm text-muted-foreground">
              {eventBasic.location}
            </p>
          </div>

          {/* Vendors Needed */}
          {vendorNeeds && vendorNeeds.selectedCategories?.length > 0 && (
            <div className="p-4 border-t">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                Vendors Needed:
              </p>
              <ul className="space-y-1">
                {vendorNeeds.selectedCategories.map((category) => {
                  const requirement =
                    vendorNeeds.specificRequirements?.[category];
                  return (
                    <li key={category} className="text-sm">
                      • {category}
                      {requirement && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({requirement})
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Budget Allocation */}
          {budgetPlanning && budgetPlanning.totalBudget > 0 && (
            <div className="p-4 border-t">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                Budget Allocation: £
                {budgetPlanning.totalBudget.toLocaleString()}
              </p>
              <ul className="space-y-1">
                {Object.entries(budgetPlanning.budgetPerVendor).map(
                  ([category, amount]) =>
                    amount > 0 && (
                      <li key={category} className="text-sm">
                        • {category}: £{amount.toLocaleString()} (
                        {calculatePercentage(
                          amount,
                          budgetPlanning.totalBudget,
                        )}
                        %)
                      </li>
                    ),
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!eventBasic && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No event details to review. Please complete the previous steps.</p>
        </div>
      )}
    </div>
  );
}
