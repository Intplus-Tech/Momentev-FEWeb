import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const requests = [
  {
    title: "Welcome dinner caterer",
    budget: "$9k",
    responses: 5,
    updated: "2h ago",
    status: "Comparing",
  },
  {
    title: "Luxury transportation",
    budget: "$6k",
    responses: 1,
    updated: "4h ago",
    status: "Pending",
  },
  {
    title: "After-party lighting",
    budget: "$4.5k",
    responses: 3,
    updated: "Yesterday",
    status: "In review",
  },
];

export default function ClientRequestsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Keep an eye on vendor proposals and budgets in-flight.
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Requests</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Duplicate last</Button>
          <Button>Create request</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <Card key={request.title} className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">{request.title}</CardTitle>
              <CardDescription>Updated {request.updated}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Budget</span>
                <span className="font-medium text-foreground">
                  {request.budget}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Responses</span>
                <span className="font-medium text-foreground">
                  {request.responses}
                </span>
              </div>
              <Badge variant="outline" className="w-fit">
                {request.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
