"use client";

import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useEffect, useMemo, useState } from "react";
import { FileUploadCard } from "@/app/vendor/(vendor-setup)/_components/FileUploadCard";
import type { UploadedFile } from "@/lib/actions/upload";
import { toast } from "sonner";

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

  const [uploads, setUploads] = useState<
    ({ _id: string; url: string; name: string } | null)[]
  >(() => {
    const existing = additionalDetails?.uploadedFiles || [];
    const base = [null, null, null];
    // Map existing UploadedFile objects to our local state shape if needed, or just use them
    // The store expects UploadedFile[], but our local state is simpler.
    // Let's ensure we map cleanly.
    return base.map((_, idx) => {
      const file = existing[idx];
      if (file) {
        return {
          _id: file._id,
          url: file.url,
          name: file.originalName,
        };
      }
      return null;
    });
  });

  // Memoized payload for store
  const payload = useMemo(
    () => ({
      inspirationLinks: additionalDetails?.inspirationLinks || [],
      // We need to match UploadedFile shape roughly or cast it.
      // The store expects UploadedFile.
      // Let's coerce our local state to simpler objects that have _id, which is what we need.
      // Ideally we should store the full UploadedFile, but for now let's fix the ID.
      uploadedFiles: uploads.filter(Boolean).map((u) => ({
        _id: u!._id,
        url: u!.url,
        originalName: u!.name,
        // Add dummy values for other fields if strict typing complains,
        // or assume partial match is okay if we cast.
        // For now, let's just ensure _id is present.
        name: u!.name, // store expects originalName typically but let's keep name for UI
      })) as any as UploadedFile[],
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

  const handleUploadComplete = (index: number, file: UploadedFile) => {
    setUploads((prev) => {
      const next = [...prev];
      next[index] = {
        _id: file._id,
        url: file.url,
        name: file.originalName,
      };
      return next;
    });
    // toast.success(`${file.originalName} uploaded successfully`);
  };

  const handleRemove = (index: number) => {
    setUploads((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
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
          <div className="flex flex-col gap-4">
            {uploads.map((file, idx) => (
              <FileUploadCard
                key={idx}
                onUploadComplete={(uploaded) =>
                  handleUploadComplete(idx, uploaded)
                }
                onRemove={() => handleRemove(idx)}
                uploadedFile={
                  file ? { id: file._id, url: file.url, name: file.name } : null
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
