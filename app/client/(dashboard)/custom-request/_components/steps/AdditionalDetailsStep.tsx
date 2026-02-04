"use client";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadSlot {
  id: string;
  file: File | null;
  name: string;
  size: string;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
}

export function AdditionalDetailsStep() {
  const additionalDetails = useCustomRequestStore(
    (state) => state.additionalDetails,
  );
  const setAdditionalDetails = useCustomRequestStore(
    (state) => state.setAdditionalDetails,
  );
  const setIsAdditionalDetailsValid = useCustomRequestStore(
    (state) => state.setIsAdditionalDetailsValid,
  );

  const [uploadSlots, setUploadSlots] = useState<UploadSlot[]>([
    { id: "1", file: null, name: "", size: "", progress: 0, status: "idle" },
    { id: "2", file: null, name: "", size: "", progress: 0, status: "idle" },
    { id: "3", file: null, name: "", size: "", progress: 0, status: "idle" },
  ]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    // This step is always valid (optional)
    setIsAdditionalDetailsValid(true);
  }, [setIsAdditionalDetailsValid]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = (slotId: string, file: File) => {
    setUploadSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              file,
              name: file.name,
              size: formatFileSize(file.size),
              progress: 0,
              status: "uploading" as const,
            }
          : slot,
      ),
    );

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadSlots((prev) =>
          prev.map((slot) =>
            slot.id === slotId
              ? { ...slot, progress: 100, status: "complete" as const }
              : slot,
          ),
        );
        toast.success(`${file.name} uploaded successfully`);
      } else {
        setUploadSlots((prev) =>
          prev.map((slot) =>
            slot.id === slotId ? { ...slot, progress } : slot,
          ),
        );
      }
    }, 200);
  };

  const handleRemoveFile = (slotId: string) => {
    setUploadSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              file: null,
              name: "",
              size: "",
              progress: 0,
              status: "idle" as const,
            }
          : slot,
      ),
    );
  };

  const handleUploadClick = (slotId: string) => {
    fileInputRefs.current[slotId]?.click();
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Upload Visual Inspiration */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            Upload Visual Inspiration
          </span>
        </div>
        <div className="p-4 space-y-4">
          {uploadSlots.map((slot) => (
            <div key={slot.id} className="space-y-2">
              {slot.status === "idle" ? (
                <div className="flex items-center gap-2">
                  <FloatingLabelInput
                    label="Upload Image"
                    value=""
                    disabled
                    className="flex-1"
                  />
                  <input
                    ref={(el) => {
                      fileInputRefs.current[slot.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(slot.id, file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleUploadClick(slot.id)}
                    className="shrink-0"
                  >
                    Upload
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{slot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.size}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(slot.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {slot.status === "uploading" && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Uploading... {Math.round(slot.progress)}% •{" "}
                        {Math.ceil((100 - slot.progress) / 10)} seconds
                        remaining
                      </p>
                      <Progress value={slot.progress} className="h-2" />
                    </div>
                  )}
                  {slot.status === "complete" && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs text-green-600">Upload complete</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
