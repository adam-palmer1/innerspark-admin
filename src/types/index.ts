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

// Removed AffirmationSlide - no longer used in the current implementation

export interface TagObject {
  id: number;
  name: string;
  AffirmationTag: {
    order: number;
  };
  _id?: string;
}

export interface Affirmation {
  id: number;
  _id?: string;
  text: string;
  tags?: string[];
  tagObjects?: TagObject[];
  isActive: boolean;
  language: string;
  author?: string;
  affirmationTitle?: string;
  affirmationContent?: string;
  descriptionContent?: string;
  practiceContent1?: string;
  practiceContent2?: string;
  practiceContent3?: string;
  category?: string;
  createdBy?: number;
  createdByAdmin?: string;
  lastModifiedBy?: number;
  lastModifiedByAdmin?: string;
  lastModifiedAt?: string;
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
  text?: string;
  tags: string[];
  isActive?: boolean;
  language?: string;
  author?: string;
  affirmationTitle?: string;
  affirmationContent?: string;
  descriptionContent?: string;
  practiceContent1?: string;
  practiceContent2?: string;
  practiceContent3?: string;
}

export interface UpdateAffirmationRequest {
  text?: string;
  tags?: string[];
  isActive?: boolean;
  language?: string;
  author?: string;
  affirmationTitle?: string;
  affirmationContent?: string;
  descriptionContent?: string;
  practiceContent1?: string;
  practiceContent2?: string;
  practiceContent3?: string;
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

export interface GenerateAIRequest {
  tags: string[];
  language?: string;
  affirmationTitle?: string;
  affirmationContent?: string;
  descriptionContent?: string;
  practiceContent1?: string;
  practiceContent2?: string;
  practiceContent3?: string;
}

export interface GenerateAIResponse {
  affirmationTitle: string;
  affirmationContent: string;
  descriptionContent: string;
  practiceContent1: string;
  practiceContent2: string;
  practiceContent3: string;
  templateId?: number;
}

export interface AffirmationFeedback {
  id: number;
  affirmationId?: number;
  rating: number; // 1-5
  feedback?: string;
  generatedContent: {
    affirmationTitle: string;
    affirmationContent: string;
    descriptionContent: string;
    practiceContent1: string;
    practiceContent2: string;
    practiceContent3: string;
  };
  tags: string[];
  language: string; // 2-letter code, default 'en'
  promptVersion?: string;
  templateId?: number;
  adminId: number;
  admin?: Admin;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: number;
  name: string;
  tags: string[];
  systemPrompt: string;
  userPromptTemplate: string;
  examples?: string[];
  avgRating: number;
  usageCount: number;
  successCount: number;
  isActive: boolean;
  version: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  rating: number;
  feedback?: string;
  generatedContent: {
    affirmationTitle: string;
    affirmationContent: string;
    descriptionContent: string;
    practiceContent1: string;
    practiceContent2: string;
    practiceContent3: string;
  };
  tags: string[];
  language?: string;
  templateId?: number;
}

export interface CreateTemplateRequest {
  name: string;
  tags: string[];
  systemPrompt: string;
  userPromptTemplate: string;
  examples?: string[];
  version?: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  tags?: string[];
  systemPrompt?: string;
  userPromptTemplate?: string;
  examples?: string[];
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  usageStats: Array<{
    isUsed: boolean;
    count: number;
  }>;
}

export interface TemplateStatistics {
  totalTemplates: number;
  activeTemplates: number;
  overallAvgRating: number;
  successRate: number;
  totalUsage: number;
  totalSuccess: number;
  topTemplates: Array<{
    id: number;
    name: string;
    avgRating: number;
    usageCount: number;
    successCount: number;
  }>;
}