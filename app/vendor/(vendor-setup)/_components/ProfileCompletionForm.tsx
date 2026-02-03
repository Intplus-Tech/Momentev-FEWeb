"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { Plus, Trash2 } from "lucide-react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUploadCard } from "./FileUploadCard";
import { StepSection } from "./StepSection";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UploadedFile } from "@/lib/actions/upload";
import { submitVendorProfile } from "@/lib/actions/vendor-profile";
import { SOCIAL_MEDIA_PLATFORMS } from "../_schemas/profileCompletionSchema";
import { SubmissionOverlay } from "./SubmissionOverlay";

export function ProfileCompletionForm() {
  const router = useRouter();

  // Zustand selective subscriptions
  const isSubmitting = useVendorSetupStore((state) => state.isSubmitting);
  const expandedSection = useVendorSetupStore((state) => state.expandedSection);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );

  // Actions
  const markSectionComplete = useVendorSetupStore(
    (state) => state.markSectionComplete,
  );
  const setIsSubmitting = useVendorSetupStore((state) => state.setIsSubmitting);
  const setErrors = useVendorSetupStore((state) => state.setErrors);
  const setExpandedSection = useVendorSetupStore(
    (state) => state.setExpandedSection,
  );
  const toggleSection = useVendorSetupStore((state) => state.toggleSection);

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

  // Social media links
  const socialMediaLinks = useVendorSetupStore(
    (state) => state.socialMediaLinks,
  );
  const addSocialMediaLink = useVendorSetupStore(
    (state) => state.addSocialMediaLink,
  );
  const updateSocialMediaLink = useVendorSetupStore(
    (state) => state.updateSocialMediaLink,
  );
  const removeSocialMediaLink = useVendorSetupStore(
    (state) => state.removeSocialMediaLink,
  );

  // Local state for new link form
  const [newPlatform, setNewPlatform] = useState("");
  const [customPlatformName, setCustomPlatformName] = useState("");
  const [newLink, setNewLink] = useState("");

  // Initialize expanded section on mount
  React.useEffect(() => {
    if (expandedSection === null) {
      setExpandedSection(1);
    }
  }, [expandedSection, setExpandedSection]);

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

  // Social media link handlers
  const handleAddSocialLink = () => {
    if (!newPlatform || !newLink) {
      toast.error("Please select a platform and enter a link");
      return;
    }

    // Validate URL
    try {
      new URL(newLink);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    const platformName =
      newPlatform === "custom" ? customPlatformName : newPlatform;
    if (!platformName) {
      toast.error("Please enter a custom platform name");
      return;
    }

    // Check for duplicates
    if (
      socialMediaLinks.some(
        (l) => l.name.toLowerCase() === platformName.toLowerCase(),
      )
    ) {
      toast.error("This platform has already been added");
      return;
    }

    addSocialMediaLink({ name: platformName, link: newLink });
    setNewPlatform("");
    setCustomPlatformName("");
    setNewLink("");
    // toast.success("Social media link added");
  };

  const getPlaceholder = () => {
    const platform = SOCIAL_MEDIA_PLATFORMS.find(
      (p) => p.value === newPlatform,
    );
    return platform?.placeholder || "https://...";
  };

  // Check if form can proceed
  const canProceedSection1 = () => {
    return profilePhoto && coverPhoto && portfolioImages.length >= 5;
  };

  // Section 2 is optional, so always can proceed
  const canProceedSection2 = () => true;

  const canProceed = () => {
    if (expandedSection === 1) return canProceedSection1();
    if (expandedSection === 2) return canProceedSection2();
    return false;
  };

  // Handle section 1 save and continue
  const handleSaveSection1 = () => {
    if (!canProceedSection1()) {
      toast.error("Please upload all required photos");
      return;
    }
    markSectionComplete(4, 1);
    setExpandedSection(2);
  };

  // Handle final save and continue to review
  const handleSaveAndContinue = async () => {
    // If on section 1, just move to section 2
    if (expandedSection === 1) {
      handleSaveSection1();
      return;
    }

    // Section 2 - final submission
    if (!canProceedSection1()) {
      toast.error("Please complete Section 1 first");
      setExpandedSection(1);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log("🚀 Submitting vendor profile...");
      toast.loading("Saving profile...");

      const result = await submitVendorProfile({
        profilePhoto: profilePhoto!.id,
        coverPhoto: coverPhoto!.id,
        portfolioGallery: portfolioImages.map((img) => img.id),
        socialMediaLinks:
          socialMediaLinks.length > 0 ? socialMediaLinks : undefined,
      });

      toast.dismiss();

      if (!result.success) {
        setErrors({ general: result.error || "Failed to save profile" });
        toast.error(result.error || "Failed to save profile");
        return;
      }

      console.log("🎉 Step 4 Complete - Profile saved!");
      markSectionComplete(4, 2);
      toast.success("Profile setup complete!");
      router.push("/vendor/setup-review");
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return "Saving...";
    if (expandedSection === 1) return "Save & Continue";
    return "Complete Setup";
  };

  const isSection2Locked = !completedSections.has("step4-section1");

  return (
    <>
      <SubmissionOverlay
        isVisible={isSubmitting}
        message="Submitting profile..."
      />
      <div className="space-y-6 flex flex-col min-h-[70vh]">
        <div className="">
          {/* Step Title */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold">
              Profile Completion
            </h2>
            <p className="text-sm text-muted-foreground">
              Final touches before you go live
            </p>
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
                <div className="px-6 pb-6 space-y-8">
                  {/* Profile Photo */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Profile Photo</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Professional headshot or logo • JPG, PNG, WebP up to
                        10MB
                      </p>
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
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Cover Photo</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Showcase your best work • Recommended 1200x400px
                      </p>
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
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Portfolio Gallery</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add at least 5 photos of your best work (
                        {portfolioImages.length}/5)
                      </p>
                    </div>

                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const uploadedFile = portfolioImages[index];

                        if (uploadedFile) {
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

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSaveSection1}
                      disabled={!canProceedSection1()}
                      className="w-full sm:w-auto"
                    >
                      Save & Continue to Social Links
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Social Media Links */}
            <div className="border-2 rounded-lg">
              <StepSection
                number={2}
                title="Social Media Links"
                isCompleted={completedSections.has("step4-section2")}
                isExpanded={expandedSection === 2}
                onToggle={() => !isSection2Locked && toggleSection(2)}
                isLocked={isSection2Locked}
              />
              {expandedSection === 2 && (
                <div className="px-6 pb-6 space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Add your social media profiles to help clients find you
                    (optional)
                  </p>

                  {/* Existing Links */}
                  {socialMediaLinks.length > 0 && (
                    <div className="space-y-3">
                      {socialMediaLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium capitalize">
                              {link.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.link}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSocialMediaLink(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Link */}
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <p className="text-sm font-medium">
                      Add a social media link
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Select
                          value={newPlatform}
                          onValueChange={setNewPlatform}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOCIAL_MEDIA_PLATFORMS.map((platform) => (
                              <SelectItem
                                key={platform.value}
                                value={platform.value}
                              >
                                {platform.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {newPlatform === "custom" && (
                          <Input
                            placeholder="Enter platform name"
                            value={customPlatformName}
                            onChange={(e) =>
                              setCustomPlatformName(e.target.value)
                            }
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder={getPlaceholder()}
                          value={newLink}
                          onChange={(e) => setNewLink(e.target.value)}
                          type="url"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSocialLink}
                      disabled={!newPlatform || !newLink}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Link
                    </Button>
                  </div>

                  {socialMediaLinks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No social media links added yet. This section is optional.
                    </p>
                  )}
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
              onClick={handleSaveAndContinue}
              disabled={isSubmitting || !canProceed()}
              className="w-full sm:w-auto"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
