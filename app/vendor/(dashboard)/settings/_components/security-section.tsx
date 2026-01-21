"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { DeleteAccountModal } from "@/components/shared/delete-account-modal";

import { SectionShell } from "./section-shell";

export const SecuritySection = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
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

      <SectionShell title="Danger Zone">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </SectionShell>

      <DeleteAccountModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </>
  );
};
