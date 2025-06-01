import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  Admin, 
  Affirmation, 
  LoginRequest, 
  LoginResponse, 
  CreateAdminRequest, 
  UpdateAdminRequest,
  CreateAffirmationRequest,
  UpdateAffirmationRequest,
  PaginatedResponse,
  ApiError,
  ApiResponse 
} from '../types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.innerspark.com';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const errorData = error.response.data as any;
      // Handle wrapped API error responses
      if (errorData.success === false && errorData.message) {
        return {
          message: errorData.message,
          code: errorData.code || 'API_ERROR',
          details: errorData.details
        };
      }
      return errorData as ApiError;
    }
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'NETWORK_ERROR',
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/api/admin/login', credentials);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/admin/logout');
  }

  async getProfile(): Promise<Admin> {
    const response = await this.client.get<ApiResponse<Admin>>('/api/admin/profile');
    return response.data.data;
  }

  async updateProfile(data: UpdateAdminRequest): Promise<Admin> {
    const response = await this.client.put<ApiResponse<Admin>>('/api/admin/profile', data);
    return response.data.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/api/admin/change-password', { currentPassword, newPassword });
  }

  async getAdmins(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Admin>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await this.client.get<ApiResponse<PaginatedResponse<Admin>>>(`/api/admin/admins?${params}`);
    if (!response.data.data) {
      return { data: [], total: 0, page: 1, limit: limit, totalPages: 0 };
    }
    return response.data.data;
  }

  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    const response = await this.client.post<ApiResponse<Admin>>('/api/admin/admins', data);
    return response.data.data;
  }

  async getAdmin(id: string): Promise<Admin> {
    const response = await this.client.get<ApiResponse<Admin>>(`/api/admin/admins/${id}`);
    return response.data.data;
  }

  async updateAdmin(id: string, data: UpdateAdminRequest): Promise<Admin> {
    const response = await this.client.put<ApiResponse<Admin>>(`/api/admin/admins/${id}`, data);
    return response.data.data;
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.client.delete(`/api/admin/admins/${id}`);
  }

  async activateAdmin(id: string): Promise<Admin> {
    const response = await this.client.patch<ApiResponse<Admin>>(`/api/admin/admins/${id}/activate`);
    return response.data.data;
  }

  async deactivateAdmin(id: string): Promise<Admin> {
    const response = await this.client.patch<ApiResponse<Admin>>(`/api/admin/admins/${id}/deactivate`);
    return response.data.data;
  }

  async getAffirmations(
    page = 1, 
    limit = 10, 
    category?: string, 
    language?: string, 
    search?: string
  ): Promise<PaginatedResponse<Affirmation>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category) params.append('category', category);
    if (language) params.append('language', language);
    if (search) params.append('search', search);
    
    const response = await this.client.get<ApiResponse<any>>(`/api/admin/affirmations?${params}`);
    if (!response.data.data) {
      return { data: [], total: 0, page: 1, limit: limit, totalPages: 0 };
    }
    // Handle the API response with pagination info
    if (Array.isArray(response.data.data) && response.data.pagination) {
      return {
        data: response.data.data,
        total: response.data.pagination.totalItems,
        page: response.data.pagination.currentPage,
        limit: response.data.pagination.itemsPerPage,
        totalPages: response.data.pagination.totalPages
      };
    }
    // Fallback for array without pagination
    if (Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        total: response.data.data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(response.data.data.length / limit)
      };
    }
    return response.data.data;
  }

  async createAffirmation(data: CreateAffirmationRequest): Promise<Affirmation> {
    const response = await this.client.post<ApiResponse<Affirmation>>('/api/admin/affirmations', data);
    return response.data.data;
  }

  async getAffirmation(id: string): Promise<Affirmation> {
    const response = await this.client.get<ApiResponse<Affirmation>>(`/api/admin/affirmations/${id}`);
    return response.data.data;
  }

  async updateAffirmation(id: string, data: UpdateAffirmationRequest): Promise<Affirmation> {
    const response = await this.client.put<ApiResponse<Affirmation>>(`/api/admin/affirmations/${id}`, data);
    return response.data.data;
  }

  async deleteAffirmation(id: string): Promise<void> {
    await this.client.delete(`/api/admin/affirmations/${id}`);
  }

  async bulkUpdateAffirmations(ids: string[], data: UpdateAffirmationRequest): Promise<void> {
    await this.client.post('/api/admin/affirmations/bulk-update', { ids, ...data });
  }

  async bulkDeleteAffirmations(ids: string[]): Promise<void> {
    await this.client.delete('/api/admin/affirmations/bulk-delete', { data: { ids } });
  }

  async getCategories(): Promise<string[]> {
    const response = await this.client.get<ApiResponse<string[]>>('/api/admin/affirmations/categories');
    return response.data.data || [];
  }

  async getAffirmationStats(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/api/admin/affirmations/stats');
    return response.data.data;
  }
}

export const apiService = new ApiService();