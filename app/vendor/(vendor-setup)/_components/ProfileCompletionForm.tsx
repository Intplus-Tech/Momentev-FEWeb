"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadCard } from "./FileUploadCard";
import type { UploadedFile } from "@/lib/actions/upload";

const TIME_OPTIONS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export function ProfileCompletionForm() {
  const router = useRouter();

  // Zustand selective subscriptions
  const expandedSection = useVendorSetupStore((state) => state.expandedSection);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const isSubmitting = useVendorSetupStore((state) => state.isSubmitting);
  const profilePhotoId = useVendorSetupStore((state) => state.profilePhotoId);
  const coverPhotoId = useVendorSetupStore((state) => state.coverPhotoId);
  const portfolioImageIds = useVendorSetupStore(
    (state) => state.portfolioImageIds,
  );

  // Actions
  const toggleSection = useVendorSetupStore((state) => state.toggleSection);
  const setExpandedSection = useVendorSetupStore(
    (state) => state.setExpandedSection,
  );
  const markSectionComplete = useVendorSetupStore(
    (state) => state.markSectionComplete,
  );
  const setIsSubmitting = useVendorSetupStore((state) => state.setIsSubmitting);
  const setErrors = useVendorSetupStore((state) => state.setErrors);

  // File upload metadata selectors
  const profilePhoto = useVendorSetupStore((state) => state.profilePhoto);
  const coverPhoto = useVendorSetupStore((state) => state.coverPhoto);
  const portfolioImages = useVendorSetupStore((state) => state.portfolioImages);
  const setProfilePhoto = useVendorSetupStore((state) => state.setProfilePhoto);
  const setCoverPhoto = useVendorSetupStore((state) => state.setCoverPhoto);
  const addPortfolioImage = useVendorSetupStore(
    (state) => state.addPortfolioImage,
  );
  const removePortfolioImage = useVendorSetupStore(
    (state) => state.removePortfolioImage,
  );

  // Section 2: Availability
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  // Auto-expand Section 1 on mount (always reset to section 1 for this step)
  useEffect(() => {
    setExpandedSection(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we want this to run only once on mount

  // Upload handlers connected to Zustand
  const handleProfilePhotoUpload = (data: UploadedFile) => {
    setProfilePhoto({ id: data._id, url: data.url, name: data.originalName });
  };

  const handleCoverPhotoUpload = (data: UploadedFile) => {
    setCoverPhoto({ id: data._id, url: data.url, name: data.originalName });
  };

  const handlePortfolioUpload = (data: UploadedFile) => {
    addPortfolioImage({ id: data._id, url: data.url, name: data.originalName });
  };

  const handleSaveMediaUpload = () => {
    markSectionComplete(4, 1); // Step 4, Section 1
    setExpandedSection(2);
  };

  // Save as draft
  const saveAsDraft = () => {
    toast.success("Draft saved successfully");
    console.log("✅ Draft auto-saved to localStorage");
  };

  // Handle final save and continue to review
  const handleSaveAndContinue = async () => {
    if (expandedSection === null) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (expandedSection === 2) {
        if (!canProceedSection2()) {
          toast.error("Please complete availability settings");
          setIsSubmitting(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("🎉 Step 4 Complete - Setup finished!");
        markSectionComplete(4, 2); // Step 4, Section 2
        toast.success("Profile setup complete!");
        router.push("/vendor/setup-review");
      }
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedSection1 = () => {
    return profilePhoto && coverPhoto && portfolioImages.length >= 5;
  };

  const canProceedSection2 = () => {
    const hasAtLeastOneDay = Object.values(workingDays).some((day) => day);
    return hasAtLeastOneDay && startTime && endTime;
  };

  const canProceed = () => {
    if (expandedSection === 1) return canProceedSection1();
    if (expandedSection === 2) return canProceedSection2();
    return false;
  };

  const getButtonText = () => {
    if (isSubmitting) return "Saving...";
    if (expandedSection === 2) return "Complete Setup";
    return "Save & Continue";
  };

  const isSection2Locked = !completedSections.has("step4-section1");

  return (
    <div className="space-y-6 flex flex-col min-h-[70vh]">
      <div className="">
        {/* Step Title */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">
            Profile Completion
          </h2>
          <h2 className="text-sm sm:text-base font-medium text-muted-foreground">
            Final touches before you go live
          </h2>
        </div>

        {/* Sections */}
        <div className="space-y-4 mt-6">
          {/* Section 1: Profile Media Upload */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={1}
              title="Profile Media Upload"
              isCompleted={completedSections.has("step4-section1")}
              isExpanded={expandedSection === 1}
              onToggle={() => toggleSection(1)}
            />
            {expandedSection === 1 && (
              <div className="px-6 pb-6 space-y-6">
                {/* Profile Photo */}
                <div>
                  <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                    <h3 className="text-sm">
                      Profile Photo ( Professional headshot or logo )
                    </h3>
                  </div>
                  <FileUploadCard
                    onUploadComplete={handleProfilePhotoUpload}
                    uploadedFile={profilePhoto}
                    onRemove={() => setProfilePhoto(null)}
                    accept={{
                      "image/jpeg": [".jpg", ".jpeg"],
                      "image/png": [".png"],
                      "image/webp": [".webp"],
                    }}
                    maxSize={10 * 1024 * 1024}
                    variant="avatar"
                  />
                </div>

                {/* Cover Photo */}
                <div>
                  <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                    <h3 className="text-sm">
                      Cover Photo ( Showcases your work )
                    </h3>
                  </div>
                  <FileUploadCard
                    onUploadComplete={handleCoverPhotoUpload}
                    uploadedFile={coverPhoto}
                    onRemove={() => setCoverPhoto(null)}
                    accept={{
                      "image/jpeg": [".jpg", ".jpeg"],
                      "image/png": [".png"],
                      "image/webp": [".webp"],
                    }}
                    maxSize={10 * 1024 * 1024}
                  />
                </div>

                {/* Portfolio Gallery */}
                <div>
                  <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                    <h3 className="text-sm">
                      Portfolio Gallery ( Add at least 5 photos of your best
                      work )
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Always show 5 slots - filled with uploads or empty upload buttons */}
                    {Array.from({ length: 5 }).map((_, index) => {
                      const uploadedFile = portfolioImages[index];

                      if (uploadedFile) {
                        // Show uploaded file
                        return (
                          <FileUploadCard
                            key={uploadedFile.id}
                            uploadedFile={uploadedFile}
                            onRemove={() =>
                              removePortfolioImage(uploadedFile.id)
                            }
                            accept={{
                              "image/jpeg": [".jpg", ".jpeg"],
                              "image/png": [".png"],
                              "image/webp": [".webp"],
                            }}
                          />
                        );
                      } else {
                        // Show upload slot
                        return (
                          <FileUploadCard
                            key={`slot-${index}`}
                            onUploadComplete={handlePortfolioUpload}
                            accept={{
                              "image/jpeg": [".jpg", ".jpeg"],
                              "image/png": [".png"],
                              "image/webp": [".webp"],
                            }}
                            maxSize={10 * 1024 * 1024}
                          />
                        );
                      }
                    })}
                  </div>
                </div>

                <Button
                  onClick={handleSaveMediaUpload}
                  disabled={!canProceedSection1()}
                  className="w-full sm:w-auto"
                >
                  Save & Continue
                </Button>
              </div>
            )}
          </div>

          {/* Section 2: Availability Settings */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={2}
              title="Availability Settings"
              isCompleted={completedSections.has("step4-section2")}
              isExpanded={expandedSection === 2}
              onToggle={() => !isSection2Locked && toggleSection(2)}
              isLocked={isSection2Locked}
            />
            {expandedSection === 2 && (
              <div className="px-6 pb-6 space-y-6">
                <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                  <h3 className="text-sm font-medium">Default Availability</h3>
                </div>

                {/* Working Days */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Working Days</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(workingDays).map(([day, checked]) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={checked}
                          onCheckedChange={(value) =>
                            setWorkingDays((prev) => ({
                              ...prev,
                              [day]: value as boolean,
                            }))
                          }
                        />
                        <Label
                          htmlFor={day}
                          className="cursor-pointer capitalize"
                        >
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Working Hours</Label>
                  <div className="flex items-center gap-4">
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">to</span>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10 mt-auto md:justify-between">
        <ProgressBar currentStep={4} />

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            onClick={saveAsDraft}
            className="w-full sm:w-auto"
          >
            Save As Draft
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSubmitting || !canProceed()}
            className="w-full sm:w-auto"
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}
