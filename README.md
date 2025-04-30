# AI WordPress Plugin Frontend

This is the frontend for the AI WordPress Plugin, built with Next.js and configured for static exports to work with a NestJS backend.

## Authentication Strategy

This application uses a dual authentication approach during the transition to a fully API-based authentication system:

1. **Primary Authentication** - Uses a custom AuthContext (in `contexts/AuthContext.tsx`) that communicates directly with the NestJS backend API.

2. **Legacy Support** - Maintains NextAuth.js integration for backward compatibility with existing components.

### Important Notes for Static Export

Because this application is configured for static export (`output: 'export'` in `next.config.mjs`), there are some limitations:

- Server-side API routes (including NextAuth API routes) have limited functionality
- Authentication is primarily handled through the client-side API services
- All frontend pages are pre-rendered at build time

### Authentication Files

- `contexts/AuthContext.tsx` - Main authentication context for API integration
- `contexts/auth-context.tsx` - Legacy re-export (deprecated)
- `lib/api.ts` - Core API client
- `lib/services/AuthService.ts` - Authentication service for NestJS backend

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (static export)
npm run build
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the necessary variables:

```
# NextAuth Configuration (for legacy support)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# API Configuration for NestJS Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Deployment

After building the project, the `out` directory contains static files that can be deployed to any static hosting service:

```bash
# Build static export
npm run build

# Deploy the resulting 'out' directory to your hosting service
```

## Backend Integration

This frontend is designed to work with a NestJS backend running on localhost:3000. The API client is configured in `lib/api.ts` and services for different resources are in the `lib/services/` directory.

### API Endpoints

The application integrates with the following NestJS API endpoints:

- **Authentication**: Login, Register, Verify Email, Reset Password, etc.
- **User Management**: Profile, User CRUD operations
- **Content Generation**: AI-powered content generation endpoints

The full API specification is available in the `nest.json` file, which serves as documentation for all available endpoints, their request/response formats, and authentication requirements.

For local development, ensure your NestJS backend is running and CORS is properly configured to accept requests from `http://localhost:5000` (the frontend's development port). 