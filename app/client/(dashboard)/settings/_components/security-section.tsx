import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

import { SectionShell } from "./section-shell";

export const SecuritySection = () => {
  return (
    <SectionShell title="Change Password">
      <form className="space-y-4">
        <FloatingLabelInput
          label="Email Address"
          type="email"
          autoComplete="email"
        />
        <FloatingLabelInput
          label="Old Password"
          type="password"
          autoComplete="current-password"
        />
        <FloatingLabelInput
          label="New Password"
          type="password"
          autoComplete="new-password"
        />
        <FloatingLabelInput
          label="Re-Enter New Password"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" className="px-6">
          Update
        </Button>
      </form>
    </SectionShell>
  );
};
