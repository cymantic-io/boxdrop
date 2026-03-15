# Complete Auth Flow Fix Documentation

## Issues Fixed

### 1. ❌ Auth Modal Hanging When Accessing Protected Tabs as Guest
**Symptom**: Clicking "My Sales" or "Messages" as an unauthenticated guest would hang instead of showing the auth modal.

**Root Cause**: The `setShowAuthPrompt(true)` call was setting a state flag but the React Navigation RootStack wasn't actually switching from the 'Main' screen to the 'Auth' screen. The `initialRouteName` prop only works on first render; after that, the navigator stays on its current route regardless of prop changes.

### 2. ❌ 401 Unauthorized on Messages API
**Symptom**: Navigating to Messages tab as guest showed a 401 error instead of auth modal.

**Root Cause**: The `useThreads()` hook had no `enabled` option and would immediately execute API calls, even for unauthenticated users. When no token was available in the store, the API would return 401.

## Implementation Details

### Fix #1: Added Navigator Reset Logic

**File**: `mobile-web/app/navigation/AppNavigator.tsx`

Added:
1. Import navigationRef from App.tsx
2. New useEffect that monitors `showAuthPrompt` and `isAuthenticated` changes
3. When these change, calls `navigationRef.reset()` to switch between 'Auth' and 'Main' stacks

```typescript
import { navigationRef } from '../App';

export function AppNavigator() {
  // ... existing code ...

  // Reset the navigator when auth state changes to switch between Auth and Main stacks
  useEffect(() => {
    if (navigationRef?.isReady?.()) {
      const targetRoute = showAuthPrompt || !isAuthenticated ? 'Auth' : 'Main';
      navigationRef.reset({
        index: 0,
        routes: [{ name: targetRoute }],
      });
    }
  }, [showAuthPrompt, isAuthenticated]);

  // ... rest of code ...
}
```

**How It Works**:
- When a protected screen calls `setShowAuthPrompt(true)`
- The useEffect detects the change immediately
- It resets the navigator to the 'Auth' route
- User sees the auth modal instead of hanging

### Fix #2: Added `enabled` Option to useThreads

**File**: `mobile-web/app/hooks/useMessages.ts`

Changed `useThreads()` to accept optional `enabled` parameter:

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

This matches the pattern already used in:
- `useMySales(options?: { enabled?: boolean })`
- `useTransactions(options?: { enabled?: boolean })`

### Fix #3: Added Auth Protection to InboxScreen

**File**: `mobile-web/app/screens/messaging/InboxScreen.tsx`

Added:
1. Import useAuthStore
2. Check isAuthenticated and setShowAuthPrompt in useLayoutEffect
3. Pass `enabled: isAuthenticated` to useThreads

```typescript
export function InboxScreen({ navigation }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setShowAuthPrompt = useAuthStore((s) => s.setShowAuthPrompt);

  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true, 'MessagesTab');
    }
  }, [isAuthenticated, setShowAuthPrompt]);

  const { data: threads, isLoading, isError, error, refetch } = useThreads({
    enabled: isAuthenticated
  });
  // ... rest of component
}
```

This now matches the pattern in all other protected screens:
- `MySalesScreen`
- `SavedScreen`
- `MyTransactionsScreen`
- `ProfileScreen`
- `EditProfileScreen`
- `CreateSaleScreen`

## How It All Works Together

### Guest User Journey (Fixed):

1. **User launches app**:
   - App not authenticated
   - `AppNavigator` renders with `initialRouteName='Main'` (or 'Auth' depending on showAuthPrompt)

2. **Guest clicks "My Sales"**:
   - App navigates to MySalesTab → MySalesScreen
   - MySalesScreen's useLayoutEffect runs
   - Detects `isAuthenticated=false`
   - Calls `setShowAuthPrompt(true, 'MySalesTab')`
   - AppNavigator's useEffect is triggered
   - Calls `navigationRef.reset({ routes: [{ name: 'Auth' }] })`
   - **Auth modal appears ✓** (No hanging, no errors)

3. **Guest clicks "Messages"**:
   - App navigates to MessagesTab → InboxScreen
   - InboxScreen's useLayoutEffect runs
   - Detects `isAuthenticated=false`
   - Calls `setShowAuthPrompt(true, 'MessagesTab')`
   - AppNavigator resets to 'Auth' stack
   - useThreads has `enabled: false` so NO API call is made
   - **Auth modal appears ✓** (No 401 errors, no hanging)

4. **Guest registers/logs in**:
   - Authentication succeeds
   - `useAuthStore` sets `isAuthenticated=true` and `showAuthPrompt=false`
   - AppNavigator's useEffect is triggered
   - Calls `navigationRef.reset({ routes: [{ name: 'Main' }] })`
   - User is taken to the Main app

### Authenticated User Journey:

1. **Messages tab now works properly**:
   - `isAuthenticated=true`
   - `useThreads({ enabled: true })` - API call is enabled
   - Token is automatically added by API interceptor
   - **List of messages loads** ✓

2. **Other protected tabs work**:
   - All follow the same pattern
   - Auth is checked before any API calls
   - Modal shows instead of errors

## Testing

These fixes are validated by E2E tests in:
- `tests/e2e/auth.spec.ts` - Core auth flow tests
- `tests/e2e/multi-cycle-auth.spec.ts` - Multiple login/logout cycles

Key test: "clicking My Sales triggers auth modal for guest" - This specifically tests the issue that was happening.

## Files Modified Summary

1. **`mobile-web/app/navigation/AppNavigator.tsx`**
   - Added navigationRef import
   - Added useEffect to reset navigator on auth state changes

2. **`mobile-web/app/hooks/useMessages.ts`**
   - Added `enabled` option to useThreads

3. **`mobile-web/app/screens/messaging/InboxScreen.tsx`**
   - Added auth check via useLayoutEffect
   - Added `enabled: isAuthenticated` to useThreads call

## Why These Fixes Work

- **Navigator Reset**: React Navigation needs explicit navigation commands to switch between major route groups. Setting a prop isn't enough.
- **Enabled Option**: React Query's `enabled` option prevents query execution. This prevents API calls with missing tokens.
- **Auth Guard**: Checking authentication state immediately in useLayoutEffect ensures user is redirected before any data fetching or rendering.
- **Consistent Pattern**: All protected screens now follow the same pattern, which is maintainable and reliable.

## Result

✅ No more hanging on protected tabs
✅ No more 401 errors
✅ Auth modal appears properly when needed
✅ All protected screens properly guard access
✅ Messages endpoint works correctly when authenticated
