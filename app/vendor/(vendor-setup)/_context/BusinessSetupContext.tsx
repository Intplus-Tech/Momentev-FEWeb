"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import type { BusinessInfoFormData } from "../_schemas/businessInfoSchema";
import type { ServiceCategoriesFormData } from "../_schemas/serviceCategoriesSchema";
import type { PricingStructureFormData } from "../_schemas/pricingStructureSchema";

// Types
export interface UploadedFile {
  name: string;
  size: number;
  progress: number;
}

interface DocumentFiles {
  identification: File[];
  registration: File[];
  license: File[];
}

interface UploadedFilesMetadata {
  identification: UploadedFile[];
  registration: UploadedFile[];
  license: UploadedFile[];
}

interface BusinessSetupState {
  // Step Management
  currentStep: number;
  expandedSection: number | null;
  completedSections: Set<number>;

  // Form Data
  businessInfo: Partial<BusinessInfoFormData> | null;
  documents: DocumentFiles;
  uploadedFilesMetadata: UploadedFilesMetadata;
  serviceCategories: Partial<ServiceCategoriesFormData> | null;
  pricingStructure: Partial<PricingStructureFormData> | null;

  // Validation
  isBusinessInfoValid: boolean;
  isDocumentsValid: boolean;
  isServiceCategoriesValid: boolean;
  isPricingStructureValid: boolean;

  // UI State
  isSubmitting: boolean;
  errors: Record<string, string>;
}

interface BusinessSetupContextType extends BusinessSetupState {
  // Navigation
  setCurrentStep: (step: number) => void;
  setExpandedSection: (section: number | null) => void;
  toggleSection: (section: number) => void;
  goToNextSection: () => void;
  goToPreviousSection: () => void;

  // Data Management
  updateBusinessInfo: (data: Partial<BusinessInfoFormData>) => void;
  updateDocuments: (type: keyof DocumentFiles, files: File[]) => void;
  updateUploadedFilesMetadata: (
    type: keyof UploadedFilesMetadata,
    files: UploadedFile[],
  ) => void;
  updateServiceCategories: (data: Partial<ServiceCategoriesFormData>) => void;
  updatePricingStructure: (data: Partial<PricingStructureFormData>) => void;
  setBusinessInfoValid: (valid: boolean) => void;
  setDocumentsValid: (valid: boolean) => void;
  setServiceCategoriesValid: (valid: boolean) => void;
  setPricingStructureValid: (valid: boolean) => void;

  // Actions
  markSectionComplete: (section: number) => void;
  saveAsDraft: () => void;
  loadDraft: () => void;
  handleSaveAndContinue: () => Promise<void>;
  continueLater: () => void;

  // State setters
  setIsSubmitting: (submitting: boolean) => void;
}

const BusinessSetupContext = createContext<
  BusinessSetupContextType | undefined
>(undefined);

const DRAFT_KEY = "vendor-business-setup-draft";
const TOTAL_SECTIONS = 2;

export function BusinessSetupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Initialize state
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set(),
  );
  const [businessInfo, setBusinessInfo] =
    useState<Partial<BusinessInfoFormData> | null>(null);
  const [documents, setDocuments] = useState<DocumentFiles>({
    identification: [],
    registration: [],
    license: [],
  });
  const [uploadedFilesMetadata, setUploadedFilesMetadata] =
    useState<UploadedFilesMetadata>({
      identification: [],
      registration: [],
      license: [],
    });
  const [serviceCategories, setServiceCategories] =
    useState<Partial<ServiceCategoriesFormData> | null>(null);
  const [pricingStructure, setPricingStructure] =
    useState<Partial<PricingStructureFormData> | null>(null);
  const [isBusinessInfoValid, setIsBusinessInfoValid] = useState(false);
  const [isDocumentsValid, setIsDocumentsValid] = useState(false);
  const [isServiceCategoriesValid, setIsServiceCategoriesValid] =
    useState(false);
  const [isPricingStructureValid, setIsPricingStructureValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.businessInfo) setBusinessInfo(draft.businessInfo);
        if (draft.completedSections) {
          setCompletedSections(new Set(draft.completedSections));
        }
        if (draft.expandedSection !== undefined) {
          setExpandedSection(draft.expandedSection);
        }
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  }, []);

  const saveAsDraft = useCallback(() => {
    const draft = {
      businessInfo,
      documents,
      completedSections: Array.from(completedSections),
      expandedSection,
      currentStep,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    console.log("✅ Draft saved successfully");
  }, [
    businessInfo,
    documents,
    completedSections,
    expandedSection,
    currentStep,
  ]);

  const toggleSection = useCallback((section: number) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  const goToNextSection = useCallback(() => {
    if (expandedSection !== null && expandedSection < TOTAL_SECTIONS) {
      setExpandedSection(expandedSection + 1);
    }
  }, [expandedSection]);

  const goToPreviousSection = useCallback(() => {
    if (expandedSection !== null && expandedSection > 1) {
      setExpandedSection(expandedSection - 1);
    }
  }, [expandedSection]);

  const updateBusinessInfo = useCallback(
    (data: Partial<BusinessInfoFormData>) => {
      setBusinessInfo((prev) => ({ ...prev, ...data }));
    },
    [],
  );

  const updateDocuments = useCallback(
    (type: keyof DocumentFiles, files: File[]) => {
      setDocuments((prev) => ({ ...prev, [type]: files }));
    },
    [],
  );

  const updateUploadedFilesMetadata = useCallback(
    (type: keyof UploadedFilesMetadata, files: UploadedFile[]) => {
      setUploadedFilesMetadata((prev) => ({ ...prev, [type]: files }));
    },
    [],
  );

  const updateServiceCategories = useCallback(
    (data: Partial<ServiceCategoriesFormData>) => {
      setServiceCategories((prev) => ({ ...prev, ...data }));
    },
    [],
  );

  const updatePricingStructure = useCallback(
    (data: Partial<PricingStructureFormData>) => {
      setPricingStructure((prev) => ({ ...prev, ...data }));
    },
    [],
  );

  const markSectionComplete = useCallback((section: number) => {
    setCompletedSections((prev) => new Set(prev).add(section));
  }, []);

  const handleSaveAndContinue = useCallback(async () => {
    if (expandedSection === null) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // STEP 1: Business Setup
      if (currentStep === 1) {
        if (expandedSection === 1) {
          if (!isBusinessInfoValid) {
            setErrors({
              general:
                "Please complete all required business information fields.",
            });
            setIsSubmitting(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("✅ Step 1 - Section 1 validated", businessInfo);
          markSectionComplete(1);
          setExpandedSection(2);
        } else if (expandedSection === 2) {
          if (!isDocumentsValid) {
            setErrors({ general: "Please upload all required documents." });
            setIsSubmitting(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("🎉 Step 1 Complete:", { businessInfo, documents });
          markSectionComplete(2);
          localStorage.removeItem(DRAFT_KEY);
          router.push("/vendor/service-setup");
        }
      }
      // STEP 2: Service Setup
      else if (currentStep === 2) {
        if (expandedSection === 1) {
          if (!isServiceCategoriesValid) {
            setErrors({
              general: "Please complete all required service category fields.",
            });
            setIsSubmitting(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("✅ Step 2 - Section 1 validated", serviceCategories);
          markSectionComplete(1);
          setExpandedSection(2);
        } else if (expandedSection === 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("🎉 Step 2 Complete:", { serviceCategories });
          markSectionComplete(2);

          // Navigate to Step 3
          console.log("→ Navigating to Step 3 (Payment Setup)...");
          router.push("/vendor/payment-setup");
        }
      }
      // STEP 3: Payment Configuration
      else if (currentStep === 3) {
        if (expandedSection === 1) {
          // Payment model selection
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("✅ Step 3 - Section 1 validated");
          markSectionComplete(1);
          setExpandedSection(2);
        } else if (expandedSection === 2) {
          // Stripe connection
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("✅ Step 3 - Section 2 validated");
          markSectionComplete(2);
          setExpandedSection(3);
        } else if (expandedSection === 3) {
          // Commission agreement
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("🎉 Step 3 Complete");
          markSectionComplete(3);

          // Navigate to Step 4
          console.log("→ Navigating to Step 4 (Profile Setup)...");
          router.push("/vendor/profile-setup");
        }
      }
      // STEP 4: Profile Completion
      else if (currentStep === 4) {
        if (expandedSection === 1) {
          // Media upload
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("✅ Step 4 - Section 1 validated");
          markSectionComplete(1);
          setExpandedSection(2);
        } else if (expandedSection === 2) {
          // Availability settings
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("🎉 Step 4 Complete");
          markSectionComplete(2);

          // Navigate to final review page
          console.log("→ Navigating to Setup Review...");
          router.push("/vendor/setup-review");
        }
      }
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    expandedSection,
    currentStep,
    isBusinessInfoValid,
    isDocumentsValid,
    isServiceCategoriesValid,
    businessInfo,
    documents,
    serviceCategories,
    markSectionComplete,
    setExpandedSection,
    router,
  ]);

  const continueLater = useCallback(() => {
    saveAsDraft();
    router.push("/vendor/dashboard");
  }, [saveAsDraft, router]);

  const value: BusinessSetupContextType = {
    // State
    currentStep,
    expandedSection,
    completedSections,
    businessInfo,
    documents,
    uploadedFilesMetadata,
    serviceCategories,
    pricingStructure,
    isBusinessInfoValid,
    isDocumentsValid,
    isServiceCategoriesValid,
    isPricingStructureValid,
    isSubmitting,
    errors,

    // Navigation
    setCurrentStep,
    setExpandedSection,
    toggleSection,
    goToNextSection,
    goToPreviousSection,

    // Data Management
    updateBusinessInfo,
    updateDocuments,
    updateUploadedFilesMetadata,
    updateServiceCategories,
    updatePricingStructure,
    setBusinessInfoValid: setIsBusinessInfoValid,
    setDocumentsValid: setIsDocumentsValid,
    setServiceCategoriesValid: setIsServiceCategoriesValid,
    setPricingStructureValid: setIsPricingStructureValid,

    // Actions
    markSectionComplete,
    saveAsDraft,
    loadDraft,
    handleSaveAndContinue,
    continueLater,
    setIsSubmitting,
  };

  return (
    <BusinessSetupContext.Provider value={value}>
      {children}
    </BusinessSetupContext.Provider>
  );
}

export function useBusinessSetup() {
  const context = useContext(BusinessSetupContext);
  if (!context) {
    throw new Error(
      "useBusinessSetup must be used within BusinessSetupProvider",
    );
  }
  return context;
}
