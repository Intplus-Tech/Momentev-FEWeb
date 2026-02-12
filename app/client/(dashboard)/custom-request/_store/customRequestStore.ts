import type { ServiceCategory, ServiceSpecialty } from "@/types/service";
import type { UploadedFile } from "@/lib/actions/upload";
import type { CustomerRequest } from "@/types/custom-request";
import { create } from "zustand";

export interface EventBasicData {
  eventDate: string; // ISO datetime string (startDate)
  endDate?: string; // ISO datetime string (optional)
  guestCount: number;
  location: string;
  eventName: string;
  eventDescription: string;
}

export interface VendorNeedsData {
  selectedCategory: ServiceCategory | null;
  selectedSpecialties: ServiceSpecialty[];
}

export interface BudgetPlanningData {
  budgetPerSpecialty: Record<string, number>; // key: specialtyId
  totalBudget: number;
}

export interface AdditionalDetailsData {
  uploadedFiles: UploadedFile[];
}

interface CustomRequestStore {
  currentStep: number;
  expandedSection: number | null;
  completedSections: Set<string>;
  isSubmitting: boolean;
  errors: Record<string, string>;
  draftId: string | null;

  // Form data
  eventBasic: EventBasicData | null;
  vendorNeeds: VendorNeedsData | null;
  budgetPlanning: BudgetPlanningData | null;
  additionalDetails: AdditionalDetailsData | null;

  // Validation flags
  isEventBasicValid: boolean;
  isVendorNeedsValid: boolean;
  isBudgetPlanningValid: boolean;
  isAdditionalDetailsValid: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setExpandedSection: (section: number | null) => void;
  toggleSection: (section: number) => void;
  markSectionComplete: (step: number, section: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;

  // Form data setters
  setEventBasic: (data: EventBasicData) => void;
  setVendorNeeds: (data: VendorNeedsData) => void;
  setBudgetPlanning: (data: BudgetPlanningData) => void;
  setAdditionalDetails: (data: AdditionalDetailsData) => void;

  // Validation setters
  setIsEventBasicValid: (isValid: boolean) => void;
  setIsVendorNeedsValid: (isValid: boolean) => void;
  setIsBudgetPlanningValid: (isValid: boolean) => void;
  setIsAdditionalDetailsValid: (isValid: boolean) => void;

  // Draft management
  setDraftId: (id: string | null) => void;
  loadFromDraft: (request: CustomerRequest) => void;

  // Reset
  reset: () => void;
}

export const useCustomRequestStore = create<CustomRequestStore>((set) => ({
  currentStep: 1,
  expandedSection: null,
  completedSections: new Set(),
  isSubmitting: false,
  errors: {},
  draftId: null,

  eventBasic: null,
  vendorNeeds: null,
  budgetPlanning: null,
  additionalDetails: null,

  isEventBasicValid: false,
  isVendorNeedsValid: false,
  isBudgetPlanningValid: false,
  isAdditionalDetailsValid: false,

  setCurrentStep: (step) => set({ currentStep: step }),
  setExpandedSection: (section) => set({ expandedSection: section }),
  toggleSection: (section) =>
    set((state) => ({
      expandedSection: state.expandedSection === section ? null : section,
    })),
  markSectionComplete: (step, section) =>
    set((state) => {
      const newCompleted = new Set(state.completedSections);
      newCompleted.add(`step${step}-section${section}`);
      return { completedSections: newCompleted };
    }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setErrors: (errors) => set({ errors }),

  setEventBasic: (data) => set({ eventBasic: data }),
  setVendorNeeds: (data) => set({ vendorNeeds: data }),
  setBudgetPlanning: (data) => set({ budgetPlanning: data }),
  setAdditionalDetails: (data) => set({ additionalDetails: data }),

  setIsEventBasicValid: (isValid) => set({ isEventBasicValid: isValid }),
  setIsVendorNeedsValid: (isValid) => set({ isVendorNeedsValid: isValid }),
  setIsBudgetPlanningValid: (isValid) => set({ isBudgetPlanningValid: isValid }),
  setIsAdditionalDetailsValid: (isValid) => set({ isAdditionalDetailsValid: isValid }),

  setDraftId: (id) => set({ draftId: id }),

  loadFromDraft: (request) => {
    const eventBasic: EventBasicData = {
      eventDate: request.eventDetails?.startDate || "",
      endDate: request.eventDetails?.endDate || "",
      guestCount: request.eventDetails?.guestCount || 0,
      location: request.eventDetails?.location || "",
      eventName: request.eventDetails?.title || "",
      eventDescription: request.eventDetails?.description || "",
    };

    // Parse specialties
    const selectedSpecialties: ServiceSpecialty[] = [];
    const budgetPerSpecialty: Record<string, number> = {};
    let totalBudget = 0;

    for (const alloc of request.budgetAllocations || []) {
      const specId =
        typeof alloc.serviceSpecialtyId === "string"
          ? alloc.serviceSpecialtyId
          : alloc.serviceSpecialtyId._id;

      budgetPerSpecialty[specId] = alloc.budgetedAmount;
      totalBudget += alloc.budgetedAmount;

      if (typeof alloc.serviceSpecialtyId !== "string") {
        selectedSpecialties.push(
          alloc.serviceSpecialtyId as unknown as ServiceSpecialty,
        );
      }
    }

    const vendorNeeds: VendorNeedsData = {
      selectedCategory:
        request.serviceCategoryId && typeof request.serviceCategoryId === "object"
          ? ({
            _id: request.serviceCategoryId._id,
            name: request.serviceCategoryId.name,
          } as ServiceCategory)
          : null,
      selectedSpecialties,
    };

    const budgetPlanning: BudgetPlanningData = {
      budgetPerSpecialty,
      totalBudget,
    };

    const additionalDetails: AdditionalDetailsData = {
      uploadedFiles: (request.attachments || []).map((att) => ({
        _id: att._id,
        url: att.url,
        originalName: att.originalName,
        mimeType: att.mimeType,
        size: att.size,
        provider: att.provider,
      })),
    };

    set({
      draftId: request._id,
      eventBasic,
      vendorNeeds,
      budgetPlanning,
      additionalDetails,
      isEventBasicValid: true,
      isVendorNeedsValid: !!vendorNeeds.selectedCategory,
      isBudgetPlanningValid: totalBudget > 0,
      isAdditionalDetailsValid: true,
      currentStep: 1,
    });
  },

  reset: () =>
    set({
      currentStep: 1,
      expandedSection: null,
      completedSections: new Set(),
      isSubmitting: false,
      errors: {},
      draftId: null,
      eventBasic: null,
      vendorNeeds: null,
      budgetPlanning: null,
      additionalDetails: null,
      isEventBasicValid: false,
      isVendorNeedsValid: false,
      isBudgetPlanningValid: false,
      isAdditionalDetailsValid: false,
    }),
}));
