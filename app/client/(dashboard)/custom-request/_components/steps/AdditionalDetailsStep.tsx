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
    // isLocalChange is reset in the "sync from store" effect above
  }, [uploads, setAdditionalDetails]);

  useEffect(() => {
    setIsAdditionalDetailsValid(true);
  }, [setIsAdditionalDetailsValid]);

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
          <span className="text-sm font-semibold text-primary">
            Upload Visual Inspiration
          </span>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-4">
            {uploads.map((file, idx) => (
              <FileUploadCard
                key={idx}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
