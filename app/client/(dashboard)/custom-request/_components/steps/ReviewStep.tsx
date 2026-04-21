"use client";

import { useCustomRequestStore } from "../../_store/customRequestStore";

export function ReviewStep() {
  const eventBasic = useCustomRequestStore((state) => state.eventBasic);
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const budgetPlanning = useCustomRequestStore((state) => state.budgetPlanning);
  const additionalDetails = useCustomRequestStore(
    (state) => state.additionalDetails,
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSameCalendarDay = (left: string, right: string) => {
    return new Date(left).toDateString() === new Date(right).toDateString();
  };

  const calculatePercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((amount / total) * 100);
  };

  const uploadedFiles = additionalDetails?.uploadedFiles || [];

  return (
    <div className="space-y-6">
      {/* Event Summary Card */}
      {eventBasic && (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background shadow-sm">
          <div className="bg-linear-to-r from-primary/10 to-transparent p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{eventBasic.eventName}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(eventBasic.eventDate)}
                  {eventBasic.endDate &&
                    !isSameCalendarDay(eventBasic.eventDate, eventBasic.endDate) &&
                    ` - ${formatDate(eventBasic.endDate)}`} •{" "}
                  {eventBasic.guestCount} guests
                </p>
                <p className="text-sm text-muted-foreground">
                  {eventBasic.location}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Review ready
              </div>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-t p-4 md:border-r md:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                Event Details
              </p>
              <p className="text-sm leading-6 text-foreground/90">
                {eventBasic.eventDescription}
              </p>
            </div>

            <div className="border-t p-4 md:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                Visual Inspiration
              </p>
              {uploadedFiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={file._id}
                      className="overflow-hidden rounded-xl border border-border bg-muted/30"
                    >
                      <div className="aspect-4/3 bg-muted">
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium">
                          Image {index + 1}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {file.originalName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground">
                  No inspiration images added.
                </div>
              )}
            </div>
          </div>

          {/* Vendors Needed */}
          {vendorNeeds && vendorNeeds.selectedCategory && (
            <div className="border-t p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                    Selected Category
                  </p>
                  <p className="text-sm font-medium">{vendorNeeds.selectedCategory.name}</p>
                </div>

                {vendorNeeds.selectedSpecialties.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                      Services Needed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {vendorNeeds.selectedSpecialties.map((specialty) => (
                        <span
                          key={specialty._id}
                          className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budget Allocation */}
          {budgetPlanning && budgetPlanning.totalBudget > 0 && (
            <div className="border-t p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Budget Allocation: £
                {budgetPlanning.totalBudget.toLocaleString()}
              </p>
              <div className="space-y-2">
                {vendorNeeds?.selectedSpecialties.map((specialty) => {
                  const amount =
                    budgetPlanning.budgetPerSpecialty[specialty._id] || 0;
                  return amount > 0 ? (
                    <div
                      key={specialty._id}
                      className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span>{specialty.name}</span>
                      <span className="font-medium">
                        £{amount.toLocaleString()} (
                        {calculatePercentage(amount, budgetPlanning.totalBudget)}%)
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
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
