"use client";

import { useCallback, useState } from "react";
import {
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  Camera,
  User,
} from "lucide-react";
import Image from "next/image";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/actions/upload";

interface FileUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onUpload?: (data: any) => void;
  onFileSelect?: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // bytes
  disabled?: boolean;
  className?: string;
  variant?: "default" | "avatar";
}

export function FileUpload({
  value,
  onChange,
  onUpload,
  onFileSelect,
  disabled,
  className,
  accept = {
    "image/png": [],
    "image/jpeg": [],
    "image/webp": [],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  variant = "default",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  // Sync preview with value if provided (e.g., initial load)
  if (value && value !== preview && !isUploading) {
    setPreview(value);
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create optimistic preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // If onFileSelect is provided, defer upload
      if (onFileSelect) {
        onFileSelect(file);
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadFile(formData);

        if (!result.success) {
          toast.error(result.error || "Upload failed");
          setPreview(value); // Revert preview on error
          return;
        }

        const fileDat = result.data;
        if (fileDat) {
          onChange?.(fileDat.url);
          // @ts-ignore
          onUpload?.(fileDat);
          setPreview(fileDat.url);
          toast.success("File uploaded successfully");
        }
      } catch (error) {
        toast.error("Something went wrong during upload");
        console.error(error);
        setPreview(value); // Revert
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload, value, onFileSelect]
  );

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
    onUpload?.("");
    setPreview("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: disabled || isUploading,
    multiple: false,
    onDropRejected: (fileRejections: FileRejection[]) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error(
          `File is too large. Max size is ${maxSize / 1024 / 1024}MB`
        );
      } else if (error?.code === "file-invalid-type") {
        toast.error("Invalid file type");
      } else {
        toast.error(error?.message || "File upload failed");
      }
    },
  });

  if (variant === "avatar") {
    return (
      <div className={cn("relative inline-block", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:bg-muted/50",
            (isDragActive || isUploading) && "border-primary/50 bg-primary/5",
            disabled && "cursor-not-allowed opacity-60",
            preview && "border-solid border-border"
          )}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : null}

          {preview ? (
            <Image src={preview} alt="Profile" className="object-cover" fill />
          ) : (
            <User className="h-12 w-12 text-muted-foreground/50" />
          )}

          {/* Overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity duration-200 hover:opacity-100",
              isDragActive && "opacity-100"
            )}
          >
            <Camera className="mb-1 h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Edit
            </span>
          </div>
        </div>

        {preview && !disabled && !isUploading && variant !== "avatar" && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-sm"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-2">
          <div className="relative aspect-square size-32 overflow-hidden rounded-lg border">
            <Image src={preview} alt="Preview" className="object-cover" fill />
          </div>
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-6 transition-colors hover:bg-muted/50",
            isDragActive && "border-primary bg-primary/5",
            (disabled || isUploading) && "cursor-not-allowed opacity-60",
            className
          )}
        >
          <input {...getInputProps()} />
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop the file here" : "Profile Picture"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              SVG, PNG, JPG or GIF (max. 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
