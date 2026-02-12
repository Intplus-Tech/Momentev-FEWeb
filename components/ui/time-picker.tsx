"use client";

import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleTimeChange = (type: "hour" | "minute", value: number) => {
    const newDate = date ? new Date(date) : new Date();
    if (type === "hour") {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setDate(newDate);
  };

  return (
    <div className="flex h-[300px] flex-col sm:flex-row sm:h-[300px]">
      <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
        <ScrollArea className="w-full sm:w-auto">
          <div className="flex sm:flex-col p-2">
            {hours.map((hour) => (
              <Button
                key={hour}
                size="icon"
                variant={date && date.getHours() === hour ? "default" : "ghost"}
                className="sm:w-full shrink-0 aspect-square"
                onClick={() => handleTimeChange("hour", hour)}
              >
                {hour.toString().padStart(2, "0")}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
        <ScrollArea className="w-full sm:w-auto">
          <div className="flex sm:flex-col p-2">
            {minutes.map((minute) => (
              <Button
                key={minute}
                size="icon"
                variant={
                  date && date.getMinutes() === minute ? "default" : "ghost"
                }
                className="sm:w-full shrink-0 aspect-square"
                onClick={() => handleTimeChange("minute", minute)}
              >
                {minute.toString().padStart(2, "0")}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      </div>
    </div>
  );
}
