import { create } from 'zustand';

export interface EventBasicData {
  eventType: string;
  otherEventType?: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  guestCount: number;
  location: string;
  eventName: string;
  eventDescription: string;
}

export interface VendorNeedsData {
  selectedCategories: string[];
  selectedVendors?: Record<string, string[]>;
  specificRequirements: Record<string, string>;
}

export interface BudgetPlanningData {
  budgetPerVendor: Record<string, number>;
  totalBudget: number;
}

export interface AdditionalDetailsData {
  inspirationLinks: string[];
  uploadedFiles: { id: string; url: string; name: string }[];
}

interface CustomRequestStore {
  currentStep: number;
  expandedSection: number | null;
  completedSections: Set<string>;
  isSubmitting: boolean;
  errors: Record<string, string>;

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

  // Reset
  reset: () => void;
}

export const useCustomRequestStore = create<CustomRequestStore>((set) => ({
  currentStep: 1,
  expandedSection: null,
  completedSections: new Set(),
  isSubmitting: false,
  errors: {},

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

  reset: () =>
    set({
      currentStep: 1,
      expandedSection: null,
      completedSections: new Set(),
      isSubmitting: false,
      errors: {},
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
