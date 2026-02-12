"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Minus, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  createBookingSchema,
  type CreateBookingFormValues,
} from "@/validation/booking";
import { useCreateBooking } from "@/hooks/api/use-booking";
import type { VendorSpecialtyItem } from "@/types/vendor-services";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
  specialties: VendorSpecialtyItem[] | undefined;
}

const CURRENCIES = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
];

export function BookingModal({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  specialties = [],
}: BookingModalProps) {
  const createBookingMutation = useCreateBooking();
  const [selectedSpecialties, setSelectedSpecialties] = React.useState<
    Map<string, number>
  >(new Map());

  const form = useForm<CreateBookingFormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      vendorId,
      eventDetails: {
        title: "",
        startDate: "",
        endDate: "",
        guestCount: 50,
        description: "",
      },
      budgetAllocations: [],
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
        eventDetails: {
          title: "",
          startDate: "",
          endDate: "",
          guestCount: 50,
          description: "",
        },
        budgetAllocations: [],
        location: {
          addressText: "",
        },
        currency: "GBP",
      });
      setSelectedSpecialties(new Map());
    }
  }, [open, vendorId, form]);

  // Update budget allocations when selected specialties change
  React.useEffect(() => {
    const allocations = Array.from(selectedSpecialties.entries()).map(
      ([specialtyId, amount]) => ({
        vendorSpecialtyId: specialtyId,
        budgetedAmount: amount,
      }),
    );
    form.setValue("budgetAllocations", allocations, { shouldValidate: true });
  }, [selectedSpecialties, form]);

  const handleSpecialtyToggle = (specialtyId: string, checked: boolean) => {
    setSelectedSpecialties((prev) => {
      const next = new Map(prev);
      if (checked) {
        next.set(specialtyId, 1000); // Default budget
      } else {
        next.delete(specialtyId);
      }
      return next;
    });
  };

  const handleBudgetChange = (specialtyId: string, amount: number) => {
    setSelectedSpecialties((prev) => {
      const next = new Map(prev);
      if (amount > 0) {
        next.set(specialtyId, amount);
      }
      return next;
    });
  };

  const calculateTotalBudget = () => {
    return Array.from(selectedSpecialties.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );
  };

  const onSubmit = async (values: CreateBookingFormValues) => {
    try {
      await createBookingMutation.mutateAsync(values);
      toast.success("Booking request submitted successfully!", {
        description: `Your booking request for "${values.eventDetails.title}" has been sent to ${vendorName}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create booking", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  const isSubmitting =
    form.formState.isSubmitting || createBookingMutation.isPending;
  const currency = form.watch("currency");
  const currencySymbol =
    currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Event Details
              </h3>

              <FormField
                control={form.control}
                name="eventDetails.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="eventDetails.startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time</FormLabel>
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
                            disabled={(date) => date < new Date()}
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
                      <FormLabel>End Date & Time</FormLabel>
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
                                return date < new Date(startDate);
                              }
                              return date < new Date();
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
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            field.onChange(Math.max(1, field.value - 10))
                          }
                          disabled={field.value <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 flex-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={1}
                            max={10000}
                            className="text-center"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            field.onChange(Math.min(10000, field.value + 10))
                          }
                          disabled={field.value >= 10000}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
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
                    <FormLabel>Event Description</FormLabel>
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
                  <FormLabel>Event Location</FormLabel>
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

            {/* Services & Budget */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Select Services & Budget
                </h3>
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-xs text-muted-foreground">
                        Currency:
                      </FormLabel>
                      <FormControl>
                        <select
                          className="h-8 rounded-md border bg-background px-2 text-sm"
                          {...field}
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {specialties.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center bg-muted/50 rounded-lg">
                  No specialties available for this vendor.
                </p>
              ) : (
                <div className="space-y-3">
                  {specialties.map((specialty) => {
                    const isSelected = selectedSpecialties.has(specialty._id);
                    const budgetAmount =
                      selectedSpecialties.get(specialty._id) || 0;

                    return (
                      <div
                        key={specialty._id}
                        className={cn(
                          "rounded-lg border p-4 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`specialty-${specialty._id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSpecialtyToggle(specialty._id, !!checked)
                            }
                          />
                          <div className="flex-1 space-y-1">
                            <label
                              htmlFor={`specialty-${specialty._id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {specialty.serviceSpecialty.name}
                            </label>
                            {specialty.serviceSpecialty.description && (
                              <p className="text-xs text-muted-foreground">
                                {specialty.serviceSpecialty.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Base price: {specialty.price}{" "}
                              {specialty.priceCharge?.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t">
                            <label className="text-xs text-muted-foreground block mb-2">
                              Your budget for this service
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {currencySymbol}
                              </span>
                              <Input
                                type="number"
                                min={1}
                                value={budgetAmount}
                                onChange={(e) =>
                                  handleBudgetChange(
                                    specialty._id,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-32"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {form.formState.errors.budgetAllocations && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.budgetAllocations.message}
                </p>
              )}
            </div>

            {/* Total Budget Summary */}
            {selectedSpecialties.size > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Budget</span>
                  <span className="text-lg font-semibold">
                    {currencySymbol}
                    {calculateTotalBudget().toLocaleString()}
                  </span>
                </div>
              </div>
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
    </Dialog>
  );
}
