import { bookingStats, confirmedBookings, scheduleEntries } from "./data";
import { BookingStats } from "./_components/booking-stats";
import { ConfirmedBookingsTable } from "./_components/confirmed-bookings-table";
import { TodaysSchedule } from "./_components/todays-schedule";

export default function VendorBookingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Manage all your appointments in one place
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>
      </div>

      <BookingStats stats={bookingStats} />

      <TodaysSchedule entries={scheduleEntries} />

      <ConfirmedBookingsTable bookings={confirmedBookings} />
    </section>
  );
}
