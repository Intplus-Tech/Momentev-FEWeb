"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventBasicSchema,
  EventBasicFormData,
  EVENT_TYPES,
  TIME_OPTIONS,
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
      eventType: eventBasic?.eventType || "",
      otherEventType: eventBasic?.otherEventType || "",
      eventDate: eventBasic?.eventDate || "",
      eventStartTime: eventBasic?.eventStartTime || "",
      eventEndTime: eventBasic?.eventEndTime || "",
      guestCount: eventBasic?.guestCount || 0,
      location: eventBasic?.location || "",
      eventName: eventBasic?.eventName || "",
      eventDescription: eventBasic?.eventDescription || "",
    },
  });

  const [dateOpen, setDateOpen] = useState(false);
  const eventType = watch("eventType");
  const eventDateValue = watch("eventDate");

  const selectedDate = eventDateValue ? new Date(eventDateValue) : undefined;

  const formatDateValue = (date: Date) => date.toISOString().slice(0, 10);

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
      {/* Section 1: Event Type */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            1. Event Type
          </span>
        </div>
        <div className="p-4">
          <Controller
            name="eventType"
            control={control}
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                <div className="space-y-3">
                  {EVENT_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <label htmlFor={type} className="text-sm cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          />
          {errors.eventType && (
            <FieldError>{errors.eventType.message}</FieldError>
          )}
          {eventType === "Other" && (
            <Controller
              name="otherEventType"
              control={control}
              render={({ field }) => (
                <FloatingLabelInput
                  label="Specify event type"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="mt-2"
                />
              )}
            />
          )}
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
                <FieldLabel htmlFor="event-date">Event Date</FieldLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="event-date"
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-GB")
                        : "Select date"}
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      defaultMonth={selectedDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (!date) return;
                        field.onChange(formatDateValue(date));
                        setDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.eventDate && (
                  <FieldError>{errors.eventDate.message}</FieldError>
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4 items-center">
            <Controller
              name="eventStartTime"
              control={control}
              render={({ field }) => (
                <Field>
                  <FloatingLabelSelect
                    label="Event Start Time"
                    options={TIME_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  {errors.eventStartTime && (
                    <FieldError>{errors.eventStartTime.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">to</span>
              <div className="flex-1">
                <Controller
                  name="eventEndTime"
                  control={control}
                  render={({ field }) => (
                    <FloatingLabelSelect
                      label="Event End Time"
                      options={TIME_OPTIONS}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>

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

      {/* Section 3: Event Details */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            3. Event Details
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
    </div>
  );
}
