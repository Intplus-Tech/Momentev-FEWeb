import type { LucideIcon } from "lucide-react";

// Stat card shape used by StatsGrid
export type DashboardStat = {
  title: string;
  value: string;
  change: string;
  accent: string;
  icon: LucideIcon;
};
