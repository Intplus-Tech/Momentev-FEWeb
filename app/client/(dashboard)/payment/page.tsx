import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoices = [
  {
    vendor: "Golden Lens Studio",
    amount: "$6,200",
    due: "Mar 28, 2026",
    status: "Processing",
  },
  {
    vendor: "Velvet & Co.",
    amount: "$12,450",
    due: "Apr 02, 2026",
    status: "Due soon",
  },
  {
    vendor: "North Bloom",
    amount: "$4,180",
    due: "Apr 12, 2026",
    status: "Paid",
  },
];

const summaries = [
  { label: "Paid this month", value: "$18.4k" },
  { label: "Outstanding", value: "$12.4k" },
  { label: "Available budget", value: "$21.6k" },
];

export default function ClientPaymentPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Track invoices, deposits, and remaining spend.
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Payments</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download report</Button>
          <Button>Log manual payment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaries.map((summary) => (
          <Card key={summary.label} className="border border-border">
            <CardHeader>
              <CardDescription>{summary.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {summary.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Upcoming and processed payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.vendor}>
                  <TableCell className="font-medium text-foreground">
                    {invoice.vendor}
                  </TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.due}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid"
                          ? "secondary"
                          : invoice.status === "Due soon"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
