import { PaginatedResponse } from '../types';

// Common utility functions for API operations

export const buildSearchParams = (params: Record<string, any>): URLSearchParams => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams;
};

export const handlePaginatedResponse = <T>(
  response: any,
  fallbackPage: number = 1,
  fallbackLimit: number = 20
): PaginatedResponse<T> => {
  // Handle wrapped response with pagination info
  if (response.data.success && response.data.data && response.data.pagination) {
    return {
      data: response.data.data,
      total: response.data.pagination.totalItems,
      page: response.data.pagination.currentPage,
      limit: response.data.pagination.itemsPerPage,
      totalPages: response.data.pagination.totalPages,
    };
  }

  // Handle direct paginated response
  if (response.data.data && 'data' in response.data.data) {
    return response.data.data;
  }

  // Handle array response
  if (Array.isArray(response.data.data)) {
    const currentPageItems = response.data.data.length;
    const estimatedTotal = (fallbackPage === 1 && currentPageItems < fallbackLimit) 
      ? currentPageItems 
      : currentPageItems * fallbackPage;

    return {
      data: response.data.data,
      total: estimatedTotal,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: Math.ceil(estimatedTotal / fallbackLimit),
    };
  }

  return { 
    data: [], 
    total: 0, 
    page: fallbackPage, 
    limit: fallbackLimit, 
    totalPages: 0 
  };
};

export const getIdFromRow = (row: any): string => {
  return (row.id || row._id || '').toString();
};