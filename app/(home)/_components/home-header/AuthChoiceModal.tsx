"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { AuthIntent, AuthRole } from "./types";

type AuthChoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAuthRole: AuthRole | null;
  intent: AuthIntent;
  onSelectRole: (role: AuthRole) => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  onCancel: () => void;
};

const intentCopy: Record<AuthIntent, string> = {
  "sign-in": "Choose whether you want to continue as a client or vendor.",
  "list-business": "Start as a vendor to list your business.",
  "post-request": "Start as a client to post your event request.",
};

const roleCardClassName = (selectedAuthRole: AuthRole | null, role: AuthRole) =>
  `group rounded-xl border p-4 text-left transition-colors ${selectedAuthRole === role
    ? "border-primary bg-primary/5"
    : "border-border hover:border-primary/40"
  }`;

export function AuthChoiceModal({
  open,
  onOpenChange,
  selectedAuthRole,
  intent,
  onSelectRole,
  onSignIn,
  onCreateAccount,
  onCancel,
}: AuthChoiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl xl:max-w-4xl md:p-10 xl:p-20">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-slate-800">
            Sign in to your account or create new account
          </DialogTitle>
          {/* <DialogDescription className="text-center">
            {intentCopy[intent]}
          </DialogDescription> */}
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 py-2">
          <button
            type="button"
            className={roleCardClassName(selectedAuthRole, "CLIENT")}
            onClick={() => onSelectRole("CLIENT")}
          >
            <div className="mb-4 flex items-center">
              <span
                className={`h-5 w-5 rounded-full border-2 ${selectedAuthRole === "CLIENT" ? "border-primary" : "border-slate-400"
                  }`}
              >
                <span
                  className={`m-auto mt-0.75 block h-2.5 w-2.5 rounded-full ${selectedAuthRole === "CLIENT" ? "bg-primary" : "bg-transparent"
                    }`}
                />
              </span>
            </div>
            <p className="text-2xl font-medium leading-tight text-slate-700">
              Sign in
              <br />
              as a <span className="font-semibold">CLIENT</span>
            </p>
            <p className="mt-4 text-base text-slate-500">
              Hire a vendor, post an event request.
            </p>
          </button>

          <button
            type="button"
            className={roleCardClassName(selectedAuthRole, "VENDOR")}
            onClick={() => onSelectRole("VENDOR")}
          >
            <div className="mb-4 flex items-center">
              <span
                className={`h-5 w-5 rounded-full border-2 ${selectedAuthRole === "VENDOR" ? "border-primary" : "border-slate-400"
                  }`}
              >
                <span
                  className={`m-auto mt-0.75 block h-2.5 w-2.5 rounded-full ${selectedAuthRole === "VENDOR" ? "bg-primary" : "bg-transparent"
                    }`}
                />
              </span>
            </div>
            <p className="text-2xl font-medium leading-tight text-slate-700">
              Sign in
              <br />
              as a <span className="font-semibold">VENDOR</span>
            </p>
            <p className="mt-4 text-base text-slate-500">
              Manage bookings, schedules, and quotes.
            </p>
          </button>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="secondary"
            className="min-w-32"
            disabled={!selectedAuthRole}
            onClick={onSignIn}
          >
            Sign In
          </Button>
          <Button
            className="min-w-36"
            disabled={!selectedAuthRole}
            onClick={onCreateAccount}
          >
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
