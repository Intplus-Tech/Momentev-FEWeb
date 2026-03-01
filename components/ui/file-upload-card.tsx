"use client";

import { useState, useEffect } from "react";
import { X, Check, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/actions/upload";
import type { UploadedFile } from "@/lib/actions/upload";

type UploadState = "idle" | "uploading" | "complete" | "error";

interface FileUploadCardProps {
  onUploadComplete?: (data: UploadedFile) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onRemove?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  uploadedFile?: { id: string; url: string; name: string; size?: number } | null;
  variant?: "default" | "avatar";
}

export function FileUploadCard({
  onUploadComplete,
  onUploadStart,
  onUploadEnd,
  onRemove,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
  },
  maxSize = 10 * 1024 * 1024,
  uploadedFile = null,
  variant = "default",
}: FileUploadCardProps) {
  const [state, setState] = useState<UploadState>(
    uploadedFile ? "complete" : "idle",
  );
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(uploadedFile?.name || "");
  const [fileSize, setFileSize] = useState(uploadedFile?.size || 0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    uploadedFile?.url || null,
  );

  // Track upload state changes for external listeners
  useEffect(() => {
    if (state === "uploading") {
      onUploadStart?.();
      return () => onUploadEnd?.();
    }
  }, [state, onUploadStart, onUploadEnd]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${formatFileSize(maxSize)}`);
      setState("error");
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setState("uploading");
    setError(null);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Simulate progress (since we don't have real progress from the upload action)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadFile(formData);

      clearInterval(progressInterval);

      if (result.success && result.data) {
        setProgress(100);
        setState("complete");
        setPreviewUrl(result.data.url);
        onUploadComplete?.(result.data);
      } else {
        setState("error");
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setState("error");
      setError("Upload failed. Please try again.");
    }
  };

  const handleRemove = () => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setFileSize(0);
    setError(null);
    setPreviewUrl(null);
    if (onRemove) {
        onRemove();
    }
  };

  // Idle state - show upload button
  if (state === "idle") {
    return (
      <div className="relative">
        <label className="flex items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-background p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UploadIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Upload Document</p>
            <p className="text-xs text-muted-foreground">
              Max {formatFileSize(maxSize)}
            </p>
          </div>
          <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            Browse
          </span>
          <input
            type="file"
            className="hidden"
            accept={Object.keys(accept).join(",")}
            onChange={handleFileSelect}
          />
        </label>
      </div>
    );
  }

  // Uploading, Complete, or Error states
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail/Preview */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={fileName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {fileName}
            </p>
          </div>

          {/* Progress Bar or Status */}
          {state === "uploading" && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatFileSize(fileSize)} • {progress}% uploaded
                </span>
                <span className="text-muted-foreground">
                  {progress < 100 ? "Uploading..." : "Processing..."}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {state === "complete" && (
            <p className="text-xs text-green-600 mt-1">
              {formatFileSize(fileSize)} • Upload complete
            </p>
          )}

          {state === "error" && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>

        {/* Remove Button */}
        {(state === "complete" || state === "error") && (
          <button
            onClick={handleRemove}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors relative z-10 p-1"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
