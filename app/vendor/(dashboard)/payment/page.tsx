import { StripeConnectCard } from "./_components/stripe-connect-card";
import { PaymentContent } from "./_components/payment-content";
import { PaymentModelCard } from "./_components/payment-model-card";

export default function VendorPaymentPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Track your earnings and expenses
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <StripeConnectCard />
      </div>

      <PaymentContent />
    </section>
  );
}
