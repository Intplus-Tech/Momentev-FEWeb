import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ClientSettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Update your profile, preferences, and notification rules.
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Information vendors use when responding to requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" defaultValue="Jonas Kahnwald" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="jonas_kahnwald@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Primary city</Label>
              <Input id="location" defaultValue="Austin, Texas" />
            </div>
            <Button className="w-full sm:w-auto">Save changes</Button>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Fine-tune how you receive updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {["New responses", "Booking reminders", "Weekly digest"].map(
              (label) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {label === "Weekly digest"
                        ? "Summary email every Monday"
                        : "Push + email"}
                    </p>
                  </div>
                  <Switch defaultChecked={label !== "Weekly digest"} />
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
