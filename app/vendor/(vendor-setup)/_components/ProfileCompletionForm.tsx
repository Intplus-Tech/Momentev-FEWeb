"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useBusinessSetup } from "../_context/BusinessSetupContext";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const {
    expandedSection,
    completedSections,
    isSubmitting,
    toggleSection,
    setExpandedSection,
    handleSaveAndContinue,
    saveAsDraft,
    markSectionComplete,
  } = useBusinessSetup();

  // Section 1: Media Upload
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [portfolioPhotos, setPortfolioPhotos] = useState<File[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

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

  // Auto-expand Section 1 on mount
  useEffect(() => {
    if (expandedSection === null) {
      setExpandedSection(1);
    }
  }, []);

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
    }
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPortfolioPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const removePortfolioPhoto = (index: number) => {
    setPortfolioPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMediaUpload = () => {
    markSectionComplete(1);
    setExpandedSection(2);
  };

  const canProceedSection1 = () => {
    return profilePhoto && coverPhoto && portfolioPhotos.length >= 5;
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

  const isSection2Locked = !completedSections.has(1);

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
              isCompleted={completedSections.has(1)}
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
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    {profilePhoto ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {profilePhoto.name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProfilePhoto(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag your file(s) or{" "}
                          <label className="text-primary cursor-pointer hover:underline">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png"
                              onChange={handleProfilePhotoUpload}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload JPG/PNG • Recommended: 1500×500px
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Photo */}
                <div>
                  <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                    <h3 className="text-sm">
                      Cover Photo ( Showcases your work )
                    </h3>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    {coverPhoto ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{coverPhoto.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCoverPhoto(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag your file(s) or{" "}
                          <label className="text-primary cursor-pointer hover:underline">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png"
                              onChange={handleCoverPhotoUpload}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload JPG/PNG • Recommended: 1500×500px
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio Gallery */}
                <div>
                  <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                    <h3 className="text-sm">
                      Portfolio Gallery ( Add at least 5 photos of your best
                      work )
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {portfolioPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                            <span className="text-xs text-muted-foreground">
                              IMG
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{photo.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(photo.size / 1024).toFixed(0)}KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePortfolioPhoto(index)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    {portfolioPhotos.length < 5 && (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <label className="cursor-pointer">
                          <div className="space-y-2">
                            <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                            <p className="text-sm text-primary hover:underline">
                              Upload Image
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png"
                            multiple
                            onChange={handlePortfolioUpload}
                          />
                        </label>
                      </div>
                    )}
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
              isCompleted={completedSections.has(2)}
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
        <ProgressBar />

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
