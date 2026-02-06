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
import { type VendorPermissionInput } from "@/lib/actions/user";
import {
  useVendorPermissions,
  useAddVendorStaff,
} from "@/hooks/api/use-vendor";

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
  const { data: permissionsList = [], isLoading: loadingPermissions } =
    useVendorPermissions();
  const addStaffMutation = useAddVendorStaff();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Permissions State: Map of permission name -> { read: bool, write: bool }
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, { read: boolean; write: boolean }>
  >({});

  // Initialize selected permissions when permissions load or modal opens
  useEffect(() => {
    if (open && permissionsList.length > 0) {
      const initialstate: Record<string, { read: boolean; write: boolean }> =
        {};
      permissionsList.forEach((perm: string) => {
        initialstate[perm] = { read: false, write: false };
      });
      setSelectedPermissions(initialstate);
    }
  }, [open, permissionsList]);

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

    // Transform state to API format
    const permissionsPayload: VendorPermissionInput[] = Object.entries(
      selectedPermissions,
    )
      .filter(([_, access]) => access.read || access.write)
      .map(([name, access]) => ({
        name,
        read: access.read,
        write: access.write,
      }));

    try {
      await addStaffMutation.mutateAsync({
        firstName,
        lastName,
        email,
        permissions: permissionsPayload,
        isActive: true,
      });

      toast.success("Team member added successfully");
      onOpenChange(false);

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");

      // Reset permissions
      const initialstate: Record<string, { read: boolean; write: boolean }> =
        {};
      permissionsList.forEach((perm: string) => {
        initialstate[perm] = { read: false, write: false };
      });
      setSelectedPermissions(initialstate);

      onMemberAdded?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add team member",
      );
    }
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

              {loadingPermissions ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {permissionsList.map((permission: string) => (
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
            <Button
              type="submit"
              disabled={addStaffMutation.isPending || loadingPermissions}
            >
              {addStaffMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
