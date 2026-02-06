import { z } from "zod";

export const eventBasicSchema = z.object({
  eventType: z.string().min(1, "Please select an event type"),
  otherEventType: z.string(),
  eventDate: z.string().min(1, "Please select an event date"),
  eventStartTime: z.string().min(1, "Please select a start time"),
  eventEndTime: z.string(),
  guestCount: z.number().min(1, "Guest count must be at least 1"),
  location: z.string().min(1, "Please enter a location"),
  eventName: z.string().min(1, "Please enter an event name"),
  eventDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
});

export type EventBasicFormData = z.infer<typeof eventBasicSchema>;

export const EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Other",
] as const;

export const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});
