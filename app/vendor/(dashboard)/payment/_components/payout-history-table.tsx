import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PayoutHistoryRow } from "../data";

interface PayoutHistoryTableProps {
  rows: PayoutHistoryRow[];
}

export function PayoutHistoryTable({ rows }: PayoutHistoryTableProps) {
  return (
    <Card className="rounded-3xl border p-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Payout History</p>
        <p className="text-xs text-foreground">(Last 30 days)</p>
      </div>
      <div className="border rounded-md">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payout ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Bank Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.payoutId}-${row.date}`} className="text-sm">
                <TableCell className="font-medium text-foreground">
                  {row.date}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.payoutId}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {row.amount}
                </TableCell>
                <TableCell>
                  <Badge className="flex items-center gap-1 rounded-full bg-[#E6F7F1] text-[#078B54]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.bankAccount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
