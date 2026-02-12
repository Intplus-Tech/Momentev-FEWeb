"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventBasicSchema,
  EventBasicFormData,
} from "../../_schemas/eventBasicSchema";

type CommitRegistrar = (fn: () => void) => void;

export function EventBasicStep({
  registerCommit,
}: {
  registerCommit?: CommitRegistrar;
}) {
  const eventBasic = useCustomRequestStore((state) => state.eventBasic);
  const setEventBasic = useCustomRequestStore((state) => state.setEventBasic);
  const setIsEventBasicValid = useCustomRequestStore(
    (state) => state.setIsEventBasicValid,
  );

  const {
    control,
    watch,
    getValues,
    formState: { isValid, errors },
  } = useForm<EventBasicFormData>({
    resolver: zodResolver(eventBasicSchema),
    mode: "onChange",
    defaultValues: {
      eventDate: eventBasic?.eventDate || "",
      endDate: eventBasic?.endDate || "",
      guestCount: eventBasic?.guestCount || 0,
      location: eventBasic?.location || "",
      eventName: eventBasic?.eventName || "",
      eventDescription: eventBasic?.eventDescription || "",
    },
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const eventDateValue = watch("eventDate");
  const endDateValue = watch("endDate");

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    const seconds = `${date.getSeconds()}`.padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const parseDateValue = (value?: string) => {
    if (!value) return undefined;

    const [datePart, timePart] = value.split("T");
    const [yearStr, monthStr, dayStr] = (datePart ?? "").split("-");
    const [hourStr = "0", minuteStr = "0", secondStr = "0"] = (
      timePart ?? ""
    ).split(":");

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hours = Number(hourStr);
    const minutes = Number(minuteStr);
    const seconds = Number(secondStr);

    if (!year || !month || !day) return undefined;

    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const selectedStartDate = parseDateValue(eventDateValue);
  const selectedEndDate = parseDateValue(endDateValue);

  // Update store validity when form validity changes
  useEffect(() => {
    setIsEventBasicValid(isValid);
  }, [isValid, setIsEventBasicValid]);

  // Memoize commit function to avoid re-registering on every render
  const commitData = useCallback(() => {
    setEventBasic(getValues());
  }, [getValues, setEventBasic]);

  // Register commit function to persist when parent advances
  useEffect(() => {
    if (!registerCommit) return;
    registerCommit(commitData);
  }, [registerCommit, commitData]);

  return (
    <div className="space-y-4">
      {/* Section 1: Event Details */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            1. Event Details
          </span>
        </div>
        <div className="p-4 space-y-4">
          <Controller
            name="eventName"
            control={control}
            render={({ field }) => (
              <Field>
                <FloatingLabelInput
                  label="Event Name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                {errors.eventName && (
                  <FieldError>{errors.eventName.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="eventDescription"
            control={control}
            render={({ field }) => (
              <Field>
                <FloatingLabelTextarea
                  label="Event Description"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={500}
                  showCharCount
                />
                {errors.eventDescription && (
                  <FieldError>{errors.eventDescription.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>
      </div>

      {/* Section 2: Event Date & Time */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            2. Event Date & Time
          </span>
        </div>
        <div className="p-4 space-y-4">
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <Field className="w-full">
                <FieldLabel htmlFor="event-start-date">
                  Start Date & Time
                </FieldLabel>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="event-start-date"
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {selectedStartDate
                        ? selectedStartDate.toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Select start date & time"}
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                      <Calendar
                        mode="single"
                        selected={selectedStartDate}
                        defaultMonth={selectedStartDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const newDate = new Date(date);
                          if (selectedStartDate) {
                            newDate.setHours(selectedStartDate.getHours());
                            newDate.setMinutes(selectedStartDate.getMinutes());
                          }
                          field.onChange(formatDateValue(newDate));
                        }}
                      />
                      <div className="border-t sm:border-t-0 sm:border-l">
                        <TimePicker
                          date={selectedStartDate}
                          setDate={(date) => {
                            field.onChange(formatDateValue(date));
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.eventDate && (
                  <FieldError>{errors.eventDate.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Field className="w-full">
                <FieldLabel htmlFor="event-end-date">
                  End Date & Time (Optional)
                </FieldLabel>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="event-end-date"
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {selectedEndDate
                        ? selectedEndDate.toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Select end date & time"}
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                      <Calendar
                        mode="single"
                        selected={selectedEndDate}
                        defaultMonth={selectedEndDate || selectedStartDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const newDate = new Date(date);
                          if (selectedEndDate) {
                            newDate.setHours(selectedEndDate.getHours());
                            newDate.setMinutes(selectedEndDate.getMinutes());
                          }
                          field.onChange(formatDateValue(newDate));
                        }}
                      />
                      <div className="border-t sm:border-t-0 sm:border-l">
                        <TimePicker
                          date={selectedEndDate}
                          setDate={(date) => {
                            field.onChange(formatDateValue(date));
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <FieldError>{errors.endDate.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="guestCount"
            control={control}
            render={({ field }) => (
              <Field>
                <FloatingLabelInput
                  label="Guest Count"
                  type="number"
                  min={1}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                  onBlur={field.onBlur}
                />
                {errors.guestCount && (
                  <FieldError>{errors.guestCount.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Field>
                <FloatingLabelInput
                  label="Location"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                {errors.location && (
                  <FieldError>{errors.location.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>
      </div>
    </div>
  );
}
