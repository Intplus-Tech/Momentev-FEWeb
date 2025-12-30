import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { COMPARISON_QUOTES } from "../_data";

export default function CompareRequestsPage() {
  return (
    <section className="space-y-6">
      <Link
        href="/client/requests"
        className="flex w-fit items-center gap-1 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Compare Quotes
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Vintage Film Photography Request
        </h1>
        <p className="text-sm text-muted-foreground">
          Review pricing, experience, and included extras to pick the vendor
          that best matches your event.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COMPARISON_QUOTES.map((quote) => (
          <Card
            key={quote.vendor}
            className="border border-border/70 shadow-sm"
          >
            <CardContent className="space-y-6 p-6">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {quote.vendor}
                </p>
                <p className="text-3xl font-semibold text-foreground">
                  {quote.amount}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                    {quote.rating.toFixed(1)}
                  </span>
                  <span>• {quote.reviews} reviews</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {quote.experience}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Include</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {quote.specs.map((spec) => (
                    <li
                      key={spec.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span>{spec.label}:</span>
                      <span className="font-medium text-foreground">
                        {spec.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Extra</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {quote.extras.map((extra) => (
                    <li
                      key={extra.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span>{extra.label}</span>
                      <span className="font-medium text-foreground">
                        {extra.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full">Select</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
