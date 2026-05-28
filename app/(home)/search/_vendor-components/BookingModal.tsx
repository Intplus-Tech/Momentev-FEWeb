"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Minus, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import formatMoney from "@/lib/formatMoney";

import {
  createUnifiedBookingSchema,
  type CreateUnifiedBookingFormValues,
} from "@/validation/booking";
import { useCreateUnifiedBooking } from "@/hooks/api/use-booking";
import type {
  VendorSpecialtyItem,
  VendorServiceCategory,
} from "@/types/vendor-services";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
  serviceCategories?: VendorServiceCategory[];
  specialties: VendorSpecialtyItem[] | undefined;
  vendorLeadTimeRequired?: string;
}

const LEAD_TIME_TO_DAYS: Record<string, number> = {
  flexible: 0,
  a_week: 7,
  one_week: 7,
  two_weeks: 14,
  four_weeks: 28,
};

const LEAD_TIME_LABELS: Record<string, string> = {
  flexible: "Flexible",
  a_week: "1 week",
  one_week: "1 week",
  two_weeks: "2 weeks",
  four_weeks: "4 weeks",
};

const PRICING_TYPE_OPTIONS = [
  {
    value: "hourly_rate",
    label: "Hourly rate",
    description: "Estimate total hours; final price adjusts by actual hours.",
  },
  {
    value: "package_pricing",
    label: "Package pricing",
    description: "Choose a specialty package with a fixed scope.",
  },
  {
    value: "custom_quotes",
    label: "Custom quote",
    description: "Provide a budget and receive a tailored invoice.",
  },
] as const;

const PRICING_TYPE_LABELS: Record<string, string> = {
  hourly_rate: "Hourly Rate",
  package_pricing: "Fixed Package",
  custom_quotes: "Custom Quote",
};

type PricingType = CreateUnifiedBookingFormValues["pricingType"];

const PRICING_TYPE_SET = new Set<PricingType>(
  PRICING_TYPE_OPTIONS.map((option) => option.value),
);

const isPricingType = (value: string): value is PricingType =>
  PRICING_TYPE_SET.has(value as PricingType);

function LabeledFormLabel({
  children,
  optional = false,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <FormLabel className="flex items-center gap-2">
      <span>{children}</span>
      <span
        className={cn(
          "text-[11px] font-medium uppercase tracking-wide",
          optional ? "text-muted-foreground" : "text-destructive",
        )}
      >
        {optional ? "(Optional)" : "*"}
      </span>
    </FormLabel>
  );
}

function findFirstErrorPath(
  errors: Record<string, unknown>,
  prefix = "",
): string | null {
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (!value) {
      continue;
    }

    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !("message" in value)
    ) {
      const nestedPath = findFirstErrorPath(value as Record<string, unknown>, path);
      if (nestedPath) {
        return nestedPath;
      }
      continue;
    }

    return path;
  }

  return null;
}

const getStartOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const getMinimumBookingDate = (leadTimeRequired?: string) => {
  const leadTimeDays = leadTimeRequired ? LEAD_TIME_TO_DAYS[leadTimeRequired] : 0;

  if (!leadTimeDays) {
    return undefined;
  }

  const minimumDate = getStartOfDay(new Date());
  minimumDate.setDate(minimumDate.getDate() + leadTimeDays);
  return minimumDate;
};

const formatLeadTimeLabel = (leadTimeRequired?: string) => {
  if (!leadTimeRequired) {
    return null;
  }

  return LEAD_TIME_LABELS[leadTimeRequired] ?? leadTimeRequired.replace(/_/g, " ");
};

const getUniquePricingTypes = (specialties: VendorSpecialtyItem[]) => {
  const uniquePricingTypes = new Set<PricingType>();

  for (const specialty of specialties) {
    if (isPricingType(specialty.priceCharge)) {
      uniquePricingTypes.add(specialty.priceCharge);
    }
  }

  return Array.from(uniquePricingTypes);
};

export function BookingModal({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  serviceCategories = [],
  specialties = [],
  vendorLeadTimeRequired,
}: BookingModalProps) {
  const router = useRouter();
  const createBookingMutation = useCreateUnifiedBooking();
  const uniquePricingTypes = React.useMemo(
    () => getUniquePricingTypes(specialties),
    [specialties],
  );
  const singlePricingType: PricingType | null =
    uniquePricingTypes.length === 1 ? uniquePricingTypes[0] : null;
  const pricingTypeLocked = singlePricingType !== null;
  const defaultPricingType: PricingType = singlePricingType ?? "package_pricing";
  const minimumBookingDate = React.useMemo(
    () => getMinimumBookingDate(vendorLeadTimeRequired),
    [vendorLeadTimeRequired],
  );
  const bookingSchema = React.useMemo(
    () => createUnifiedBookingSchema(minimumBookingDate),
    [minimumBookingDate],
  );

  const defaultServiceCategoryId = serviceCategories[0]?._id ?? "";
  const defaultSpecialtyId = specialties[0]?._id ?? "";

  type BookingSchema = ReturnType<typeof createUnifiedBookingSchema>;
  type BookingFormInput = z.input<BookingSchema>;
  type BookingFormValues = z.output<BookingSchema>;

  const form = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vendorId,
      serviceCategoryId: defaultServiceCategoryId,
      pricingType: defaultPricingType,
      eventDetails: {
        title: "",
        startDate: "",
        endDate: "",
        guestCount: 0,
        description: "",
      },
      estimatedServiceHours: undefined,
      vendorSpecialtyId: defaultSpecialtyId,
      location: {
        addressText: "",
      },
      currency: "GBP",
    },
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset({
        vendorId,
        serviceCategoryId: defaultServiceCategoryId,
        pricingType: defaultPricingType,
        eventDetails: {
          title: "",
          startDate: "",
          endDate: "",
          guestCount: 50,
          description: "",
        },
        estimatedServiceHours: undefined,
        vendorSpecialtyId: defaultSpecialtyId,
        location: {
          addressText: "",
        },
        currency: "GBP",
      });
    }
  }, [open, vendorId, defaultPricingType, defaultServiceCategoryId, defaultSpecialtyId, form]);

  React.useEffect(() => {
    if (!form.getValues("serviceCategoryId") && defaultServiceCategoryId) {
      form.setValue("serviceCategoryId", defaultServiceCategoryId, {
        shouldValidate: true,
      });
    }
  }, [defaultServiceCategoryId, form]);

  React.useEffect(() => {
    if (!pricingTypeLocked) {
      return;
    }

    form.setValue("pricingType", defaultPricingType, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [defaultPricingType, form, pricingTypeLocked]);

  const minimumStartDateLabel = minimumBookingDate
    ? format(minimumBookingDate, "PPP")
    : null;

  const pricingType = form.watch("pricingType");
  const requiresSpecialty =
    pricingType === "hourly_rate" || pricingType === "package_pricing";
  const pricingTypeLabel = PRICING_TYPE_LABELS[pricingType] ?? pricingType.replace(/_/g, " ");

  const onSubmit = async (values: CreateUnifiedBookingFormValues) => {
    try {
      const booking = await createBookingMutation.mutateAsync(values);
      console.log("Booking submission response:", booking);
      if (!booking?._id) {
        throw new Error("Booking created without an ID");
      }
      toast.success(`Booking request submitted successfully to ${vendorName}!`);
      onOpenChange(false);
      router.push(`/client/bookings/${booking._id}`);
    } catch (error) {
      toast.error("Failed to create booking", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstErrorPath = findFirstErrorPath(errors);

    if (firstErrorPath) {
      window.requestAnimationFrame(() => {
        form.setFocus(firstErrorPath as any);

        const firstErrorElement = document.querySelector(
          `[name="${firstErrorPath}"]`,
        );
        firstErrorElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }

    toast.error("Please fix the highlighted fields before submitting.");
  };

  const isSubmitting =
    form.formState.isSubmitting || createBookingMutation.isPending;
  const currencySymbol = "£";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {vendorName}</DialogTitle>
          <DialogDescription>
            Fill in the details below to send a booking request. The vendor will
            review and respond to your request.
          </DialogDescription>
        </DialogHeader>
        {/* 
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">*</span> Required fields
          <span className="mx-2">•</span>
          Optional fields are labeled as such.
        </p> */}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-6"
          >
            {/* Event Details Section */}
            <div className="space-y-4">
              {/* <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>Event Details</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-destructive">
                  *
                </span>
              </h3> */}

              <FormField
                control={form.control}
                name="eventDetails.title"
                render={({ field }) => (
                  <FormItem>
                    <LabeledFormLabel>Event Title</LabeledFormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Wedding Reception, Birthday Party"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {minimumStartDateLabel && (
                <p className="-mt-2 text-xs text-muted-foreground">
                  Earliest booking date: {minimumStartDateLabel}
                  {vendorLeadTimeRequired ? ` (${formatLeadTimeLabel(vendorLeadTimeRequired)})` : ""}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="eventDetails.startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <LabeledFormLabel>Start Date & Time</LabeledFormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                // Set to noon by default
                                date.setHours(12, 0, 0, 0);
                                field.onChange(date.toISOString());
                              }
                            }}
                            disabled={(date) =>
                              date < (minimumBookingDate ?? getStartOfDay(new Date()))
                            }
                            initialFocus
                          />
                          {field.value && (
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                defaultValue={format(
                                  new Date(field.value),
                                  "HH:mm",
                                )}
                                onChange={(e) => {
                                  const date = new Date(field.value);
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date.toISOString());
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="eventDetails.endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <LabeledFormLabel>End Date & Time</LabeledFormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                // Set to 2 hours after start or default to 6pm
                                const startDate = form.getValues(
                                  "eventDetails.startDate",
                                );
                                if (startDate) {
                                  const start = new Date(startDate);
                                  date.setHours(
                                    start.getHours() + 2,
                                    start.getMinutes(),
                                  );
                                } else {
                                  date.setHours(18, 0, 0, 0);
                                }
                                field.onChange(date.toISOString());
                              }
                            }}
                            disabled={(date) => {
                              const startDate = form.getValues(
                                "eventDetails.startDate",
                              );
                              if (startDate) {
                                return date < getStartOfDay(new Date(startDate));
                              }
                              return date < getStartOfDay(new Date());
                            }}
                            initialFocus
                          />
                          {field.value && (
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                defaultValue={format(
                                  new Date(field.value),
                                  "HH:mm",
                                )}
                                onChange={(e) => {
                                  const date = new Date(field.value);
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date.toISOString());
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Guest Count */}
              <FormField
                control={form.control}
                name="eventDetails.guestCount"
                render={({ field }) => (
                  <FormItem>
                    <LabeledFormLabel>Number of Guests</LabeledFormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="eventDetails.description"
                render={({ field }) => (
                  <FormItem>
                    <LabeledFormLabel optional>Event Description</LabeledFormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event, special requirements, or any other details the vendor should know..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Location */}
            <FormField
              control={form.control}
              name="location.addressText"
              render={({ field }) => (
                <FormItem>
                  <LabeledFormLabel>Event Location</LabeledFormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 123 Party St, London, UK"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Service Category */}
            <FormField
              control={form.control}
              name="serviceCategoryId"
              render={({ field }) => (
                <FormItem>
                  <LabeledFormLabel>Service Category</LabeledFormLabel>
                  <FormControl>
                    {serviceCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3 text-center bg-muted/50 rounded-lg">
                        No service categories available for this vendor.
                      </p>
                    ) : (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="gap-2"
                      >
                        {serviceCategories.map((category) => (
                          <div
                            key={category._id}
                            className="flex items-start gap-3 rounded-lg border border-border p-3"
                          >
                            <RadioGroupItem
                              value={category._id}
                              id={`category-${category._id}`}
                            />
                            <Label
                              htmlFor={`category-${category._id}`}
                              className="cursor-pointer text-sm font-medium"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Pricing Type */}
            {pricingTypeLocked ? (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                <span className="font-medium text-foreground">Pricing Model: </span>
                <span className="text-foreground">{pricingTypeLabel}</span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="pricingType"
                render={({ field }) => (
                  <FormItem>
                    <LabeledFormLabel>Pricing Type</LabeledFormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="gap-2"
                      >
                        {PRICING_TYPE_OPTIONS.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-start gap-3 rounded-lg border border-border p-3"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`pricing-${option.value}`}
                            />
                            <Label
                              htmlFor={`pricing-${option.value}`}
                              className="cursor-pointer space-y-1"
                            >
                              <span className="text-sm font-medium">
                                {option.label}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiresSpecialty && (
              <>
                <Separator />

                <FormField
                  control={form.control}
                  name="vendorSpecialtyId"
                  render={({ field }) => (
                    <FormItem>
                      <LabeledFormLabel>Specialty</LabeledFormLabel>
                      <FormControl>
                        {specialties.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-3 text-center bg-muted/50 rounded-lg">
                            No specialties available for this vendor.
                          </p>
                        ) : (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="gap-2"
                          >
                            {specialties.map((specialty) => (
                              <div
                                key={specialty._id}
                                className="flex items-start gap-3 rounded-lg border border-border p-3"
                              >
                                <RadioGroupItem
                                  value={specialty._id}
                                  id={`specialty-${specialty._id}`}
                                />
                                <Label
                                  htmlFor={`specialty-${specialty._id}`}
                                  className="cursor-pointer space-y-1 flex flex-col items-start "
                                >
                                  <span className="text-sm font-medium">
                                    {specialty.serviceSpecialty.name}
                                  </span>
                                  {specialty.serviceSpecialty.description && (
                                    <span className="block text-xs text-muted-foreground">
                                      {specialty.serviceSpecialty.description}
                                    </span>
                                  )}
                                  <span className="block text-xs text-muted-foreground">
                                    {formatMoney(specialty.price)} {specialty.priceCharge?.replace(/_/g, " ")}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {pricingType === "hourly_rate" && (
              <>
                <Separator />
                <FormField
                  control={form.control}
                  name="estimatedServiceHours"
                  render={({ field }) => (
                    <FormItem>
                      <LabeledFormLabel>Estimated Hours Needed</LabeledFormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={0.5}
                          placeholder="e.g., 4"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      {/* Cost helper: show hourly rate and estimated cost when possible */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {(() => {
                          const selectedSpecialtyId = form.getValues("vendorSpecialtyId");
                          const selected = specialties.find((s) => s._id === selectedSpecialtyId);
                          const hourlyPriceMinor = selected && selected.priceCharge === "hourly_rate" ? Number(selected.price) : NaN;
                          const hours = field.value ?? undefined;

                          if (!Number.isNaN(hourlyPriceMinor)) {
                            const estimatedMinor = typeof hours === "number" && hours > 0 ? hours * hourlyPriceMinor : null;
                            return (
                              <>
                                <div>Hourly rate: {formatMoney(hourlyPriceMinor)}</div>
                                <div>
                                  {estimatedMinor !== null
                                    ? `Estimated cost: ${formatMoney(estimatedMinor)} (estimate)`
                                    : "Enter estimated hours to see an estimated cost."}
                                </div>
                              </>
                            );
                          }

                          return (
                            <div>Cost is based on estimated hours × the vendor's hourly charge.</div>
                          );
                        })()}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {pricingType === "custom_quotes" && (
              <>
                <Separator />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <LabeledFormLabel>Target Budget</LabeledFormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g., 2500"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? undefined : Number(e.target.value),
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Booking Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  );
}
