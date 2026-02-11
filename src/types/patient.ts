export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
export type Sex = 'male' | 'female';

export interface Patient {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: number;
  weight: number;
  sex: Sex;
  color: string;
  ownerId: string;
  ownerName: string;
  microchip?: string;
  dateOfBirth?: string;
  observations?: string;
  isActive: boolean;
  createdAt: string;
  lastVisit?: string;
}
