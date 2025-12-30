import { bookings, heroContent, reviews, schedule, stats } from "./data";
import { BookingsPanel } from "./_components/bookings-panel";
import { HeroSection } from "./_components/hero-section";
import { ReviewsPanel } from "./_components/reviews-panel";
import { ScheduleCard } from "./_components/schedule-card";
import { StatsGrid } from "./_components/stats-grid";

const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <HeroSection {...heroContent} />
      <StatsGrid stats={stats} />
      <div className="grid gap-4 lg:grid-cols-3">
        <BookingsPanel bookings={bookings} />
        <ScheduleCard schedule={schedule} />
      </div>
      <ReviewsPanel reviews={reviews} />
    </section>
  );
};

export default DashboardPage;
