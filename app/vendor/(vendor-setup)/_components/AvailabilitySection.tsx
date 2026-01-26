"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIME_OPTIONS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export interface WorkingDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface AvailabilitySectionProps {
  workingDays: WorkingDays;
  startTime: string;
  endTime: string;
  onWorkingDaysChange: (days: WorkingDays) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function AvailabilitySection({
  workingDays,
  startTime,
  endTime,
  onWorkingDaysChange,
  onStartTimeChange,
  onEndTimeChange,
}: AvailabilitySectionProps) {
  return (
    <div className="px-6 pb-6 space-y-6">
      <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
        <h3 className="text-sm font-medium">Default Availability</h3>
      </div>

      {/* Working Days */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Working Days</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(workingDays).map(([day, checked]) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={checked}
                onCheckedChange={(value) =>
                  onWorkingDaysChange({
                    ...workingDays,
                    [day]: value as boolean,
                  })
                }
              />
              <Label htmlFor={day} className="cursor-pointer capitalize">
                {day}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Working Hours</Label>
        <div className="flex items-center gap-4">
          <Select value={startTime} onValueChange={onStartTimeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">to</span>
          <Select value={endTime} onValueChange={onEndTimeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
