import api from './api';

export interface InventoryItem {
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const inventoryService = {
  async getAll(page = 0, size = 10, search = ''): Promise<PageResponse<InventoryItem>> {
    const params: any = { page, size };
    if (search) {
      // Si hay búsqueda, usar el endpoint de búsqueda
      const searchResponse = await api.get<ApiResponse<PageResponse<InventoryItem>>>('/inventory/search', {
        params: { q: search, page, size },
      });
      return searchResponse.data.data;
    }
    
    const response = await api.get<ApiResponse<PageResponse<InventoryItem>>>('/inventory/page', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const response = await api.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
    return response.data.data;
  },

  async getLowStock(): Promise<InventoryItem[]> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/low-stock');
    return response.data.data;
  },

  async getByCategory(category: InventoryItem['category']): Promise<InventoryItem[]> {
    try {
      const response = await api.get<ApiResponse<PageResponse<InventoryItem>>>(`/inventory/category/${category}`, {
        params: { page: 0, size: 1000 },
      });
      // El backend devuelve una Page, extraer el content
      return response.data.data?.content || [];
    } catch (error) {
      console.error('Error al obtener por categoría:', error);
      // Si falla, intentar obtener todos y filtrar
      const allResponse = await this.getAll(0, 1000);
      return (allResponse.content || []).filter(item => item.category === category);
    }
  },

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const response = await api.post<ApiResponse<InventoryItem>>('/inventory', item);
    return response.data.data;
  },

  async update(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, item);
    return response.data.data;
  },

  async updateQuantity(id: string, quantity: number): Promise<InventoryItem> {
    const response = await api.patch<ApiResponse<InventoryItem>>(`/inventory/${id}/quantity`, null, {
      params: { quantity },
    });
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`);
  },

  async search(searchTerm: string): Promise<InventoryItem[]> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/search', {
      params: { q: searchTerm },
    });
    return response.data.data;
  },

  // ========== NUEVOS ENDPOINTS ==========

  async getOutOfStock(): Promise<InventoryItem[]> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/out-of-stock');
    return response.data.data;
  },

  async getExpiringSoon(days: number = 30): Promise<InventoryItem[]> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/expiring-soon', {
      params: { days },
    });
    return response.data.data;
  },

  async getExpired(): Promise<InventoryItem[]> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/expired');
    return response.data.data;
  },

  async count(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/inventory/count');
    return response.data.data;
  },

  async countLowStock(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/inventory/low-stock/count');
    return response.data.data;
  },
};
