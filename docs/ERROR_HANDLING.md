# Error Handling Guide

This document describes the comprehensive error handling system implemented in CarTrader.

## Overview

The application includes production-ready error handling with:
- User-friendly error messages
- Automatic retry logic for network errors
- Error logging and monitoring
- Toast notifications for user feedback
- Error boundaries for React components
- Consistent error responses from the backend

## Frontend Error Handling

### Error Boundary

The `ErrorBoundary` component catches React component errors and displays a user-friendly UI.

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

The error boundary is already integrated in the root layout.

### Toast Notifications

Toast notifications provide user feedback for errors and success messages.

**Usage:**
```tsx
import { useToast } from '@/components/ui/toast';

function MyComponent() {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      toast.success('Action completed successfully!');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };
}
```

### Error Handler Hook

The `useErrorHandler` hook provides a convenient way to handle errors with automatic toast notifications.

**Usage:**
```tsx
import { useErrorHandler } from '@/hooks/use-error-handler';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();

  const handleAction = async () => {
    const result = await handleAsyncError(
      async () => {
        return await api.get('/some-endpoint');
      },
      {
        showToast: true,
        logError: true,
        customMessage: 'Failed to load data',
      }
    );

    if (result) {
      // Handle success
    }
  };
}
```

### Error Utilities

The `error-utils.ts` file provides utilities for converting errors to user-friendly messages.

**Usage:**
```tsx
import { getUserFriendlyError, logError } from '@/lib/error-utils';

try {
  await someAction();
} catch (error) {
  const errorDetails = getUserFriendlyError(error);
  console.log(errorDetails.userMessage); // User-friendly message
  logError(error, { context: 'MyComponent' }); // Log for monitoring
}
```

## Backend Error Handling

### Global Exception Filter

All exceptions are caught by the `HttpExceptionFilter` and formatted consistently.

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": ["Error message 1", "Error message 2"],
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/vehicles"
}
```

### Error Logging

Errors are automatically logged with:
- Status code
- Timestamp
- Request path and method
- Error message
- Stack trace (development only)

Server errors (5xx) are logged as errors, client errors (4xx) as warnings.

## API Client Retry Logic

The API client automatically retries failed requests:
- Network errors: Retries up to 2 times with exponential backoff
- Server errors (5xx): Retries up to 2 times
- Rate limiting (429): Retries up to 2 times
- Client errors (4xx): No retry (except 429)

## Error Pages

### 404 Not Found
Located at `apps/frontend/src/app/not-found.tsx`
- Displays when a route is not found
- Provides links to home and browse pages

### Global Error Page
Located at `apps/frontend/src/app/error.tsx`
- Catches unhandled errors in the app
- Provides a reset button to retry

## Production Monitoring

### Error Tracking Integration

The error handling system is ready for integration with error tracking services:

1. **Sentry** (recommended):
   ```tsx
   // In error-boundary.tsx and error-utils.ts
   if (window.Sentry) {
     window.Sentry.captureException(error);
   }
   ```

2. **LogRocket**:
   ```tsx
   if (window.LogRocket) {
     window.LogRocket.captureException(error);
   }
   ```

### Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- Error details are hidden in production for security

## Best Practices

1. **Always use error handling hooks** in components that make API calls
2. **Provide user-friendly messages** - don't expose technical details
3. **Log errors for monitoring** - use `logError()` for production tracking
4. **Use toast notifications** for immediate user feedback
5. **Handle loading states** - show loading indicators during async operations
6. **Retry on network errors** - the API client handles this automatically

## Example: Complete Error Handling

```tsx
'use client';

import { useState } from 'react';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useToast } from '@/components/ui/toast';
import { getVehicles } from '@/lib/vehicles-api';

export function VehiclesList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleAsyncError } = useErrorHandler();
  const toast = useToast();

  const loadVehicles = async () => {
    setLoading(true);
    
    const result = await handleAsyncError(
      async () => {
        const response = await getVehicles();
        return response.vehicles;
      },
      {
        showToast: true,
        logError: true,
        customMessage: 'Failed to load vehicles',
      }
    );

    if (result) {
      setVehicles(result);
      toast.success(`Loaded ${result.length} vehicles`);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {vehicles.map(vehicle => (
        <div key={vehicle.id}>{vehicle.title}</div>
      ))}
    </div>
  );
}
```

