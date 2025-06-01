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

## Current Issues Fixed
- ESLint warnings in pages/Admins.tsx, Affirmations.tsx, Analytics.tsx
- useEffect dependency warnings resolved with useCallback

## Admin Endpoints
- GET /api/admin/admins - List admins
- POST /api/admin/admins - Create admin  
- GET/PUT /api/admin/admins/{id} - Get/Update admin
- PATCH /api/admin/admins/{id}/activate - Activate admin
- PATCH /api/admin/admins/{id}/deactivate - Deactivate admin

## Response Format
- Success: `{ success: true, message: string, data: object }`
- Error: `{ success: false, message: string }`