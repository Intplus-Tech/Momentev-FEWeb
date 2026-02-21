import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ScheduleBlock = {
  id: string;
  title: string;
  detail: string;
  category: "Consultation" | "Production" | "Delivery";
  start: string;
  end: string;
};


const categoryColors: Record<ScheduleBlock["category"], string> = {
  Consultation: "bg-sky-50 text-sky-700",
  Production: "bg-violet-50 text-violet-700",
  Delivery: "bg-amber-50 text-amber-700",
};

export const SchedulePanel = ({ blocks }: { blocks: ScheduleBlock[] }) => {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Stay on top of key handoffs</CardDescription>
        </div>
        <Button variant="ghost" size="icon-sm">
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="rounded-2xl border border-border bg-muted/40 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {block.title}
                </p>
                <p className="text-xs text-muted-foreground">{block.detail}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  categoryColors[block.category]
                }`}
              >
                {block.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-primary">
              {block.start} - {block.end}
            </p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full justify-between">
          View full calendar
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
