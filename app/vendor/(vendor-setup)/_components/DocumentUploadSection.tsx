"use client";

import { Cloud, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBusinessSetup } from "../_context/BusinessSetupContext";
import { useEffect } from "react";

interface UploadedFile {
  name: string;
  size: number;
  progress: number;
}

function FileUploadZone({
  title,
  hint,
  onFileSelect,
}: {
  title: string;
  hint: string;
  onFileSelect: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 sm:p-8 transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
    >
      <Cloud className="mb-3 h-10 w-10 text-primary" strokeWidth={1.5} />
      <p className="mb-1 text-sm font-medium text-foreground">
        Drag your file(s) or{" "}
        <label className="cursor-pointer text-primary hover:underline">
          browse
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </label>
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function UploadedFileCard({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-2 sm:p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <path
            d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM5 21C4.45 21 3.979 20.804 3.587 20.412C3.195 20.02 2.99933 19.5493 3 19V5C3 4.45 3.196 3.979 3.588 3.587C3.98 3.195 4.45067 2.99933 5 3H14L19 8V19C19 19.55 18.804 20.021 18.412 20.413C18.02 20.805 17.5493 21.0007 17 21H5ZM13 9V5H5V19H17V9H13Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {file.name}
          </p>
          <button
            onClick={onRemove}
            className="shrink-0 text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress value={file.progress} className="h-1" />
          <span className="shrink-0 text-xs text-muted-foreground">
            {file.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function DocumentUploadSection() {
  const {
    documents,
    updateDocuments,
    setDocumentsValid,
    uploadedFilesMetadata,
    updateUploadedFilesMetadata,
  } = useBusinessSetup();
  const [identificationFiles, setIdentificationFiles] = React.useState<
    UploadedFile[]
  >(uploadedFilesMetadata.identification);
  const [registrationFiles, setRegistrationFiles] = React.useState<
    UploadedFile[]
  >(uploadedFilesMetadata.registration);
  const [licenseFiles, setLicenseFiles] = React.useState<UploadedFile[]>(
    uploadedFilesMetadata.license,
  );

  // Update validation based on uploaded files
  useEffect(() => {
    const hasRequiredDocs =
      identificationFiles.length > 0 && registrationFiles.length > 0;
    setDocumentsValid(hasRequiredDocs);
  }, [identificationFiles, registrationFiles, setDocumentsValid]);

  const convertUploadedToFile = (uploaded: UploadedFile[]): File[] => {
    // In a real implementation, these would be actual File objects
    // For now, we'll create mock files
    return uploaded.map((f) => new File([], f.name));
  };

  useEffect(() => {
    updateDocuments(
      "identification",
      convertUploadedToFile(identificationFiles),
    );
    updateUploadedFilesMetadata("identification", identificationFiles);
  }, [identificationFiles, updateDocuments, updateUploadedFilesMetadata]);

  useEffect(() => {
    updateDocuments("registration", convertUploadedToFile(registrationFiles));
    updateUploadedFilesMetadata("registration", registrationFiles);
  }, [registrationFiles, updateDocuments, updateUploadedFilesMetadata]);

  useEffect(() => {
    updateDocuments("license", convertUploadedToFile(licenseFiles));
    updateUploadedFilesMetadata("license", licenseFiles);
  }, [licenseFiles, updateDocuments, updateUploadedFilesMetadata]);

  const handleFileSelect = (
    setter: (files: UploadedFile[]) => void,
    files: UploadedFile[],
  ) => {
    return (file: File) => {
      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        progress: 100,
      };
      setter([...files, newFile]);
    };
  };

  const handleFileRemove = (
    setter: (files: UploadedFile[]) => void,
    files: UploadedFile[],
    index: number,
  ) => {
    return () => {
      setter(files.filter((_, i) => i !== index));
    };
  };

  return (
    <div className="space-y-6">
      {/* Means of Identification */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-primary/5 px-4 py-2">
          <h3 className="text-sm font-semibold text-primary">
            Means of Identification
          </h3>
          {identificationFiles.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Upload className="mr-1 h-3 w-3" />
              Upload
            </Button>
          )}
        </div>

        {identificationFiles.length === 0 ? (
          <FileUploadZone
            title="Means of Identification"
            hint="Upload PDF/JPG/PNG • Recommended for client trust"
            onFileSelect={handleFileSelect(
              setIdentificationFiles,
              identificationFiles,
            )}
          />
        ) : (
          <div className="space-y-2">
            {identificationFiles.map((file, index) => (
              <UploadedFileCard
                key={index}
                file={file}
                onRemove={handleFileRemove(
                  setIdentificationFiles,
                  identificationFiles,
                  index,
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Company Registration Certificate */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-primary/5 px-4 py-2">
          <h3 className="text-sm font-semibold text-primary">
            Company Registration Certificate
          </h3>
          {registrationFiles.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Upload className="mr-1 h-3 w-3" />
              Upload
            </Button>
          )}
        </div>

        {registrationFiles.length === 0 ? (
          <FileUploadZone
            title="Company Registration Certificate"
            hint="Upload PDF/JPG/PNG • Recommended for client trust"
            onFileSelect={handleFileSelect(
              setRegistrationFiles,
              registrationFiles,
            )}
          />
        ) : (
          <div className="space-y-2">
            {registrationFiles.map((file, index) => (
              <UploadedFileCard
                key={index}
                file={file}
                onRemove={handleFileRemove(
                  setRegistrationFiles,
                  registrationFiles,
                  index,
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Business License/Permits */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-primary/5 px-4 py-2">
          <h3 className="text-sm font-semibold text-primary">
            Business License/Permits
          </h3>
          {licenseFiles.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Upload className="mr-1 h-3 w-3" />
              Upload
            </Button>
          )}
        </div>

        {licenseFiles.length === 0 ? (
          <FileUploadZone
            title="Business License/Permits"
            hint="Upload PDF/JPG/PNG • Required for some venues"
            onFileSelect={handleFileSelect(setLicenseFiles, licenseFiles)}
          />
        ) : (
          <div className="space-y-2">
            {licenseFiles.map((file, index) => (
              <UploadedFileCard
                key={index}
                file={file}
                onRemove={handleFileRemove(
                  setLicenseFiles,
                  licenseFiles,
                  index,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add missing React import
import * as React from "react";
