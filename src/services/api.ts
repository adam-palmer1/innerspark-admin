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
  ApiResponse,
  Tag,
  TagCreate,
  TagUpdate,
  TagAssign,
  TagBulkAssign,
  BulkUpdate,
  BulkDelete,
  AffirmationStats,
  TagStatistics,
  ChangePasswordRequest
} from '../types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.innerspark.app';

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

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.client.post('/api/admin/change-password', data);
  }

  async getAdmins(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Admin>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await this.client.get<ApiResponse<any>>(`/api/admin/admins?${params}`);
    
    // Handle wrapped response with pagination info
    if (response.data.success && response.data.data && response.data.pagination) {
      return {
        data: response.data.data,
        total: response.data.pagination.totalItems,
        page: response.data.pagination.currentPage,
        limit: response.data.pagination.itemsPerPage,
        totalPages: response.data.pagination.totalPages
      };
    }
    
    // Handle direct paginated response
    if (response.data.data && 'data' in response.data.data) {
      return response.data.data;
    }
    
    // Handle array response
    if (Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        total: response.data.data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(response.data.data.length / limit)
      };
    }
    
    return { data: [], total: 0, page: 1, limit: limit, totalPages: 0 };
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

  async getAffirmations(params?: {
    page?: number;
    limit?: number;
    tag?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    language?: string;
    priority?: number;
  }): Promise<PaginatedResponse<Affirmation>> {
    const searchParams = new URLSearchParams({
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 20).toString(),
    });
    
    if (params?.tag) searchParams.append('tag', params.tag);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params?.language) searchParams.append('language', params.language);
    if (params?.priority) searchParams.append('priority', params.priority.toString());
    
    const response = await this.client.get<ApiResponse<any>>(`/api/admin/affirmations?${searchParams}`);
    if (!response.data.data) {
      return { data: [], total: 0, page: 1, limit: params?.limit || 20, totalPages: 0 };
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
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalPages: Math.ceil(response.data.data.length / (params?.limit || 20))
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

  async bulkUpdateAffirmations(data: BulkUpdate): Promise<void> {
    await this.client.post('/api/admin/affirmations/bulk-update', data);
  }

  async bulkDeleteAffirmations(data: BulkDelete): Promise<void> {
    await this.client.delete('/api/admin/affirmations/bulk-delete', { data });
  }


  async getAffirmationStats(): Promise<AffirmationStats> {
    const response = await this.client.get<ApiResponse<AffirmationStats>>('/api/admin/affirmations/stats');
    return response.data.data;
  }

  async getAffirmationAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    tag?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.tag) searchParams.append('tag', params.tag);
    
    const response = await this.client.get<ApiResponse<any>>(`/api/admin/affirmations/analytics?${searchParams}`);
    return response.data.data;
  }

  async toggleAffirmationStatus(id: string): Promise<Affirmation> {
    const response = await this.client.patch<ApiResponse<Affirmation>>(`/api/admin/affirmations/${id}/toggle-status`);
    return response.data.data;
  }

  async getAffirmationTags(): Promise<string[]> {
    const response = await this.client.get<ApiResponse<string[]>>('/api/admin/affirmations/tags');
    return response.data.data;
  }

  // Tag Management Methods
  async getTags(params?: {
    page?: number;
    limit?: number;
    includeCount?: boolean;
    orderBy?: 'usageCount' | 'name' | 'createdAt';
  }): Promise<PaginatedResponse<Tag>> {
    const searchParams = new URLSearchParams({
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 50).toString(),
    });
    
    if (params?.includeCount !== undefined) {
      searchParams.append('includeCount', params.includeCount.toString());
    }
    if (params?.orderBy) {
      searchParams.append('orderBy', params.orderBy);
    }

    const response = await this.client.get<ApiResponse<Tag[]>>(`/api/admin/tags?${searchParams}`);
    
    // Handle response with pagination
    if (response.data.pagination) {
      return {
        data: response.data.data,
        total: response.data.pagination.totalItems,
        page: response.data.pagination.currentPage,
        limit: response.data.pagination.itemsPerPage,
        totalPages: response.data.pagination.totalPages
      };
    }
    
    // Fallback for array without pagination
    return {
      data: response.data.data,
      total: response.data.data.length,
      page: params?.page || 1,
      limit: params?.limit || 50,
      totalPages: Math.ceil(response.data.data.length / (params?.limit || 50))
    };
  }

  async createTag(data: TagCreate): Promise<Tag> {
    const response = await this.client.post<ApiResponse<Tag>>('/api/admin/tags', data);
    return response.data.data;
  }

  async getTag(id: string): Promise<Tag> {
    const response = await this.client.get<ApiResponse<Tag>>(`/api/admin/tags/${id}`);
    return response.data.data;
  }

  async updateTag(id: string, data: TagUpdate): Promise<Tag> {
    const response = await this.client.put<ApiResponse<Tag>>(`/api/admin/tags/${id}`, data);
    return response.data.data;
  }

  async deleteTag(id: string): Promise<void> {
    await this.client.delete(`/api/admin/tags/${id}`);
  }

  async getPopularTags(limit = 20): Promise<Tag[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    const response = await this.client.get<ApiResponse<Tag[]>>(`/api/admin/tags/popular?${params}`);
    return response.data.data;
  }

  async searchTags(query: string, limit = 10): Promise<Tag[]> {
    const params = new URLSearchParams({ 
      query,
      limit: limit.toString()
    });
    const response = await this.client.get<ApiResponse<Tag[]>>(`/api/admin/tags/search?${params}`);
    return response.data.data;
  }

  async getTagStatistics(): Promise<TagStatistics> {
    const response = await this.client.get<ApiResponse<TagStatistics>>('/api/admin/tags/statistics');
    return response.data.data;
  }

  async getTagAffirmations(
    id: string, 
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ tag: Tag; affirmations: Affirmation[] }> {
    const searchParams = new URLSearchParams({
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 20).toString(),
    });

    const response = await this.client.get<ApiResponse<{ tag: Tag; affirmations: Affirmation[] }>>(`/api/admin/tags/${id}/affirmations?${searchParams}`);
    return response.data.data;
  }

  async assignTagToAffirmation(data: TagAssign): Promise<{ success: boolean; created: boolean }> {
    const response = await this.client.post<ApiResponse<{ success: boolean; created: boolean }>>('/api/admin/tags/assign', data);
    return response.data.data;
  }

  async removeTagFromAffirmation(affirmationId: string, tagId: string): Promise<{ success: boolean; deleted: boolean }> {
    const response = await this.client.delete<ApiResponse<{ success: boolean; deleted: boolean }>>(`/api/admin/tags/${affirmationId}/${tagId}`);
    return response.data.data;
  }

  async updateAffirmationTags(data: TagBulkAssign): Promise<{ success: boolean }> {
    const response = await this.client.put<ApiResponse<{ success: boolean }>>('/api/admin/tags/affirmations', data);
    return response.data.data;
  }

  async refreshTagCounts(): Promise<{ updatedTags: number }> {
    const response = await this.client.post<ApiResponse<{ updatedTags: number }>>('/api/admin/tags/refresh-counts');
    return response.data.data;
  }
}

export const apiService = new ApiService();