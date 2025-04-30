# API Integration with NestJS Backend

This directory contains the API client and service modules for communicating with the NestJS backend. The frontend is configured for static export, with API calls handled through these service modules.

## Directory Structure

- `api.ts` - Core API client with request handling and error management
- `services/` - Service modules for different API resources
  - `AuthService.ts` - Authentication operations (login, signup, password reset)
  - `UserService.ts` - User management operations

## Usage

### Making API Calls

```typescript
// Direct service use
import { UserService } from '@/lib/services/UserService';

// Get user by ID
const user = await UserService.GetUserById('123');

// Update user profile
await UserService.UpdateUser('123', { fullName: 'New Name' });
```

### With React Hook

```typescript
import { UseApi } from '@/hooks/useApi';
import { UserService } from '@/lib/services/UserService';

function UserProfile({ userId }) {
  const { 
    isLoading, 
    error, 
    data: user, 
    Execute 
  } = UseApi(UserService.GetUserById);

  useEffect(() => {
    Execute(userId);
  }, [userId, Execute]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.fullName}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Auth Context

The application provides an authentication context that handles user authentication state across the application:

```typescript
import { UseAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { Login, isLoading, error } = UseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await Login({ email, password });
    if (success) {
      // Navigate or do something on success
    }
  };

  // Rest of component...
}
```

## Environment Configuration

API configuration is managed through environment variables:

- Development: `.env.local`
- Production: `.env.production`

Key variables:
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for API requests

## Error Handling

The API client includes built-in error handling with the `ApiError` class:

```typescript
try {
  await UserService.UpdateUser('123', { fullName: 'New Name' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error (${error.status}): ${error.message}`);
    // Handle specific status codes
    if (error.status === 401) {
      // Handle unauthorized
    }
  }
}
```

## Static Deployment

Because the application is configured for static export, ensure that:

1. All API endpoints are properly handled by the NestJS backend
2. CORS is properly configured on the backend to allow requests from the static frontend
3. Authentication tokens are properly managed via localStorage

## Naming Conventions

This project follows PascalCase naming for functions and classes:

```typescript
// Correct usage
import { UserService } from '@/lib/services/UserService';
import { UseAuth } from '@/contexts/AuthContext';

// Alternative camelCase export is also available for auth hook
import { useAuth } from '@/contexts/AuthContext';
``` 