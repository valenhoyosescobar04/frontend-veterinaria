export interface Owner {
  id: string;
  documentType: 'CC' | 'CE' | 'TI' | 'PAS';
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OwnerFormData = Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>;
