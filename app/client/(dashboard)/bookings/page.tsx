import { BookingCard } from "./_components/BookingCard";
import { BookingsFilter } from "./_components/bookings-filter";
import { fetchBookings } from "@/lib/actions/booking";
import { getVendorPublicProfile } from "@/lib/actions/chat";
import { fetchServiceSpecialtyById } from "@/lib/actions/service-specialties";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function ClientBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "all";

  const response = await fetchBookings(1, 50);

  if (!response.success || !response.data) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your event bookings
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {response.error ||
              "Failed to load bookings. Please try again later."}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  let bookings = response.data.data;
  
  if (statusFilter !== "all") {
    bookings = bookings.filter((booking) => booking.status === statusFilter);
  }
  const totalBookings = response.data.total;

  // Fetch vendor details for all bookings
  const vendorDetailsMap = new Map<
    string,
    { businessName: string; rating: number }
  >();

  const uniqueVendorIds = [
    ...new Set(
      bookings.map((booking) => {
        const vendor = booking.vendorId;
        return typeof vendor === "string" ? vendor : vendor._id;
      }),
    ),
  ];

  await Promise.all(
    uniqueVendorIds.map(async (vendorId) => {
      const vendorResult = await getVendorPublicProfile(vendorId);
      if (vendorResult.success && vendorResult.data) {
        vendorDetailsMap.set(vendorId, {
          businessName:
            vendorResult.data.businessProfile?.businessName || "Unknown Vendor",
          rating: vendorResult.data.rate || 0,
        });
      }
    }),
  );

  // Fetch service specialty names
  const serviceNamesMap: Record<string, string> = {};
  const uniqueSpecialtyIds = [
    ...new Set(
      bookings
        .flatMap((b) =>
          b.budgetAllocations?.map((a) => (a.vendorSpecialtyId as any)?.serviceSpecialty) || []
        )
        .filter(Boolean)
    ),
  ];

  await Promise.all(
    uniqueSpecialtyIds.map(async (specialtyId) => {
      if (typeof specialtyId === "string") {
        const specResult = await fetchServiceSpecialtyById(specialtyId);
        if (specResult.success && specResult.data) {
          serviceNamesMap[specialtyId] = specResult.data.data.name;
        }
      }
    }),
  );

  // Separate upcoming and past bookings
  const now = new Date();
  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "completed" || booking.status === "cancelled" || booking.status === "rejected",
  );
  const upcomingBookings = bookings.filter(
    (booking) => !completedBookings.includes(booking)
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          {upcomingBookings.length} Upcoming • {completedBookings.length}{" "}
          Completed
        </p>
      </div>
      
      <BookingsFilter />

      {upcomingBookings.length > 0 && (
        <div className="space-y-4">
          <p className="text-base font-semibold text-foreground">
            Upcoming Bookings:
          </p>

          <div className="space-y-4">
            {upcomingBookings.map((booking) => {
              const vendor = booking.vendorId;
              const vendorId = typeof vendor === "string" ? vendor : vendor._id;
              const vendorDetails = vendorDetailsMap.get(vendorId);

              return (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  vendorBusinessName={vendorDetails?.businessName}
                  vendorRating={vendorDetails?.rating}
                  serviceNamesMap={serviceNamesMap}
                />
              );
            })}
          </div>
        </div>
      )}

      {completedBookings.length > 0 && (
        <div className="space-y-4">
          <p className="text-base font-semibold text-foreground">
            Past Bookings:
          </p>

          <div className="space-y-4">
            {completedBookings.map((booking) => {
              const vendor = booking.vendorId;
              const vendorId = typeof vendor === "string" ? vendor : vendor._id;
              const vendorDetails = vendorDetailsMap.get(vendorId);

              return (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  vendorBusinessName={vendorDetails?.businessName}
                  vendorRating={vendorDetails?.rating}
                  serviceNamesMap={serviceNamesMap}
                />
              );
            })}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card shadow-sm">
          <div className="h-16 w-16 bg-muted/50 text-muted-foreground flex items-center justify-center rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed text-sm">
            {statusFilter === "all"
              ? "You haven't made any bookings yet. Once you accept a quote and book a vendor, it will appear here."
              : `There are currently no bookings with the "${
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("_", " ")
                }" status.`}
          </p>
        </div>
      )}
    </section>
  );
}
