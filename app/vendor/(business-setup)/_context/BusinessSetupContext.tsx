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

// Types
interface DocumentFiles {
  identification: File[];
  registration: File[];
  license: File[];
}

interface BusinessSetupState {
  // Step Management
  currentStep: number;
  expandedSection: number | null;
  completedSections: Set<number>;

  // Form Data
  businessInfo: Partial<BusinessInfoFormData> | null;
  documents: DocumentFiles;

  // Validation
  isBusinessInfoValid: boolean;
  isDocumentsValid: boolean;

  // UI State
  isSubmitting: boolean;
  errors: Record<string, string>;
}

interface BusinessSetupContextType extends BusinessSetupState {
  // Navigation
  setCurrentStep: (step: number) => void;
  toggleSection: (section: number) => void;
  goToNextSection: () => void;
  goToPreviousSection: () => void;

  // Data Management
  updateBusinessInfo: (data: Partial<BusinessInfoFormData>) => void;
  updateDocuments: (type: keyof DocumentFiles, files: File[]) => void;
  setBusinessInfoValid: (valid: boolean) => void;
  setDocumentsValid: (valid: boolean) => void;

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
  const [isBusinessInfoValid, setIsBusinessInfoValid] = useState(false);
  const [isDocumentsValid, setIsDocumentsValid] = useState(false);
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

  const markSectionComplete = useCallback((section: number) => {
    setCompletedSections((prev) => new Set(prev).add(section));
  }, []);

  const handleSaveAndContinue = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Validate both sections
      if (!isBusinessInfoValid) {
        setErrors({
          general: "Please complete all required business information fields.",
        });
        setIsSubmitting(false);
        return;
      }

      if (!isDocumentsValid) {
        setErrors({ general: "Please upload all required documents." });
        setIsSubmitting(false);
        return;
      }

      // Both sections valid - submit everything
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save both business info and documents together
      console.log("✅ Business information saved", businessInfo);
      console.log("✅ Documents uploaded", documents);

      // Mark both sections as complete
      markSectionComplete(1);
      markSectionComplete(2);

      // Clear draft on successful completion
      localStorage.removeItem(DRAFT_KEY);

      // Show success message
      console.log("🎉 Business setup completed!");

      // TODO: Navigate to next step or show success page
      // router.push("/vendor/business-setup/service-setup");
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isBusinessInfoValid,
    isDocumentsValid,
    businessInfo,
    documents,
    markSectionComplete,
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
    isBusinessInfoValid,
    isDocumentsValid,
    isSubmitting,
    errors,

    // Navigation
    setCurrentStep,
    toggleSection,
    goToNextSection,
    goToPreviousSection,

    // Data Management
    updateBusinessInfo,
    updateDocuments,
    setBusinessInfoValid: setIsBusinessInfoValid,
    setDocumentsValid: setIsDocumentsValid,

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
