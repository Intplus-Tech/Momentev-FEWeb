"use client";

import { useEffect, useRef, useState } from "react";
import type {
  VendorService,
  VendorSpecialtyItem,
} from "@/types/vendor-services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import formatMoney from "@/lib/formatMoney";
import { majorToMinor, minorToMajor } from "@/lib/currency";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bulkUpdateVendorSpecialtiesPricing,
  deleteVendorSpecialty,
  createVendorSpecialty,
} from "@/lib/actions/vendor-specialties";
import { updateVendorService } from "@/lib/actions/vendor-services";
import {
  useServiceCategories,
  useServiceSpecialties,
} from "@/hooks/api/use-service-categories";
import { toast } from "sonner";
import { PermissionActionGate } from "@/components/auth/permission-gate";
import { useVendorActionGuard } from "@/hooks/use-vendor-action-guard";
import { VendorActionBlockedDialog } from "@/components/shared/vendor-action-blocked-dialog";

// use formatMoney for price formatting

const MINIMUM_BOOKING_DURATION = [
  { value: "two_hours", label: "2 hours" },
  { value: "an_hour", label: "1 hour" },
  { value: "four_hours", label: "4 hours" },
  { value: "full_day", label: "Full day" },
];

const LEAD_TIME_REQUIRED = [
  { value: "two_weeks", label: "2 Weeks" },
  { value: "a_week", label: "1 Week" },
  { value: "four_weeks", label: "4 Weeks" },
  { value: "flexible", label: "Flexible" },
];

const MAXIMUM_EVENT_SIZE = [
  { value: "unlimited", label: "Unlimited" },
  { value: "fifty_guest", label: "50 guests" },
  { value: "hundred_guest", label: "100 guests" },
  { value: "two_hundred_guest", label: "200 guests" },
];

function getUniversalSpecialtyPricing(specialties: VendorSpecialtyItem[]) {
  if (specialties.length === 0) {
    return {
      priceCharge: "custom_quotes",
      priceMinor: "0",
      priceMajor: "0",
      isMixed: false,
    };
  }

  const firstSpecialty = specialties[0];
  const isMixed = specialties.some(
    (specialty) =>
      specialty.priceCharge !== firstSpecialty.priceCharge ||
      String(specialty.price) !== String(firstSpecialty.price),
  );

  return {
    priceCharge: firstSpecialty.priceCharge || "custom_quotes",
    priceMinor: firstSpecialty.price || "0",
    priceMajor: String(minorToMajor(firstSpecialty.price || "0")),
    isMixed,
  };
}

function normalizeUniversalPricingInput(priceCharge: string, price: string) {
  if (priceCharge === "custom_quotes") {
    return {
      priceCharge,
      price: "0",
    };
  }

  return {
    priceCharge,
    price,
  };
}

export function ServiceCard({
  service,
  specialties,
  vendorId,
  expanded,
  onToggle,
  onRefreshAll,
}: {
  service: VendorService;
  specialties: VendorSpecialtyItem[];
  vendorId: string;
  expanded: boolean;
  onToggle: () => void;
  onRefreshAll: (
    updatedService?: Partial<VendorService> & { _id: string },
  ) => void;
}) {
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<string>(() =>
    expanded ? "auto" : "0px",
  );
  const servicePricing = getUniversalSpecialtyPricing(specialties);
  const { restriction, canPerformAction } = useVendorActionGuard();
  const [blockedOpen, setBlockedOpen] = useState(false);

  useEffect(() => {
    const node = contentWrapperRef.current;
    if (!node) return;

    if (expanded) {
      const scrollHeight = node.scrollHeight;
      setContainerHeight(`${scrollHeight}px`);
      const timeout = window.setTimeout(() => {
        setContainerHeight("auto");
      }, 500);
      return () => window.clearTimeout(timeout);
    }

    if (containerHeight === "auto") {
      const currentHeight = node.scrollHeight;
      setContainerHeight(`${currentHeight}px`);
      requestAnimationFrame(() => setContainerHeight("0px"));
      return;
    }

    requestAnimationFrame(() => setContainerHeight("0px"));
  }, [containerHeight, expanded]);

  return (
    <>
      <Card className="rounded-2xl border border-border bg-card p-5 transition">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`service-panel-${service._id}`}
            className="flex items-center gap-3 text-left text-lg font-semibold text-foreground transition-colors hover:text-primary"
          >
            {service.serviceCategory?.name || "Unnamed Service"}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="rounded-full">
              {(specialties?.length ?? 0).toString()} specialties
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {(service.additionalFees?.length ?? 0).toString()} fees
            </Badge>
          </div>
        </div>

        <div
          id={`service-panel-${service._id}`}
          ref={contentWrapperRef}
          style={{ height: containerHeight }}
          className="overflow-hidden transition-[height] duration-500 ease-in-out"
        >
          {/* <p className="mb-4 text-xs text-muted-foreground">
          Service ID: {service._id}
        </p> */}
          <div
            className={cn(
              "mt-2 space-y-6 rounded-2xl transition-all duration-500",
              expanded ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
            )}
          >
            <div className="flex flex-wrap gap-2 text-sm">
              {service.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full bg-slate-100 text-slate-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
                <span className="font-semibold text-foreground">Lead Time</span>
                <p className="text-muted-foreground">
                  {service.leadTimeRequired || "N/A"}
                </p>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
                <span className="font-semibold text-foreground">
                  Min Duration
                </span>
                <p className="text-muted-foreground">
                  {service.minimumBookingDuration || "N/A"}
                </p>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
                <span className="font-semibold text-foreground">
                  Max Event Size
                </span>
                <p className="text-muted-foreground">
                  {service.maximumEventSize || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
                <span className="font-semibold text-foreground">
                  Universal Pricing Model
                </span>
                <p className="text-muted-foreground capitalize">
                  {servicePricing.priceCharge}
                </p>
              </div>
              <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
                <span className="font-semibold text-foreground">
                  Universal Price
                </span>
                <p className="text-muted-foreground">
                  {formatMoney(servicePricing.priceMinor)}
                </p>
              </div>
            </div>
            {servicePricing.isMixed && (
              <p className="text-xs text-muted-foreground">
                Existing specialty pricing is mixed. Saving the service will
                normalize every specialty to the same value.
              </p>
            )}

            {/* Specialties Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Specialties</h4>
                <PermissionActionGate module="manage_services" action="write">
                  <AddSpecialtyDialog
                    disabled={Boolean(restriction)}
                    onBlocked={() => setBlockedOpen(true)}
                    vendorId={vendorId}
                    categoryId={service.serviceCategory?._id}
                    priceCharge={servicePricing.priceCharge}
                    price={servicePricing.priceMajor}
                    existingSpecialtyIds={specialties
                      .map((s) => s.serviceSpecialty?._id)
                      .filter(Boolean)}
                    onCreated={onRefreshAll}
                  />
                </PermissionActionGate>
              </div>
              {specialties.length > 0 ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        {/* <TableHead>ID</TableHead> */}
                        <TableHead>Specialty</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Pricing Model</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specialties.map((spec) => (
                        <TableRow key={spec._id}>
                          {/* <TableCell className="font-medium text-foreground text-xs">
                          {spec._id}
                        </TableCell> */}
                          <TableCell className="font-medium capitalize text-foreground">
                            {spec.serviceSpecialty?.name}
                          </TableCell>
                          <TableCell
                            className="max-w-75 truncate"
                            title={spec.serviceSpecialty?.description}
                          >
                            {spec.serviceSpecialty?.description || "-"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {spec.priceCharge}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMoney(spec.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <PermissionActionGate module="manage_services" action="write" visualIndication={false}>
                                <DeleteSpecialtyAlert
                                  disabled={Boolean(restriction)}
                                  onBlocked={() => setBlockedOpen(true)}
                                  specialty={spec}
                                  onUpdate={onRefreshAll}
                                />
                              </PermissionActionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No specialties mapped.
                </p>
              )}
            </div>

            {/* Additional Fees Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Fees</h4>
              {service.additionalFees?.length > 0 ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Fee Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {service.additionalFees.map((fee, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-foreground">
                            {fee.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {fee.feeCategory}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMoney(fee.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No additional fees configured.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <PermissionActionGate module="manage_services" action="write">
                <EditServiceDialog
                  vendorId={vendorId}
                  disabled={Boolean(restriction)}
                  onBlocked={() => setBlockedOpen(true)}
                  service={service}
                  specialties={specialties}
                  onUpdated={onRefreshAll}
                />
              </PermissionActionGate>
              {/* <DeleteServiceAlert
              serviceId={service._id}
              serviceName={service.serviceCategory?.name}
              onDeleted={onRefreshAll}
            /> */}
            </div>
          </div>
        </div>
      </Card>

      <VendorActionBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        restriction={restriction || undefined}
      />
    </>
  );
}

// ── Delete Specialty Alert ────────────────────────────────────────────

function DeleteSpecialtyAlert({
  specialty,
  onUpdate,
  disabled = false,
  onBlocked,
}: {
  specialty: VendorSpecialtyItem;
  onUpdate: () => void;
  disabled?: boolean;
  onBlocked?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteVendorSpecialty(specialty._id);
    setLoading(false);

    if (res.success) {
      toast.success(`"${specialty.serviceSpecialty?.name}" removed`);
      setOpen(false);
      onUpdate();
    } else {
      toast.error(res.error || "Failed to delete specialty");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => {
      if (next && disabled) {
        onBlocked?.();
        return;
      }
      setOpen(next);
    }}>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-red-600"
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete specialty?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <strong>{specialty.serviceSpecialty?.name}</strong> from your
            offerings. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Add Specialty Dialog ──────────────────────────────────────────────

function AddSpecialtyDialog({
  vendorId,
  categoryId,
  priceCharge,
  price,
  existingSpecialtyIds,
  onCreated,
  disabled = false,
  onBlocked,
}: {
  vendorId: string;
  categoryId: string;
  priceCharge: string;
  price: string;
  existingSpecialtyIds: string[];
  onCreated: () => void;
  disabled?: boolean;
  onBlocked?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("");

  // Fetch available specialties for this category
  const { data: specialtiesData, isLoading: isLoadingSpecialties } =
    useServiceSpecialties(open ? categoryId : null);

  const availableSpecialties = (specialtiesData?.data || []).filter(
    (spec) => !existingSpecialtyIds.includes(spec._id),
  );

  // Reset state on open
  useEffect(() => {
    if (open) {
      setSelectedSpecialtyId("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!selectedSpecialtyId) {
      toast.error("Please select a specialty");
      return;
    }
    if (disabled) {
      onBlocked?.();
      return;
    }
    setLoading(true);
    const res = await createVendorSpecialty({
      vendorId,
      serviceSpecialty: selectedSpecialtyId,
      priceCharge,
      price,
    });
    setLoading(false);
    if (res.success) {
      toast.success("Specialty added successfully");
      setOpen(false);
      onCreated();
    } else {
      toast.error(res.error || "Failed to add specialty");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (next && disabled) {
        onBlocked?.();
        return;
      }
      setOpen(next);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 rounded-full" disabled={disabled}>
          <Plus className="h-4 w-4" /> Add Specialty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Add New Specialty</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Specialty picker */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Specialty</Label>
            {isLoadingSpecialties ? (
              <div className="col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : availableSpecialties.length === 0 ? (
              <p className="col-span-3 text-sm text-muted-foreground">
                All specialties for this category have been added.
              </p>
            ) : (
              <Select
                value={selectedSpecialtyId}
                onValueChange={setSelectedSpecialtyId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a specialty" />
                </SelectTrigger>
                <SelectContent>
                  {availableSpecialties.map((spec) => (
                    <SelectItem key={spec._id} value={spec._id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            This specialty will inherit the service-wide pricing model and price.
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading || !selectedSpecialtyId}
            onClick={handleCreate}
            className="bg-[#2F6BFF] text-white hover:bg-[#1e4dcc]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              "Add Specialty"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Service Dialog ───────────────────────────────────────────────

function EditServiceDialog({
  vendorId,
  service,
  specialties,
  onUpdated,
  disabled = false,
  onBlocked,
}: {
  vendorId: string;
  service: VendorService;
  specialties: VendorSpecialtyItem[];
  onUpdated: (
    updatedService?: Partial<VendorService> & { _id: string },
  ) => void;
  disabled?: boolean;
  onBlocked?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(service.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    service.serviceCategory?._id || "",
  );
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
    () =>
      specialties
        .map((specialty) => specialty.serviceSpecialty?._id)
        .filter((id): id is string => Boolean(id)),
  );
  const [minimumBookingDuration, setMinimumBookingDuration] = useState(
    service.minimumBookingDuration || "",
  );
  const [leadTimeRequired, setLeadTimeRequired] = useState(
    service.leadTimeRequired || "",
  );
  const [maximumEventSize, setMaximumEventSize] = useState(
    service.maximumEventSize || "",
  );
  const [fees, setFees] = useState(
    service.additionalFees?.map((f) => ({
      ...f,
      price: String(minorToMajor(f.price || "0")),
    })) || [],
  );
  const [priceCharge, setPriceCharge] = useState(
    getUniversalSpecialtyPricing(specialties).priceCharge,
  );
  const [price, setPrice] = useState(
    getUniversalSpecialtyPricing(specialties).priceMajor,
  );
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useServiceCategories();
  const {
    data: categorySpecialtiesData,
    isLoading: isLoadingCategorySpecialties,
  } = useServiceSpecialties(open ? selectedCategoryId : null);
  const categories = categoriesData?.data?.data || [];
  const categorySpecialties = categorySpecialtiesData?.data || [];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTags([...(service.tags || [])]);
      setMinimumBookingDuration(service.minimumBookingDuration || "");
      setLeadTimeRequired(service.leadTimeRequired || "");
      setMaximumEventSize(service.maximumEventSize || "");
      setSelectedCategoryId(service.serviceCategory?._id || "");
      setSelectedSpecialtyIds(
        specialties
          .map((specialty) => specialty.serviceSpecialty?._id)
          .filter((id): id is string => Boolean(id)),
      );
      setFees(
        service.additionalFees?.map((f) => ({
          ...f,
          price: String(minorToMajor(f.price || "0")),
        })) || [],
      );
      setTagInput("");
      const universalPricing = getUniversalSpecialtyPricing(specialties);
      setPriceCharge(universalPricing.priceCharge);
      setPrice(universalPricing.priceMajor);
    }
  }, [
    open,
    service.tags,
    service.minimumBookingDuration,
    service.leadTimeRequired,
    service.maximumEventSize,
    service.additionalFees,
    service.serviceCategory?._id,
    specialties,
  ]);

  useEffect(() => {
    if (!open) return;
    if (selectedCategoryId !== service.serviceCategory?._id) {
      setSelectedSpecialtyIds([]);
    }
  }, [open, selectedCategoryId, service.serviceCategory?._id]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const value = tagInput.trim();
      if (!tags.includes(value)) {
        setTags((prev) => [...prev, value]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddFee = () => {
    setFees((prev) => [...prev, { name: "", price: "", feeCategory: "other" }]);
  };

  const handleRemoveFee = (index: number) => {
    setFees((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceChargeChange = (value: string) => {
    setPriceCharge(value);
    if (value === "custom_quotes") {
      setPrice("0");
    }
  };

  const handleFeeChange = (index: number, field: string, value: string) => {
    setFees((prev) =>
      prev.map((fee, i) => (i === index ? { ...fee, [field]: value } : fee)),
    );
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    setSelectedSpecialtyIds((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((id) => id !== specialtyId)
        : [...prev, specialtyId],
    );
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSpecialtyIds([]);
  };

  const handleSave = async () => {
    // Validate fees
    const validFees = fees.filter((f) => f.name.trim() && f.price);
    const categoryChanged = selectedCategoryId !== service.serviceCategory?._id;
    const currentSpecialtyIds = specialties
      .map((specialty) => specialty.serviceSpecialty?._id)
      .filter((id): id is string => Boolean(id));

    if (selectedSpecialtyIds.length === 0) {
      toast.error("Please select at least one specialty");
      return;
    }

    setLoading(true);
    const payload = {
      vendorId,
      serviceCategory: selectedCategoryId,
      tags,
      minimumBookingDuration,
      leadTimeRequired,
      maximumEventSize,
      additionalFees:
        validFees.length > 0
          ? validFees.map((fee) => ({
            ...fee,
            price: String(majorToMinor(fee.price)),
          }))
          : [],
    };

    if (disabled) {
      onBlocked?.();
      return;
    }

    const res = await updateVendorService(service._id, payload);
    if (res.success) {
      const normalizedPricing = normalizeUniversalPricingInput(
        priceCharge,
        price,
      );
      if (categoryChanged) {
        const deleteResults = await Promise.all(
          specialties.map((specialty) => deleteVendorSpecialty(specialty._id)),
        );

        if (deleteResults.some((result) => !result.success)) {
          setLoading(false);
          toast.error("Failed to replace specialties for the new category");
          return;
        }

        const createResults = await Promise.all(
          selectedSpecialtyIds.map((specialtyId) =>
            createVendorSpecialty({
              vendorId,
              serviceSpecialty: specialtyId,
              priceCharge: normalizedPricing.priceCharge,
              price: normalizedPricing.price,
            }),
          ),
        );

        if (createResults.some((result) => !result.success)) {
          setLoading(false);
          toast.error("Failed to create specialties for the new category");
          return;
        }
      } else {
        const specialtyIds = currentSpecialtyIds;
        const specialtiesToAdd = selectedSpecialtyIds.filter(
          (specialtyId) => !specialtyIds.includes(specialtyId),
        );
        const specialtiesToDelete = specialties.filter(
          (specialty) =>
            !selectedSpecialtyIds.includes(specialty.serviceSpecialty?._id || ""),
        );

        if (specialtiesToDelete.length > 0) {
          const deleteResults = await Promise.all(
            specialtiesToDelete.map((specialty) =>
              deleteVendorSpecialty(specialty._id),
            ),
          );

          if (deleteResults.some((result) => !result.success)) {
            setLoading(false);
            toast.error("Failed to update specialty selection");
            return;
          }
        }

        if (specialtiesToAdd.length > 0) {
          const addResults = await Promise.all(
            specialtiesToAdd.map((specialtyId) =>
              createVendorSpecialty({
                vendorId,
                serviceSpecialty: specialtyId,
                priceCharge: normalizedPricing.priceCharge,
                price: normalizedPricing.price,
              }),
            ),
          );

          if (addResults.some((result) => !result.success)) {
            setLoading(false);
            toast.error("Failed to update specialty selection");
            return;
          }
        }

        const pricingRes = await bulkUpdateVendorSpecialtiesPricing(
          specialties
            .filter((specialty) =>
              selectedSpecialtyIds.includes(
                specialty.serviceSpecialty?._id || "",
              ),
            )
            .map((specialty) => specialty._id),
          {
            priceCharge: normalizedPricing.priceCharge,
            price: normalizedPricing.price,
          },
        );

        if (!pricingRes.success) {
          setLoading(false);
          toast.error(pricingRes.error || "Failed to update specialty pricing");
          return;
        }
      }

      toast.success("Service configuration updated");
      setOpen(false);
      const selectedCategory = categories.find(
        (category) => category._id === selectedCategoryId,
      );
      onUpdated({
        _id: service._id,
        serviceCategory: selectedCategory
          ? {
            _id: selectedCategory._id,
            name: selectedCategory.name,
          }
          : service.serviceCategory,
        tags,
        minimumBookingDuration,
        leadTimeRequired,
        maximumEventSize,
        additionalFees: validFees.map((fee) => ({
          name: fee.name,
          price: String(majorToMinor(fee.price)),
          feeCategory: fee.feeCategory || "other",
        })),
        updatedAt: new Date().toISOString(),
      });
    } else {
      toast.error(res.error || "Failed to update service");
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => {
        if (next && disabled) {
          onBlocked?.();
          return;
        }
        setOpen(next);
      }}>
        <DialogTrigger asChild>
          <Button disabled={disabled}>Edit Service Configuration</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-140 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Configuration</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Service Details</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Service Category</Label>
                  {isLoadingCategories ? (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading categories...
                    </div>
                  ) : (
                    <Select
                      value={selectedCategoryId}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select service category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Specialties
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Select the specialties that belong to this category.
                      </p>
                    </div>
                    {selectedCategoryId !== service.serviceCategory?._id && (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Update required
                      </span>
                    )}
                  </div>

                  {isLoadingCategorySpecialties ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading specialties...
                    </div>
                  ) : categorySpecialties.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {categorySpecialties.map((specialty) => (
                        <label
                          key={specialty._id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm"
                        >
                          <Checkbox
                            checked={selectedSpecialtyIds.includes(specialty._id)}
                            onCheckedChange={() => handleSpecialtyToggle(specialty._id)}
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <div className="font-medium text-foreground">
                              {specialty.name}
                            </div>
                            {specialty.description && (
                              <div className="text-xs text-muted-foreground">
                                {specialty.description}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No specialties are available for this category.
                    </p>
                  )}

                  {selectedSpecialtyIds.length === 0 && (
                    <p className="text-xs text-amber-700">
                      At least one specialty is required.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Minimum Booking Duration</Label>
                  <Select
                    value={minimumBookingDuration}
                    onValueChange={setMinimumBookingDuration}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select minimum booking duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINIMUM_BOOKING_DURATION.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Lead Time Required</Label>
                  <Select
                    value={leadTimeRequired}
                    onValueChange={setLeadTimeRequired}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select lead time required" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_TIME_REQUIRED.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Maximum Event Size</Label>
                  <Select
                    value={maximumEventSize}
                    onValueChange={setMaximumEventSize}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select maximum event size" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAXIMUM_EVENT_SIZE.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Universal Pricing</Label>
              <p className="text-xs text-muted-foreground">
                This pricing is applied to every specialty in the service.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Pricing Model</Label>
                  <Select value={priceCharge} onValueChange={handlePriceChargeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pricing Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="package_pricing">
                        Package/Fixed Pricing
                      </SelectItem>
                      <SelectItem value="hourly_rate">
                        Hourly/Per Hour
                      </SelectItem>
                      <SelectItem value="custom_quotes">Custom Quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Price (£)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={priceCharge === "custom_quotes"}
                    placeholder={priceCharge === "custom_quotes" ? "0" : "0"}
                  />
                  {priceCharge === "custom_quotes" && (
                    <p className="text-[11px] text-muted-foreground">
                      Custom quotes do not use a fixed price.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Keywords / Tags</Label>
              <Input
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm italic text-muted-foreground">
                    No tags added
                  </p>
                )}
              </div>
            </div>

            {/* Additional Fees */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Additional Fees</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddFee}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Fee
                </Button>
              </div>

              {fees.length === 0 && (
                <p className="text-sm italic text-muted-foreground">
                  No additional fees
                </p>
              )}

              {fees.map((fee, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={fee.name}
                      onChange={(e) =>
                        handleFeeChange(idx, "name", e.target.value)
                      }
                      placeholder="e.g. Extra hour"
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    <Label className="text-xs">Price (£)</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                        £
                      </span>
                      <Input
                        type="number"
                        min="0"
                        value={fee.price}
                        onChange={(e) =>
                          handleFeeChange(idx, "price", e.target.value)
                        }
                        placeholder="0"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveFee(idx)}
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={loading}
              onClick={handleSave}
              className="bg-[#2F6BFF] text-white hover:bg-[#1e4dcc]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
