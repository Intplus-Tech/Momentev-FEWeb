"use client";

import { FileUploadCard } from "./FileUploadCard";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useEffect } from "react";
import type { UploadedFile } from "@/lib/actions/upload";

export function DocumentUploadSection() {
  // Zustand store - use new metadata fields
  const documents = useVendorSetupStore((state) => state.documents);
  const addDocument = useVendorSetupStore((state) => state.addDocument);
  const removeDocument = useVendorSetupStore((state) => state.removeDocument);
  const setDocumentsValid = useVendorSetupStore(
    (state) => state.setDocumentsValid,
  );

  // Update validation based on uploaded files
  useEffect(() => {
    const hasRequiredDocs =
      documents.identification.length > 0 && documents.registration.length > 0;
    setDocumentsValid(hasRequiredDocs);
  }, [documents, setDocumentsValid]);

  // Handle file upload for identification
  const handleIdentificationUpload = (data: UploadedFile) => {
    addDocument("identification", {
      id: data._id,
      url: data.url,
      name: data.originalName,
    });
  };

  // Handle file upload for registration
  const handleRegistrationUpload = (data: UploadedFile) => {
    addDocument("registration", {
      id: data._id,
      url: data.url,
      name: data.originalName,
    });
  };

  // Handle file upload for license
  const handleLicenseUpload = (data: UploadedFile) => {
    addDocument("license", {
      id: data._id,
      url: data.url,
      name: data.originalName,
    });
  };

  return (
    <div className="space-y-6 px-6 pb-6">
      {/* Means of Identification */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-primary/5 px-4 py-2">
          <h3 className="text-sm font-semibold text-primary">
            Means of Identification
          </h3>
          <span className="text-xs text-muted-foreground">
            Required • PDF, JPG, PNG
          </span>
        </div>

        <div className="space-y-3">
          {/* Show uploaded files */}
          {documents.identification.map((doc) => (
            <FileUploadCard
              key={doc.id}
              uploadedFile={doc}
              onRemove={() => removeDocument("identification", doc.id)}
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
            />
          ))}

          {/* Upload zone - always show at least one */}
          {documents.identification.length === 0 && (
            <FileUploadCard
              onUploadComplete={handleIdentificationUpload}
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxSize={10 * 1024 * 1024}
            />
          )}
        </div>
      </div>

      {/* Company Registration Certificate */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-primary/5 px-4 py-2">
          <h3 className="text-sm font-semibold text-primary">
            Company Registration Certificate
          </h3>
          <span className="text-xs text-muted-foreground">
            Required • PDF, JPG, PNG
          </span>
        </div>

        <div className="space-y-3">
          {/* Show uploaded files */}
          {documents.registration.map((doc) => (
            <FileUploadCard
              key={doc.id}
              uploadedFile={doc}
              onRemove={() => removeDocument("registration", doc.id)}
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
            />
          ))}

          {/* Upload zone - always show at least one */}
          {documents.registration.length === 0 && (
            <FileUploadCard
              onUploadComplete={handleRegistrationUpload}
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxSize={10 * 1024 * 1024}
            />
          )}
        </div>
      </div>

      {/* Business License/Permits */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-primary/5 px-4 py-2">
          <h3 className="text-sm font-semibold text-primary">
            Business License/Permits
          </h3>
          <span className="text-xs text-muted-foreground">
            Optional • PDF, JPG, PNG
          </span>
        </div>

        <div className="space-y-3">
          {/* Show uploaded files */}
          {documents.license.map((doc) => (
            <FileUploadCard
              key={doc.id}
              uploadedFile={doc}
              onRemove={() => removeDocument("license", doc.id)}
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
            />
          ))}

          {/* Upload zone - always show at least one */}
          {documents.license.length === 0 && (
            <FileUploadCard
              onUploadComplete={handleLicenseUpload}
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxSize={10 * 1024 * 1024}
            />
          )}
        </div>
      </div>
    </div>
  );
}
