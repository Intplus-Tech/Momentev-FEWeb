"use client";

import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useEffect, useCallback, useState, useRef } from "react";
import { FileUploadCard } from "@/app/vendor/(vendor-setup)/_components/FileUploadCard";
import type { UploadedFile } from "@/lib/actions/upload";

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

  // Track whether the initial store → local sync has happened
  const hasInitializedFromStore = useRef(false);
  // Track whether the latest change was local (user action) to avoid re-sync loops
  const isLocalChange = useRef(false);

  // Initialize local state from store (runs once on mount)
  const [uploads, setUploads] = useState<(UploadedFile | null)[]>(() => {
    const existing = additionalDetails?.uploadedFiles || [];
    if (existing.length > 0) {
      hasInitializedFromStore.current = true;
    }
    const base: (UploadedFile | null)[] = [null, null, null];
    return base.map((_, idx) => existing[idx] || null);
  });

  const requiredUploadCount = 3;
  const completedUploadCount = uploads.filter(Boolean).length;
  const isStepComplete = completedUploadCount === requiredUploadCount;

  // Sync FROM store when draft data loads (only once, only if not already initialized)
  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }

    const existing = additionalDetails?.uploadedFiles || [];
    if (existing.length > 0 && !hasInitializedFromStore.current) {
      const base: (UploadedFile | null)[] = [null, null, null];
      const synced = base.map((_, idx) => existing[idx] || null);
      setUploads(synced);
      hasInitializedFromStore.current = true;
    }
  }, [additionalDetails]);

  // Sync TO store when local uploads change due to user action
  useEffect(() => {
    if (!isLocalChange.current) return;

    const validFiles = uploads.filter((u): u is UploadedFile => u !== null);
    setAdditionalDetails({ uploadedFiles: validFiles });
    setIsAdditionalDetailsValid(validFiles.length === requiredUploadCount);
    // isLocalChange is reset in the "sync from store" effect above
  }, [uploads, requiredUploadCount, setAdditionalDetails, setIsAdditionalDetailsValid]);

  useEffect(() => {
    setIsAdditionalDetailsValid(isStepComplete);
  }, [isStepComplete, setIsAdditionalDetailsValid]);

  const handleUploadComplete = useCallback(
    (index: number, file: UploadedFile) => {
      isLocalChange.current = true;
      setUploads((prev) => {
        const next = [...prev];
        next[index] = file;
        return next;
      });
    },
    [],
  );

  const handleRemove = useCallback((index: number) => {
    isLocalChange.current = true;
    setUploads((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Section 1: Upload Visual Inspiration */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-primary">
              Upload Visual Inspiration
            </span>
            <span className="text-xs font-medium text-primary/80">
              3 images required
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="rounded-lg border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            Upload all 3 inspiration images before continuing. You have uploaded{" "}
            <span className="font-semibold text-foreground">
              {completedUploadCount}/{requiredUploadCount}
            </span>
            .
          </div>
          <div className="flex flex-col gap-4">
            {uploads.map((file, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 transition-colors ${file
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-red-200 bg-red-50/30"
                  }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Inspiration Image {idx + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Required {idx + 1} of {requiredUploadCount}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${file
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {file ? "Uploaded" : "Required"}
                  </span>
                </div>
                <FileUploadCard
                  onUploadComplete={(uploaded) =>
                    handleUploadComplete(idx, uploaded)
                  }
                  onRemove={() => handleRemove(idx)}
                  uploadedFile={
                    file
                      ? {
                        id: file._id,
                        url: file.url,
                        name: file.originalName,
                      }
                      : null
                  }
                />
              </div>
            ))}
          </div>
          {!isStepComplete && (
            <p className="text-sm text-destructive">
              All 3 inspiration images are required to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
