import type { UpcomingPayout } from "../data";

interface UpcomingPayoutsCardProps {
  payouts: UpcomingPayout[];
}

export function UpcomingPayoutsCard({ payouts }: UpcomingPayoutsCardProps) {
  return (
    <div className="rounded-3xl border bg-white p-2">
      <ul className="">
        {payouts.map((payout, index) => (
          <li
            key={payout.label}
            className="flex items-center justify-between  border-b last:border-0 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-semibold text-[#2F6BFF]">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {payout.label}
                </p>
                <p className="text-xs text-muted-foreground">{payout.date}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {payout.amount}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
