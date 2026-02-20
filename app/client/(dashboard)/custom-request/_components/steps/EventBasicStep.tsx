"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
                  Start Date &amp; Time
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="event-start-date"
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
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
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
                          defaultValue={format(new Date(field.value), "HH:mm")}
                          onChange={(e) => {
                            const date = new Date(field.value);
                            const [hours, minutes] = e.target.value.split(":");
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(date.toISOString());
                          }}
                        />
                      </div>
                    )}
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
                  End Date &amp; Time (Optional)
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="event-end-date"
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
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const startDate = getValues("eventDate");
                          if (startDate) {
                            const start = new Date(startDate);
                            date.setHours(start.getHours() + 2, start.getMinutes());
                          } else {
                            date.setHours(18, 0, 0, 0);
                          }
                          field.onChange(date.toISOString());
                        }
                      }}
                      disabled={(date) => {
                        const startDate = getValues("eventDate");
                        if (startDate) return date < new Date(startDate);
                        return date < new Date();
                      }}
                      initialFocus
                    />
                    {field.value && (
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          defaultValue={format(new Date(field.value), "HH:mm")}
                          onChange={(e) => {
                            const date = new Date(field.value!);
                            const [hours, minutes] = e.target.value.split(":");
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(date.toISOString());
                          }}
                        />
                      </div>
                    )}
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
