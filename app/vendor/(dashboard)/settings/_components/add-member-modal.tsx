"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getVendorPermissions,
  addVendorStaff,
  type VendorPermissionInput,
} from "@/lib/actions/user";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded?: () => void;
}

export function AddMemberModal({
  open,
  onOpenChange,
  onMemberAdded,
}: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permissionsList, setPermissionsList] = useState<string[]>([]);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Permissions State: Map of permission name -> { read: bool, write: bool }
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, { read: boolean; write: boolean }>
  >({});

  // Fetch permissions when modal opens
  useEffect(() => {
    if (open && permissionsList.length === 0) {
      const fetchPermissions = async () => {
        setLoading(true);
        const res = await getVendorPermissions();
        if (res.success && res.data) {
          setPermissionsList(res.data);
          // Initialize selected permissions state
          const initialstate: Record<
            string,
            { read: boolean; write: boolean }
          > = {};
          res.data.forEach((perm: string) => {
            initialstate[perm] = { read: false, write: false };
          });
          setSelectedPermissions(initialstate);
        } else {
          toast.error(res.error || "Failed to load permissions");
        }
        setLoading(false);
      };
      fetchPermissions();
    }
  }, [open, permissionsList.length]);

  const handlePermissionChange = (
    name: string,
    type: "read" | "write",
    checked: boolean,
  ) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [type]: checked,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    // Transform state to API format
    const permissionsPayload: VendorPermissionInput[] = Object.entries(
      selectedPermissions,
    )
      .filter(([_, access]) => access.read || access.write) // Only include if at least one is checked? Or include all?
      // API likely expects all or just active ones. Assuming just active or explicitly set ones.
      // Based on screenshot, seems like we define read/write for each.
      .map(([name, access]) => ({
        name,
        read: access.read,
        write: access.write,
      }));

    const result = await addVendorStaff({
      firstName,
      lastName,
      email,
      permissions: permissionsPayload,
      isActive: true,
    });

    if (result.success) {
      toast.success("Team member added successfully");
      onOpenChange(false);
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      // Reset permissions
      const initialstate: Record<string, { read: boolean; write: boolean }> =
        {};
      permissionsList.forEach((perm) => {
        initialstate[perm] = { read: false, write: false };
      });
      setSelectedPermissions(initialstate);

      onMemberAdded?.();
    } else {
      toast.error(result.error || "Failed to add team member");
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="first-name"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  id="last-name"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30">
            <div className="border-b bg-muted/50 px-4 py-3 text-sm font-semibold">
              Permission
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-3">
                <span>Label</span>
                <span className="text-center">Read</span>
                <span className="text-center">Edit</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {permissionsList.map((permission) => (
                    <div
                      key={permission}
                      className="grid grid-cols-3 items-center gap-2 text-sm"
                    >
                      <span className="capitalize">
                        {permission.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={
                            selectedPermissions[permission]?.read || false
                          }
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission,
                              "read",
                              checked as boolean,
                            )
                          }
                          aria-label={`${permission} read`}
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={
                            selectedPermissions[permission]?.write || false
                          }
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission,
                              "write",
                              checked as boolean,
                            )
                          }
                          aria-label={`${permission} edit`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Back
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
