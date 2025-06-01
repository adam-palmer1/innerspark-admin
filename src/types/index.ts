export interface Admin {
  id: number | string;
  _id?: string;
  email: string;
  name: string;
  active?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface AffirmationSlide {
  id: string;
  title: string;
  content: string | string[];
  author?: string;
}

export interface Affirmation {
  id: number | string;
  _id?: string;
  text?: string | null;
  category?: string | null;
  tags?: string[];
  priority?: number;
  language?: string;
  slides?: AffirmationSlide[];
  isActive?: boolean;
  author?: string | null;
  createdBy?: string | null;
  createdByAdmin?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedByAdmin?: string | null;
  lastModifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface CreateAdminRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  active?: boolean;
}

export interface CreateAffirmationRequest {
  text: string;
  category: string;
  tags: string[];
  priority: number;
  language: string;
}

export interface UpdateAffirmationRequest {
  text?: string;
  category?: string;
  tags?: string[];
  priority?: number;
  language?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  timestamp?: string;
}