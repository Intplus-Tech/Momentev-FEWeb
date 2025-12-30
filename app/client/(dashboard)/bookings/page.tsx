import { BookingCard, BookingCardData } from "./_components/BookingCard";

const bookings: BookingCardData[] = [
  {
    id: "sarah-james",
    title: "Sarah & James Wedding",
    details: [
      { label: "Vendor", value: "Elegant Weddings Photography" },
      { label: "Amount", value: "£1,830" },
    ],
    eventInfo: {
      date: "Sat, 15 Jul 2025 (12 days)",
      service: "Weddings Photography",
      status: "Balance due tomorrow",
      tone: "warning",
    },
    timeline: ["Balance due Oct 27", "Event: Oct 28", "Photo delivery: Nov 1"],
    primaryAction: "Pay Balance",
    secondaryActions: ["Message Vendor", "View Details"],
  },
  {
    id: "office-party",
    title: "Office Christmas Party",
    details: [
      { label: "Vendors", value: "5" },
      { label: "Amount", value: "£5,000" },
    ],
    eventInfo: {
      date: "December 15, 2024 (49 days)",
      service: "Corporate Catering",
      status: "Deposit paid",
      tone: "success",
    },
    timeline: ["Deposit Paid", "Event: Dec 15", "Balance due tomorrow"],
    primaryAction: "Finalize Booking",
    secondaryActions: ["Message Vendor", "View Details"],
  },
];

export default function ClientBookingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Booking</h1>
        <p className="text-sm text-muted-foreground">
          2 Upcoming • 5 Completed
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-foreground">
          Upcoming Bookings:
        </p>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </div>
    </section>
  );
}
