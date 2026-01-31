
export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  long?: number;
  lat?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Avatar {
  _id: string;
  url: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  extension?: string;
  provider?: string;
  uploadedBy?: string;
  metadata?: {
    cloudId?: string;
    folder?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Vendor {
  _id: string;
  userId: string;
  portfolioGallery: string[];
  rate: number;
  paymentAccountProvider: string;
  paymentModel: string;
  isActive: boolean;
  onBoardingStage: number;
  onBoarded: boolean;
  socialMediaLinks: string[];
  commissionAgreement?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  id: string;
  businessProfile?: any; // Detailed business profile
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  addressId?: Address | string;
  role: string;
  status: string;
  emailVerified: boolean;
  authProvider: string;
  googleId?: string | null;
  avatar?: Avatar;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string | null;
  hasPassword?: boolean;
  vendor?: Vendor;
}

export interface LoginResponse {
  message: string;
  data: {
    user: AuthUser;
    token: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
