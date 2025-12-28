import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { BankAccountDetails } from "../data";
import { Calendar, Dot, Landmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BankAccountCardProps {
  details: BankAccountDetails;
}

export function BankAccountCard({ details }: BankAccountCardProps) {
  return (
    <Card className="rounded-3xl border bg-white p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-3">
          <Button className="w-full md:w-fit">
            <Calendar />
            Payout Schedule
          </Button>
          <Button className="w-full md:w-fit" variant="outline">
            <Landmark />
            Update Bank Details
          </Button>
          <Separator
            className="h-20 ml-6  hidden md:block"
            orientation="vertical"
          />
        </div>
        <div className="text-center md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Bank Account Details
          </p>
          <p className="text-base font-semibold text-foreground">
            Account: {details.account} · {details.bank}
          </p>
          <p className="text-sm text-muted-foreground">
            Last payout: {details.lastPayout}
          </p>
          <p className="text-sm text-muted-foreground">
            Account Holder: {details.owner}
          </p>
          <div className="flex items-center justify-end text-xs font-semibold">
            <Button variant={"link"} size={"sm"} className="text-xs">
              Update Bank Details
            </Button>
            <Dot className="text-primary" />
            <Button variant={"link"} size={"sm"} className="text-xs">
              Add Backup Account
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
