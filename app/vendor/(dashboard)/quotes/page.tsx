import { Metadata } from "next";
import { QuotesDashboard } from "./_components/quotes-dashboard";

export const metadata: Metadata = {
  title: "My Quotes | Momentev",
  description: "Manage your submitted quotes",
};

export default function VendorQuotesPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-gray-100 bg-white px-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Quotes</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">Track and manage your submitted quotes.</p>
        </div>
      </header>

        <QuotesDashboard />
    </div>
  );
}
