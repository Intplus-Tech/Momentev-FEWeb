import { BookingCard } from "./_components/BookingCard";
import { fetchBookings } from "@/lib/actions/booking";
import { getVendorPublicProfile } from "@/lib/actions/chat";
import { fetchServiceSpecialtyById } from "@/lib/actions/service-specialties";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function ClientBookingsPage() {
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

  const bookings = response.data.data;
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      )}
    </section>
  );
}
