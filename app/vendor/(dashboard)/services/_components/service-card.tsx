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
import {
  ChevronDown,
  ChevronUp,
  Edit2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateVendorSpecialty,
  deleteVendorSpecialty,
  createVendorSpecialty,
} from "@/lib/actions/vendor-specialties";
import {
  updateVendorService,
  deleteVendorService,
} from "@/lib/actions/vendor-services";
import { useServiceSpecialties } from "@/hooks/api/use-service-categories";
import { toast } from "sonner";

const formatCurrency = (value: number | string) => {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
};

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

          {/* Specialties Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Specialties</h4>
              <AddSpecialtyDialog
                vendorId={vendorId}
                categoryId={service.serviceCategory?._id}
                existingSpecialtyIds={specialties
                  .map((s) => s.serviceSpecialty?._id)
                  .filter(Boolean)}
                onCreated={onRefreshAll}
              />
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
                        <TableCell className="font-medium text-foreground">
                          {spec.serviceSpecialty?.name}
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate"
                          title={spec.serviceSpecialty?.description}
                        >
                          {spec.serviceSpecialty?.description || "-"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {spec.priceCharge}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(spec.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditSpecialtyDialog
                              specialty={spec}
                              onUpdate={onRefreshAll}
                            />
                            <DeleteSpecialtyAlert
                              specialty={spec}
                              onUpdate={onRefreshAll}
                            />
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
                          {formatCurrency(fee.price)}
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
            <EditServiceDialog service={service} onUpdated={onRefreshAll} />
            {/* <DeleteServiceAlert
              serviceId={service._id}
              serviceName={service.serviceCategory?.name}
              onDeleted={onRefreshAll}
            /> */}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Edit Specialty Dialog ──────────────────────────────────────────────

function EditSpecialtyDialog({
  specialty,
  onUpdate,
}: {
  specialty: VendorSpecialtyItem;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<string | number>(specialty.price);
  const [priceCharge, setPriceCharge] = useState(specialty.priceCharge);

  useEffect(() => {
    if (priceCharge === "custom_quotes") {
      setPrice("0");
    }
  }, [priceCharge]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPrice(specialty.price);
      setPriceCharge(specialty.priceCharge);
    }
  }, [open, specialty.price, specialty.priceCharge]);

  const handleSave = async () => {
    setLoading(true);
    const res = await updateVendorSpecialty(specialty._id, {
      price,
      priceCharge,
    });
    setLoading(false);
    if (res.success) {
      toast.success("Specialty pricing updated");
      setOpen(false);
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update specialty");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-blue-600"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="border-b border-black">
          <DialogTitle className="text-lg font-semibold p-4">
            Edit {specialty.serviceSpecialty?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 p-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">
              Price (£)
            </Label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceCharge === "custom_quotes"}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-model" className="text-right">
              Model
            </Label>
            <Select value={priceCharge} onValueChange={setPriceCharge}>
              <SelectTrigger className="col-span-3 w-full" id="edit-model">
                <SelectValue placeholder="Pricing Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="package_pricing">
                  Package/Fixed Pricing
                </SelectItem>
                <SelectItem value="hourly_rate">Hourly/Per Hour</SelectItem>
                <SelectItem value="custom_quotes">Custom Quote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="p-4">
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
  );
}

// ── Delete Specialty Alert ────────────────────────────────────────────

function DeleteSpecialtyAlert({
  specialty,
  onUpdate,
}: {
  specialty: VendorSpecialtyItem;
  onUpdate: () => void;
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-red-600"
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
  existingSpecialtyIds,
  onCreated,
}: {
  vendorId: string;
  categoryId: string;
  existingSpecialtyIds: string[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("");
  const [priceCharge, setPriceCharge] = useState("custom_quotes");
  const [price, setPrice] = useState("0");

  // Fetch available specialties for this category
  const { data: specialtiesData, isLoading: isLoadingSpecialties } =
    useServiceSpecialties(open ? categoryId : null);

  const availableSpecialties = (specialtiesData?.data || []).filter(
    (spec) => !existingSpecialtyIds.includes(spec._id),
  );

  useEffect(() => {
    if (priceCharge === "custom_quotes") {
      setPrice("0");
    }
  }, [priceCharge]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setSelectedSpecialtyId("");
      setPriceCharge("custom_quotes");
      setPrice("0");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!selectedSpecialtyId) {
      toast.error("Please select a specialty");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 rounded-full">
          <Plus className="h-4 w-4" /> Add Specialty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
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

          {/* Pricing model */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Model</Label>
            <Select value={priceCharge} onValueChange={setPriceCharge}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pricing Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="package_pricing">
                  Package/Fixed Pricing
                </SelectItem>
                <SelectItem value="hourly_rate">Hourly/Per Hour</SelectItem>
                <SelectItem value="custom_quotes">Custom Quote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Price (£)</Label>
            <Input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceCharge === "custom_quotes"}
              className="col-span-3"
            />
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
  service,
  onUpdated,
}: {
  service: VendorService;
  onUpdated: (
    updatedService?: Partial<VendorService> & { _id: string },
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(service.tags || []);
  const [tagInput, setTagInput] = useState("");
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
    service.additionalFees?.map((f) => ({ ...f })) || [],
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTags([...(service.tags || [])]);
      setMinimumBookingDuration(service.minimumBookingDuration || "");
      setLeadTimeRequired(service.leadTimeRequired || "");
      setMaximumEventSize(service.maximumEventSize || "");
      setFees(service.additionalFees?.map((f) => ({ ...f })) || []);
      setTagInput("");
    }
  }, [
    open,
    service.tags,
    service.minimumBookingDuration,
    service.leadTimeRequired,
    service.maximumEventSize,
    service.additionalFees,
  ]);

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

  const handleFeeChange = (index: number, field: string, value: string) => {
    setFees((prev) =>
      prev.map((fee, i) => (i === index ? { ...fee, [field]: value } : fee)),
    );
  };

  const handleSave = async () => {
    // Validate fees
    const validFees = fees.filter((f) => f.name.trim() && f.price);
    setLoading(true);
    const payload = {
      tags,
      minimumBookingDuration,
      leadTimeRequired,
      maximumEventSize,
      additionalFees: validFees.length > 0 ? validFees : [],
    };

    const res = await updateVendorService(service._id, payload);
    console.info("[EditServiceDialog] updateVendorService response", {
      serviceId: service._id,
      payload,
      success: res.success,
      error: res.error,
      responseTags: (res as any)?.data?.tags,
      responseMinimumBookingDuration: (res as any)?.data
        ?.minimumBookingDuration,
      responseLeadTimeRequired: (res as any)?.data?.leadTimeRequired,
      responseMaximumEventSize: (res as any)?.data?.maximumEventSize,
      responseFees: (res as any)?.data?.additionalFees,
      data: (res as any).data,
    });

    setLoading(false);
    if (res.success) {
      toast.success("Service configuration updated");
      setOpen(false);
      onUpdated({
        _id: service._id,
        tags,
        minimumBookingDuration,
        leadTimeRequired,
        maximumEventSize,
        additionalFees: validFees.map((fee) => ({
          name: fee.name,
          price: fee.price,
          feeCategory: fee.feeCategory || "other",
        })),
        updatedAt: new Date().toISOString(),
      });
    } else {
      toast.error(res.error || "Failed to update service");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit Service Configuration</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Service Details</Label>
            <div className="grid grid-cols-1 gap-3">
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
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
              <p className="text-sm text-muted-foreground italic">
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
                  <Input
                    type="number"
                    min="0"
                    value={fee.price}
                    onChange={(e) =>
                      handleFeeChange(idx, "price", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveFee(idx)}
                  className="h-9 w-9 text-muted-foreground hover:text-red-600 shrink-0"
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
  );
}

// ── Delete Service Alert ──────────────────────────────────────────────

function DeleteServiceAlert({
  serviceId,
  serviceName,
  onDeleted,
}: {
  serviceId: string;
  serviceName?: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteVendorService(serviceId);
    setLoading(false);
    if (res.success) {
      toast.success("Service deleted");
      setOpen(false);
      onDeleted();
    } else {
      toast.error(res.error || "Failed to delete service");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-red-200 text-red-500 hover:bg-red-50"
        >
          Delete Configuration
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete service configuration?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your{" "}
            <strong>{serviceName || "service"}</strong> configuration and all
            associated specialties. This action cannot be undone.
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
