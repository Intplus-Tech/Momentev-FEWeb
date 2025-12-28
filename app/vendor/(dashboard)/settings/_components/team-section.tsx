import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { TeamMember } from "../data";
import { SectionShell } from "./section-shell";

export const TeamSection = ({ members }: { members: TeamMember[] }) => {
  const [openMemberId, setOpenMemberId] = useState<string | null>(
    members[0]?.id ?? null
  );

  const primary = members[0];
  const others = members.slice(1);
  const selected =
    members.find((member) => member.id === openMemberId) ?? primary;

  const toggleMember = (id: string) => {
    setOpenMemberId((prev) => (prev === id ? null : id));
  };

  return (
    <SectionShell title="Team Member Details">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email Id</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {primary ? (
                <TableRow key={primary.id} className="bg-primary/5">
                  <TableCell className="font-medium">{primary.name}</TableCell>
                  <TableCell>{primary.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-medium",
                        primary.roleTone
                      )}
                      variant="secondary"
                    >
                      {primary.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {primary.access}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Toggle user access"
                      onClick={() => primary && toggleMember(primary.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div
          className="rounded-xl border bg-primary/5"
          key={selected?.id ?? "no-selection"}
        >
          <div className="border-b px-4 py-3 text-sm font-medium text-foreground">
            {selected
              ? `Update Access — ${selected.name}`
              : "Update User Access"}
          </div>
          <div className="space-y-4 px-4 py-5 md:px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  defaultValue={selected?.name ?? ""}
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  defaultValue={selected?.email ?? ""}
                  placeholder="Email Address"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="rounded-lg border bg-white/60">
              <div className="border-b bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground">
                Permission
              </div>
              <div className="px-4 py-3">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-foreground">
                  <span>Label</span>
                  <span className="text-center">Read</span>
                  <span className="text-center">Edit</span>
                </div>
                {["Bookings", "Payments"].map((label) => (
                  <div
                    key={label}
                    className="mt-3 grid grid-cols-3 items-center gap-2 text-sm text-foreground"
                  >
                    <span>{label}</span>
                    <div className="flex items-center justify-center">
                      <Checkbox defaultChecked aria-label={`${label} read`} />
                    </div>
                    <div className="flex items-center justify-center">
                      <Checkbox defaultChecked aria-label={`${label} edit`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 border-t px-4 py-3">
                <Button variant="ghost" type="button">
                  Back
                </Button>
                <Button type="button">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {others.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2 md:space-y-1">
                <div className="text-sm font-medium text-foreground">
                  {member.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Badge
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium",
                    member.roleTone
                  )}
                  variant="secondary"
                >
                  {member.role}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {member.access}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle user access"
                  onClick={() => toggleMember(member.id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <button className="text-sm font-medium text-primary hover:underline">
          + Add Another Member
        </button>
      </div>
    </SectionShell>
  );
};
