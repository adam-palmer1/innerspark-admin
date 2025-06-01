export interface Admin {
  id: number | string;
  _id?: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffirmationSlide {
  _id?: string;
  id: string;
  title: string;
  content: string | string[];
  author?: string;
}

export interface Affirmation {
  id: number | string;
  _id?: string;
  text?: string;
  slides?: AffirmationSlide[];
  tags?: string[];
  isActive?: boolean;
  priority?: number;
  language?: string;
  author?: string;
  category?: string;
  createdBy?: number;
  createdByAdmin?: string;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  likesCount?: number;
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
  isActive?: boolean;
}

export interface CreateAffirmationRequest {
  text: string;
  tags: string[];
  isActive?: boolean;
  priority?: number;
  language?: string;
  author?: string;
}

export interface UpdateAffirmationRequest {
  text?: string;
  tags?: string[];
  isActive?: boolean;
  priority?: number;
  language?: string;
  author?: string;
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

export interface Tag {
  id: number;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usageCount: number;
  currentUsageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagCreate {
  name: string;
  description?: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  description?: string;
  color?: string;
}

export interface TagAssign {
  affirmationId: number;
  tagId: number;
  order?: number;
}

export interface TagBulkAssign {
  affirmationId: number;
  tagNames: string[];
}

export interface BulkUpdate {
  affirmationIds: number[];
  updateData: {
    isActive?: boolean;
    priority?: number;
    tags?: string[];
  };
}

export interface BulkDelete {
  affirmationIds: number[];
}

export interface AffirmationStats {
  totalAffirmations: number;
  activeAffirmations: number;
  tagsCount: number;
  avgPriority: number;
}

export interface TagStatistics {
  totalTags: number;
  totalUsage: number;
  averageUsage: number;
  topTags: Tag[];
  unusedTags: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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