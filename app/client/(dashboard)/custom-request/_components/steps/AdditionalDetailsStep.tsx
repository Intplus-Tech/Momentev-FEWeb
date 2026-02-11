"use client";

import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useEffect, useCallback, useState, useMemo } from "react";
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

  // Store full UploadedFile objects in local state — no double-casting needed
  const [uploads, setUploads] = useState<(UploadedFile | null)[]>(() => {
    const existing = additionalDetails?.uploadedFiles || [];
    const base: (UploadedFile | null)[] = [null, null, null];
    return base.map((_, idx) => existing[idx] || null);
  });

  // Memoized payload for store
  const payload = useMemo(
    () => ({
      inspirationLinks: additionalDetails?.inspirationLinks || [],
      uploadedFiles: uploads.filter((u): u is UploadedFile => u !== null),
    }),
    [additionalDetails?.inspirationLinks, uploads],
  );

  useEffect(() => {
    setIsAdditionalDetailsValid(true);
  }, [setIsAdditionalDetailsValid]);

  // Persist to store when uploads change
  useEffect(() => {
    setAdditionalDetails(payload);
  }, [payload, setAdditionalDetails]);

  const handleUploadComplete = useCallback(
    (index: number, file: UploadedFile) => {
      setUploads((prev) => {
        const next = [...prev];
        next[index] = file; // Store the full UploadedFile object
        return next;
      });
    },
    [],
  );

  const handleRemove = useCallback((index: number) => {
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
