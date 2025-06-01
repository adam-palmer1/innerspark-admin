# Claude Development Notes

## API Documentation
- **Primary API Docs**: https://api.innerspark.app/openapi.json
- **Review regularly** for endpoint changes and updates

## Key API Details
- **Base URL**: https://api.innerspark.app (production) / http://localhost:8001 (dev)
- **Authentication**: JWT Bearer token
- **Login Endpoint**: `/api/admin/login`
- **Logout Endpoint**: `/api/admin/logout`
- **Profile Endpoints**: `/api/admin/profile`
- **All endpoints require `/api` prefix**

## API Response Format
- All responses are wrapped: `{ success: boolean, message: string, data: T }`
- Admin objects use `isActive` field (not `active`)
- Admin IDs can be numeric or string

## Known API Issues
- **Tags**: Database doesn't have `isActive` column for tags (causes SQL error)
- **Categories**: `/api/admin/affirmations/categories` endpoint doesn't exist
- **Affirmations**: Now use tags for filtering instead of categories

## Data Structures
- **Affirmations**: Can have either `text` field OR `slides` array
  - Use `_id` as identifier when `id` is not present
  - Slides structure: `{ _id, id, title, content, author }`
  - Display logic: `affirmation.text || affirmation.slides?.[0]?.title`

## Current Issues Fixed
- ESLint warnings in pages/Admins.tsx, Affirmations.tsx, Analytics.tsx
- useEffect dependency warnings resolved with useCallback
- Updated API service to match OpenAPI specification (December 2024)
- Fixed production server URL from api.innerspark.com to api.innerspark.app
- Updated all type definitions to match OpenAPI schema
- Removed deprecated 'active' property in favor of 'isActive'
- Updated affirmation types to remove 'slides' and 'category' properties
- Fixed bulk operations to use proper request schemas
- Fixed runtime error with undefined affirmation IDs
- Removed isActive field from Tag interface (database doesn't have this column)
- Updated getAdmins to handle various API response formats
- Enhanced tag selection with autocomplete dropdown and removable chips

## Admin Endpoints
- GET /api/admin/admins - List admins
- POST /api/admin/admins - Create admin  
- GET/PUT /api/admin/admins/{id} - Get/Update admin
- PATCH /api/admin/admins/{id}/activate - Activate admin
- PATCH /api/admin/admins/{id}/deactivate - Deactivate admin

## New Features Added
- **Complete Tag Management System**
  - Tags page with full CRUD operations
  - Tag statistics and analytics
  - Tag search and filtering
  - Bulk tag operations
  - Tag assignment to affirmations

## Enhanced API Endpoints
- **Tag Management**: GET/POST/PUT/DELETE /api/admin/tags
- **Affirmation Analytics**: GET /api/admin/affirmations/analytics
- **Affirmation Statistics**: GET /api/admin/affirmations/stats
- **Bulk Operations**: POST /api/admin/affirmations/bulk-update, DELETE /api/admin/affirmations/bulk-delete
- **Tag Statistics**: GET /api/admin/tags/statistics
- **Popular Tags**: GET /api/admin/tags/popular

## Response Format
- Success: `{ success: true, message: string, data: object }`
- Error: `{ success: false, message: string }`