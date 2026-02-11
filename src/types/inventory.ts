// Backend inventory item type
export interface InventoryItemBackend {
  id: string;
  name: string;
  category: 'MEDICATION' | 'SUPPLY' | 'EQUIPMENT' | 'FOOD' | 'OTHER';
  description?: string;
  sku?: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  unitPrice: number;
  supplier?: string;
  expirationDate?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend inventory item type (for compatibility)
export interface InventoryItem {
  id: string;
  name: string;
  category: 'medicamento' | 'material' | 'alimento' | 'equipo' | 'otro' | 'MEDICATION' | 'SUPPLY' | 'EQUIPMENT' | 'FOOD' | 'OTHER';
  description: string;
  quantity: number;
  unit: string;
  minStock: number;
  supplier: string;
  cost: number;
  expirationDate?: string;
  lastRestockDate: string;
  status: 'disponible' | 'bajo_stock' | 'agotado';
}

export type InventoryFormData = Omit<InventoryItem, 'id' | 'status'>;
