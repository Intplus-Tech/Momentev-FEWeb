export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  lat?: number;
  long?: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateAddressInput = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  lat?: number;
  long?: number;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;
