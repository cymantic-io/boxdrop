# Auth Flow Fix Summary

## Problem Identified

The application had two critical issues preventing proper authentication:

1. **401 Unauthorized on Messages API**: When users navigated to Messages, they would get a 401 error instead of seeing the auth modal
2. **Auth Modal Hanging**: When unauthenticated guests tried to navigate to protected tabs, the UI would hang instead of showing the auth prompt

### Root Cause

The `useThreads()` hook was **unconditionally executing** API calls immediately on component render, without:
1. Checking if user was authenticated
2. Having an `enabled` option to prevent execution when unauthenticated

This meant:
- Guest users would trigger API calls to fetch messages
- No tokens in store → 401 errors
- No auth guard to show modal → errors displayed instead

## Fixes Applied

### 1. Fixed `useMessages.ts` Hook

**Before**: `useThreads()` had no way to conditionally disable the API call

```typescript
export function useThreads() {
  return useQuery({
    queryKey: messageKeys.list(),
    queryFn: getThreads,
    staleTime: 30 * 1000,
  });
}
```

**After**: Added optional `enabled` parameter (matching pattern from `useSales` and `useTransactions`)

```typescript
export function useThreads(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: messageKeys.list(),
    queryFn: getThreads,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 30 * 1000,
  });
}
```

### 2. Added Auth Protection to `InboxScreen.tsx`

**Before**: No auth checks, direct API call

```typescript
export function InboxScreen({ navigation }: Props) {
  const { data: threads, isLoading, isError, error, refetch } = useThreads();
  // ... rest of component
}
```

**After**: Added auth guard and conditional query execution

```typescript
export function InboxScreen({ navigation }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setShowAuthPrompt = useAuthStore((s) => s.setShowAuthPrompt);

  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true, 'MessagesTab');
    }
  }, [isAuthenticated, setShowAuthPrompt]);

  const { data: threads, isLoading, isError, error, refetch } = useThreads({ enabled: isAuthenticated });
  // ... rest of component
}
```

## How This Fixes The Issues

### Issue 1: 401 Errors on Messages
- ✅ When guest navigates to Messages tab:
  - `isAuthenticated` is `false`
  - `useLayoutEffect` calls `setShowAuthPrompt(true, 'MessagesTab')`
  - `useThreads({ enabled: false })` prevents API call
  - Auth modal appears instead of 401 error

### Issue 2: Auth Modal Hanging
- ✅ When guest tries to access any protected tab:
  - Auth protection triggers immediately
  - `setShowAuthPrompt(true)` signals app to show modal
  - Component renders in auth-protected state
  - No hanging, clean UI transition

## Test Validation

These fixes are validated by the existing E2E tests:
- `tests/e2e/auth.spec.ts` - Basic auth flow tests
- `tests/e2e/multi-cycle-auth.spec.ts` - Multiple login/logout cycles

The pattern applied to `InboxScreen` now matches all other protected screens:
- `MySalesScreen`
- `SavedScreen`
- `MyTransactionsScreen`
- `ProfileScreen`
- `EditProfileScreen`
- `CreateSaleScreen`

## Files Modified

1. `mobile-web/app/hooks/useMessages.ts` - Added `enabled` option
2. `mobile-web/app/screens/messaging/InboxScreen.tsx` - Added auth protection
