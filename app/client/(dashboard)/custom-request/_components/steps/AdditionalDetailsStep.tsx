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
    ({ id: string; url: string; name: string } | null)[]
  >(() => {
    const existing = additionalDetails?.uploadedFiles || [];
    const base = [null, null, null];
    return base.map((_, idx) => existing[idx] || null);
  });

  // Memoized payload for store
  const payload = useMemo(
    () => ({
      inspirationLinks: additionalDetails?.inspirationLinks || [],
      uploadedFiles: uploads.filter(Boolean) as {
        id: string;
        url: string;
        name: string;
      }[],
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
        id: file._id,
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
                  file ? { id: file.id, url: file.url, name: file.name } : null
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
