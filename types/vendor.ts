/**
 * Business Profile API Types
 */

export interface BusinessProfileContactInfo {
  primaryContactName: string;
  emailAddress: string;
  phoneNumber: string;
  meansOfIdentification?: string;
  addressId?: string;
}

export interface BusinessDocument {
  docName: string;
  file: string; // File ID from upload
}

export interface ServiceAreaLocation {
  city: string;
  state: string;
  country: string;
}

export interface ServiceArea {
  travelDistance: string;
  areaNames: ServiceAreaLocation[];
}

export interface Workday {
  dayOfWeek: string;
  open: string;
  close: string;
}

export interface BusinessProfilePayload {
  vendorId: string; // Required from user profile
  contactInfo: BusinessProfileContactInfo;
  businessName: string;
  yearInBusiness: string;
  companyRegNo: string;
  businessRegType: string;
  businessDescription?: string;
  businessDocuments?: BusinessDocument[];
  serviceArea: ServiceArea;
  workdays?: Workday[];
}

export interface BusinessProfileResponse {
  message: string;
  data: {
    _id: string;
    vendorId: string;
    businessDescription?: string;
    createdAt: string;
    updatedAt: string;
  };
}
