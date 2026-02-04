"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Other",
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export function EventBasicStep() {
  const eventBasic = useCustomRequestStore((state) => state.eventBasic);
  const setEventBasic = useCustomRequestStore((state) => state.setEventBasic);
  const setIsEventBasicValid = useCustomRequestStore(
    (state) => state.setIsEventBasicValid,
  );

  const [formData, setFormData] = useState(
    eventBasic || {
      eventType: "",
      eventDate: "",
      eventStartTime: "",
      eventEndTime: "",
      guestCount: 0,
      location: "",
      eventName: "",
      eventDescription: "",
    },
  );

  const isSection1Valid =
    formData.eventType && formData.eventDate && formData.eventStartTime;
  const isSection2Valid = formData.guestCount > 0 && formData.location;
  const isSection3Valid = formData.eventName && formData.eventDescription;

  useEffect(() => {
    const allValid = isSection1Valid && isSection2Valid && isSection3Valid;
    setIsEventBasicValid(Boolean(allValid));
  }, [
    formData,
    isSection1Valid,
    isSection2Valid,
    isSection3Valid,
    setIsEventBasicValid,
  ]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setEventBasic(newData);
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Event Type */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            1. Event Type
          </span>
        </div>
        <div className="p-4 space-y-3">
          {EVENT_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name="eventType"
                value={type}
                checked={formData.eventType === type}
                onChange={(e) => handleInputChange("eventType", e.target.value)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
          {formData.eventType === "Other" && (
            <FloatingLabelInput
              label="Specify event type"
              value={formData.otherEventType || ""}
              onChange={(e) =>
                handleInputChange("otherEventType", e.target.value)
              }
              className="mt-2"
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
          <FloatingLabelInput
            label="Event Date"
            type="date"
            value={formData.eventDate}
            onChange={(e) => handleInputChange("eventDate", e.target.value)}
            suffix={<Calendar className="w-4 h-4 text-muted-foreground" />}
          />

          <div className="grid grid-cols-2 gap-4 items-center">
            <FloatingLabelSelect
              label="Event Start Time"
              options={TIME_OPTIONS}
              value={formData.eventStartTime}
              onValueChange={(value) =>
                handleInputChange("eventStartTime", value)
              }
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">to</span>
              <div className="flex-1">
                <FloatingLabelSelect
                  label="Event End Time"
                  options={TIME_OPTIONS}
                  value={formData.eventEndTime}
                  onValueChange={(value) =>
                    handleInputChange("eventEndTime", value)
                  }
                />
              </div>
            </div>
          </div>

          <FloatingLabelInput
            label="Guest Count"
            type="number"
            min={1}
            value={formData.guestCount || ""}
            onChange={(e) =>
              handleInputChange("guestCount", parseInt(e.target.value) || 0)
            }
          />

          <FloatingLabelInput
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
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
          <FloatingLabelInput
            label="Event Name"
            value={formData.eventName}
            onChange={(e) => handleInputChange("eventName", e.target.value)}
          />

          <FloatingLabelTextarea
            label="Event Description"
            value={formData.eventDescription}
            onChange={(e) =>
              handleInputChange("eventDescription", e.target.value)
            }
            maxLength={500}
            showCharCount
          />
        </div>
      </div>
    </div>
  );
}
