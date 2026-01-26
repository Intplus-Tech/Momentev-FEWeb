import { useEffect, useState, useMemo, Fragment } from "react";
import { Loader2, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type VendorPermissionInput } from "@/lib/actions/user";
import {
  useVendorStaff,
  useVendorPermissions,
  useUpdateVendorStaff,
  useDeleteVendorStaff,
} from "@/lib/react-query/hooks/use-vendor";

import { SectionShell } from "./section-shell";
import { AddMemberModal } from "./add-member-modal";

type StaffMember = {
  _id: string;
  vendorId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  permissions: {
    name: string;
    read: boolean;
    write: boolean;
  }[];
  isActive: boolean;
};

export const TeamSection = () => {
  const { data: staffList = [], isLoading: loadingStaff } = useVendorStaff();
  const { data: permissionsList = [] } = useVendorPermissions();
  const updateStaffMutation = useUpdateVendorStaff();
  const deleteStaffMutation = useDeleteVendorStaff();

  const [openMemberId, setOpenMemberId] = useState<string | null>(null);

  // State for the expanded member's edited permissions
  // string (perm name) -> { read, write }
  const [editedPermissions, setEditedPermissions] = useState<
    Record<string, { read: boolean; write: boolean }>
  >({});

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Derived state
  const selected = useMemo(
    () => staffList.find((m) => m._id === openMemberId),
    [staffList, openMemberId],
  );

  // Initialize edited permissions when selected member changes or permissions load
  useEffect(() => {
    if (selected && permissionsList.length > 0) {
      const initial: Record<string, { read: boolean; write: boolean }> = {};

      permissionsList.forEach((permName) => {
        const existing = selected.permissions.find((p) => p.name === permName);
        initial[permName] = {
          read: existing?.read || false,
          write: existing?.write || false,
        };
      });
      setEditedPermissions(initial);
    }
  }, [selected, permissionsList]);

  // Calculate if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!selected) return false;

    // Check if any permission state differs from the selected member's original state
    for (const permName of permissionsList) {
      const current = editedPermissions[permName];
      if (!current) continue;

      const original = selected.permissions.find((p) => p.name === permName);
      const originalRead = original?.read || false;
      const originalWrite = original?.write || false;

      if (current.read !== originalRead || current.write !== originalWrite) {
        return true;
      }
    }
    return false;
  }, [selected, editedPermissions, permissionsList]);

  const toggleMember = (id: string) => {
    setOpenMemberId((prev) => (prev === id ? null : id));
  };

  const handlePermissionChange = (
    permName: string,
    type: "read" | "write",
    checked: boolean,
  ) => {
    setEditedPermissions((prev) => ({
      ...prev,
      [permName]: {
        ...prev[permName],
        [type]: checked,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!selected) return;

    const permissionsPayload: VendorPermissionInput[] = Object.entries(
      editedPermissions,
    ).map(([name, access]) => ({
      name,
      read: access.read,
      write: access.write,
    }));

    try {
      await updateStaffMutation.mutateAsync({
        id: selected._id,
        data: {
          permissions: permissionsPayload,
        },
      });
      toast.success("Permissions updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update permissions");
    }
  };

  const handleDeleteMember = (member: StaffMember) => {
    if (!confirm(`Are you sure you want to remove ${member.userId.firstName}?`))
      return;
    performDelete(member._id);
  };

  const performDelete = async (id: string) => {
    try {
      await deleteStaffMutation.mutateAsync(id);
      toast.success("Team member removed");
      if (openMemberId === id) setOpenMemberId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove team member");
    }
  };

  if (loadingStaff && staffList.length === 0) {
    return (
      <SectionShell title="Team Member Details">
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Team Member Details">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email Id</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.length > 0 ? (
                staffList.map((member) => (
                  <Fragment key={member._id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        openMemberId === member._id ? "bg-muted/50" : "",
                      )}
                      onClick={() => toggleMember(member._id)}
                    >
                      <TableCell className="font-medium">
                        {member.userId.firstName} {member.userId.lastName}
                      </TableCell>
                      <TableCell>{member.userId.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.permissions.length} Permissions
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-fit">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMember(member._id);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {openMemberId === member._id
                                ? "Close Details"
                                : "Edit Permissions"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMember(member);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Accordion Row */}
                    {openMemberId === member._id && (
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={4} className="p-0 border-t">
                          <div className="p-4 md:p-6 space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">
                                Update Access — {member.userId.firstName}
                              </h4>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">
                                  Full Name
                                </label>
                                <div className="w-fit text-lg font-semibold">
                                  {`${member.userId.firstName} ${member.userId.lastName}`}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">
                                  Email Address
                                </label>
                                <div className="text-lg font normal-case">
                                  {member.userId.email}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border bg-background">
                              <div className="border-b bg-muted/40 px-4 py-3 text-sm font-semibold">
                                Permissions
                              </div>
                              <div className="px-4 py-3">
                                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground mb-4">
                                  <span>Module</span>
                                  <span className="text-center">Read</span>
                                  <span className="text-center">Edit</span>
                                </div>
                                <div className="space-y-4">
                                  {permissionsList.map((permName) => (
                                    <div
                                      key={permName}
                                      className="grid grid-cols-3 items-center gap-2 text-sm"
                                    >
                                      <span className="capitalize font-medium">
                                        {permName.replace(/_/g, " ")}
                                      </span>
                                      <div className="flex items-center justify-center">
                                        <Checkbox
                                          checked={
                                            editedPermissions[permName]?.read ||
                                            false
                                          }
                                          onCheckedChange={(c) =>
                                            handlePermissionChange(
                                              permName,
                                              "read",
                                              c as boolean,
                                            )
                                          }
                                          aria-label={`${permName} read`}
                                        />
                                      </div>
                                      <div className="flex items-center justify-center">
                                        <Checkbox
                                          checked={
                                            editedPermissions[permName]
                                              ?.write || false
                                          }
                                          onCheckedChange={(c) =>
                                            handlePermissionChange(
                                              permName,
                                              "write",
                                              c as boolean,
                                            )
                                          }
                                          aria-label={`${permName} edit`}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-3 border-t px-4 py-3 bg-muted/40">
                                <Button
                                  variant="ghost"
                                  onClick={() => setOpenMemberId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSaveChanges}
                                  disabled={
                                    !hasChanges || updateStaffMutation.isPending
                                  }
                                >
                                  {updateStaffMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-medium">
                        No team members yet
                      </span>
                      <span className="text-sm">
                        Add your first team member to get started
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <button
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => setIsAddMemberOpen(true)}
        >
          + Add Another Member
        </button>

        <AddMemberModal
          open={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          onMemberAdded={() => {
            // No manual fetch needed, react-query invalidates automatically
          }}
        />
      </div>
    </SectionShell>
  );
};
