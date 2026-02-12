import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BusinessInfoFormData } from '../_schemas/businessInfoSchema';
import type { ServiceCategoriesFormData } from '../_schemas/serviceCategoriesSchema';
import type { PricingStructureFormData } from '../_schemas/pricingStructureSchema';
import type { PaymentConfigurationFormData } from '../_schemas/paymentConfigurationSchema';
import type { ProfileCompletionFormData } from '../_schemas/profileCompletionSchema';

// File metadata type for persistence
export interface UploadedFileMetadata {
  id: string;
  url: string;
  name: string;
}

interface VendorSetupState {
  // Step Management
  currentStep: number;
  expandedSection: number | null;
  completedSections: Set<string>;

  // Form Data
  businessInfo: Partial<BusinessInfoFormData> | null;
  serviceCategories: Partial<ServiceCategoriesFormData> | null;
  pricingStructure: Partial<PricingStructureFormData> | null;
  paymentConfiguration: Partial<PaymentConfigurationFormData> | null;
  profileCompletion: Partial<ProfileCompletionFormData> | null;

  // File Upload Metadata (ID + URL + name for persistence)
  documents: {
    identification: UploadedFileMetadata[];
    registration: UploadedFileMetadata[];
    license: UploadedFileMetadata[];
  };
  profilePhoto: UploadedFileMetadata | null;
  coverPhoto: UploadedFileMetadata | null;
  portfolioImages: UploadedFileMetadata[];

  // Social Media Links
  socialMediaLinks: { name: string; link: string }[];

  // Legacy getters for backward compatibility
  get documentIds(): {
    identification: string[];
    registration: string[];
    license: string[];
  };
  get profilePhotoId(): string | null;
  get coverPhotoId(): string | null;
  get portfolioImageIds(): string[];

  // Validation Flags
  isBusinessInfoValid: boolean;
  isDocumentsValid: boolean;
  isServiceCategoriesValid: boolean;
  isPricingStructureValid: boolean;
  isPaymentConfigurationValid: boolean;
  isProfileCompletionValid: boolean;

  // UI State
  isSubmitting: boolean;
  errors: Record<string, string>;
  activeUploads: number; // Track number of ongoing uploads

  // Actions - Step Management
  setCurrentStep: (step: number) => void;
  setExpandedSection: (section: number | null) => void;
  toggleSection: (section: number) => void;
  markSectionComplete: (step: number, section: number) => void; // Updated to include step
  goToNextSection: () => void;
  goToPreviousSection: () => void;

  // Actions - Form Data Updates
  updateBusinessInfo: (data: Partial<BusinessInfoFormData>) => void;
  updateServiceCategories: (data: Partial<ServiceCategoriesFormData>) => void;
  updatePricingStructure: (data: Partial<PricingStructureFormData>) => void;
  updatePaymentConfiguration: (data: Partial<PaymentConfigurationFormData>) => void;
  updateProfileCompletion: (data: Partial<ProfileCompletionFormData>) => void;

  // Actions - Validation
  setBusinessInfoValid: (valid: boolean) => void;
  setDocumentsValid: (valid: boolean) => void;
  setServiceCategoriesValid: (valid: boolean) => void;
  setPricingStructureValid: (valid: boolean) => void;
  setPaymentConfigurationValid: (valid: boolean) => void;
  setProfileCompletionValid: (valid: boolean) => void;

  // Actions - File Uploads (now with full metadata)
  addDocument: (type: keyof VendorSetupState['documents'], metadata: UploadedFileMetadata) => void;
  removeDocument: (type: keyof VendorSetupState['documents'], id: string) => void;
  setProfilePhoto: (metadata: UploadedFileMetadata | null) => void;
  setCoverPhoto: (metadata: UploadedFileMetadata | null) => void;
  addPortfolioImage: (metadata: UploadedFileMetadata) => void;
  removePortfolioImage: (id: string) => void;

  // Actions - Social Media Links
  addSocialMediaLink: (link: { name: string; link: string }) => void;
  updateSocialMediaLink: (index: number, link: { name: string; link: string }) => void;
  removeSocialMediaLink: (index: number) => void;
  setSocialMediaLinks: (links: { name: string; link: string }[]) => void;

  // Legacy actions for backward compatibility
  addDocumentId: (type: string, id: string) => void;
  removeDocumentId: (type: string, id: string) => void;
  setProfilePhotoId: (id: string | null) => void;
  setCoverPhotoId: (id: string | null) => void;
  addPortfolioImageId: (id: string) => void;
  removePortfolioImageId: (id: string) => void;

  // Actions - UI State
  setIsSubmitting: (submitting: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  incrementUpload: () => void; // Track upload start
  decrementUpload: () => void; // Track upload end
  clearDraft: () => void;
}

const TOTAL_SECTIONS_PER_STEP = 2; // Most steps have 2 sections

export const useVendorSetupStore = create<VendorSetupState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      expandedSection: null,
      completedSections: new Set(),
      businessInfo: null,
      serviceCategories: null,
      pricingStructure: null,
      paymentConfiguration: null,
      profileCompletion: null,
      documents: { identification: [], registration: [], license: [] },
      profilePhoto: null,
      coverPhoto: null,
      portfolioImages: [],
      socialMediaLinks: [],
      isBusinessInfoValid: false,
      isDocumentsValid: false,
      isServiceCategoriesValid: false,
      isPricingStructureValid: false,
      isPaymentConfigurationValid: false,
      isProfileCompletionValid: false,
      isSubmitting: false,
      errors: {},
      activeUploads: 0,

      // Getters for backward compatibility
      get documentIds() {
        const state = get();
        return {
          identification: state.documents.identification.map(f => f.id),
          registration: state.documents.registration.map(f => f.id),
          license: state.documents.license.map(f => f.id),
        };
      },
      get profilePhotoId() {
        return get().profilePhoto?.id || null;
      },
      get coverPhotoId() {
        return get().coverPhoto?.id || null;
      },
      get portfolioImageIds() {
        return get().portfolioImages.map(img => img.id);
      },

      // Step Management Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      setExpandedSection: (section) => set({ expandedSection: section }),

      toggleSection: (section) => set((state) => ({
        expandedSection: state.expandedSection === section ? null : section,
      })),

      markSectionComplete: (step, section) => set((state) => ({
        completedSections: new Set(state.completedSections).add(`step${step}-section${section}`),
      })),

      goToNextSection: () => set((state) => {
        if (state.expandedSection !== null && state.expandedSection < TOTAL_SECTIONS_PER_STEP) {
          return { expandedSection: state.expandedSection + 1 };
        }
        return state;
      }),

      goToPreviousSection: () => set((state) => {
        if (state.expandedSection !== null && state.expandedSection > 1) {
          return { expandedSection: state.expandedSection - 1 };
        }
        return state;
      }),

      // Form Data Update Actions
      updateBusinessInfo: (data) => set((state) => ({
        businessInfo: { ...state.businessInfo, ...data },
      })),

      updateServiceCategories: (data) => set((state) => ({
        serviceCategories: { ...state.serviceCategories, ...data },
      })),

      updatePricingStructure: (data) => set((state) => ({
        pricingStructure: { ...state.pricingStructure, ...data },
      })),

      updatePaymentConfiguration: (data) => set((state) => ({
        paymentConfiguration: { ...state.paymentConfiguration, ...data },
      })),

      updateProfileCompletion: (data) => set((state) => ({
        profileCompletion: { ...state.profileCompletion, ...data },
      })),

      // Validation Actions
      setBusinessInfoValid: (valid) => set({ isBusinessInfoValid: valid }),
      setDocumentsValid: (valid) => set({ isDocumentsValid: valid }),
      setServiceCategoriesValid: (valid) => set({ isServiceCategoriesValid: valid }),
      setPricingStructureValid: (valid) => set({ isPricingStructureValid: valid }),
      setPaymentConfigurationValid: (valid) => set({ isPaymentConfigurationValid: valid }),
      setProfileCompletionValid: (valid) => set({ isProfileCompletionValid: valid }),

      // File Upload Actions - New metadata-based
      addDocument: (type, metadata) => set((state) => ({
        documents: {
          ...state.documents,
          [type]: [...state.documents[type], metadata],
        },
      })),

      removeDocument: (type, id) => set((state) => ({
        documents: {
          ...state.documents,
          [type]: state.documents[type].filter((doc) => doc.id !== id),
        },
      })),

      setProfilePhoto: (metadata) => set({ profilePhoto: metadata }),
      setCoverPhoto: (metadata) => set({ coverPhoto: metadata }),

      addPortfolioImage: (metadata) => set((state) => ({
        portfolioImages: [...state.portfolioImages, metadata],
      })),

      removePortfolioImage: (id) => set((state) => ({
        portfolioImages: state.portfolioImages.filter((img) => img.id !== id),
      })),

      // Social Media Links Actions
      addSocialMediaLink: (link) => set((state) => ({
        socialMediaLinks: [...state.socialMediaLinks, link],
      })),

      updateSocialMediaLink: (index, link) => set((state) => ({
        socialMediaLinks: state.socialMediaLinks.map((l, i) => i === index ? link : l),
      })),

      removeSocialMediaLink: (index) => set((state) => ({
        socialMediaLinks: state.socialMediaLinks.filter((_, i) => i !== index),
      })),

      setSocialMediaLinks: (links) => set({ socialMediaLinks: links }),

      // Legacy actions - call new actions internally
      addDocumentId: (type, id) => {
        // This is a legacy method - prefer using addDocument()
        set((state) => ({
          documents: {
            ...state.documents,
            [type as 'identification' | 'registration' | 'license']: [...state.documents[type as 'identification' | 'registration' | 'license'], { id, url: '', name: '' }],
          },
        }));
      },

      removeDocumentId: (type, id) => get().removeDocument(type as any, id),
      setProfilePhotoId: (id) => set({ profilePhoto: id ? { id, url: '', name: '' } : null }),
      setCoverPhotoId: (id) => set({ coverPhoto: id ? { id, url: '', name: '' } : null }),
      addPortfolioImageId: (id) => get().addPortfolioImage({ id, url: '', name: '' }),
      removePortfolioImageId: (id) => get().removePortfolioImage(id),

      // UI State Actions
      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setErrors: (errors) => set({ errors }),
      incrementUpload: () => set((state) => ({ activeUploads: state.activeUploads + 1 })),
      decrementUpload: () => set((state) => ({ activeUploads: Math.max(0, state.activeUploads - 1) })),

      clearDraft: () => set({
        currentStep: 1,
        expandedSection: null,
        completedSections: new Set(),
        businessInfo: null,
        serviceCategories: null,
        pricingStructure: null,
        paymentConfiguration: null,
        profileCompletion: null,
        documents: { identification: [], registration: [], license: [] },
        profilePhoto: null,
        coverPhoto: null,
        portfolioImages: [],
        socialMediaLinks: [],
        isBusinessInfoValid: false,
        isDocumentsValid: false,
        isServiceCategoriesValid: false,
        isPricingStructureValid: false,
        isPaymentConfigurationValid: false,
        isProfileCompletionValid: false,
        errors: {},
      }),
    }),
    {
      name: 'vendor-setup-draft', // localStorage key
      partialize: (state) => ({
        // Only persist serializable data
        currentStep: state.currentStep,
        expandedSection: state.expandedSection,
        completedSections: Array.from(state.completedSections), // Convert Set to Array
        businessInfo: state.businessInfo,
        serviceCategories: state.serviceCategories,
        pricingStructure: state.pricingStructure,
        paymentConfiguration: state.paymentConfiguration,
        profileCompletion: state.profileCompletion,
        documents: state.documents, // NEW: Full metadata with URLs
        profilePhoto: state.profilePhoto,  // NEW: Full metadata with URL
        coverPhoto: state.coverPhoto,    // NEW: Full metadata with URL
        portfolioImages: state.portfolioImages, // NEW: Full metadata with URLs
        socialMediaLinks: state.socialMediaLinks, // Social media links
        isBusinessInfoValid: state.isBusinessInfoValid,
        isDocumentsValid: state.isDocumentsValid,
        isServiceCategoriesValid: state.isServiceCategoriesValid,
        isPricingStructureValid: state.isPricingStructureValid,
        isPaymentConfigurationValid: state.isPaymentConfigurationValid,
        isProfileCompletionValid: state.isProfileCompletionValid,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        // Convert completedSections back to Set
        completedSections: new Set(persistedState?.completedSections || []),
      }),
    }
  )
);
