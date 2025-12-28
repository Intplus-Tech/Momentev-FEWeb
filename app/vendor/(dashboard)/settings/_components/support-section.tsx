import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { SupportPrefill } from "../types";
import { Field } from "./field";
import { SectionShell } from "./section-shell";

export const SupportSection = ({ prefill }: { prefill: SupportPrefill }) => {
  return (
    <SectionShell title="Contact Information">
      <div className="space-y-4">
        <Field label="Name">
          <Input defaultValue={prefill.name} />
        </Field>
        <Field label="Email Address">
          <Input type="email" defaultValue={prefill.email} />
        </Field>
        <Field label="Message">
          <Textarea rows={5} placeholder="Let us know how we can help" />
        </Field>

        <div className="flex items-center justify-between">
          <Button variant="ghost" className="px-3 text-muted-foreground">
            Back
          </Button>
          <Button className="px-6">Submit</Button>
        </div>
      </div>
    </SectionShell>
  );
};
