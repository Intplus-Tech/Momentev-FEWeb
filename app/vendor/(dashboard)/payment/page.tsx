import { StripeConnectCard } from "./_components/stripe-connect-card";
import { PaymentContent } from "./_components/payment-content";

export default function VendorPaymentPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Track your earnings and expenses
        </p>
      </div>

      <StripeConnectCard />
      <PaymentContent />
    </section>
  );
}
