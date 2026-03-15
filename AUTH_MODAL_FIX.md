# Fixed: Auth Modal Not Triggering & 401 Errors on Protected Screens

## Issues

1. **"My Sales" tab hanging** - Auth modal not appearing when clicking protected tab as guest
2. **401 Unauthorized errors** - Getting 401 when navigating to Messages and other protected endpoints

## Root Cause

All protected screens had **empty dependency arrays** in their `useLayoutEffect` hooks:

```javascript
// ❌ BROKEN - runs only once on mount
React.useLayoutEffect(() => {
  if (!isAuthenticated) {
    setShowAuthPrompt(true);
  }
}, []);  // ← Empty array = never runs again
```

**Problem**: When `isAuthenticated` changes (user logs in/out), the effect doesn't run again. This causes:
- Auth modal not triggering on tab navigation
- API calls made without auth tokens (401 errors)
- Race conditions between auth state and API calls

## Solution

Added proper dependencies to all protected screen effects:

```javascript
// ✅ FIXED - runs whenever auth or setShowAuthPrompt changes
React.useLayoutEffect(() => {
  if (!isAuthenticated) {
    setShowAuthPrompt(true);
  }
}, [isAuthenticated, setShowAuthPrompt]);  // ← Includes dependencies
```

## Fixed Screens

| Screen | File | Fix |
|--------|------|-----|
| My Sales (sales tab) | `app/screens/sales/MySalesScreen.tsx` | ✅ |
| My Sales (profile) | `app/screens/profile/MySalesScreen.tsx` | ✅ |
| Profile | `app/screens/profile/ProfileScreen.tsx` | ✅ |
| Saved Items | `app/screens/saved/SavedScreen.tsx` | ✅ |
| My Transactions | `app/screens/transactions/MyTransactionsScreen.tsx` | ✅ |
| Create Sale | `app/screens/create/CreateSaleScreen.tsx` | ✅ |

## Effect of Fix

Now when a guest clicks a protected tab:
1. Tab navigation occurs
2. Screen mounts with `isAuthenticated = false`
3. `useLayoutEffect` runs immediately
4. `setShowAuthPrompt(true)` is called
5. `AppNavigator` changes `initialRouteName` to 'Auth'
6. Auth modal appears

And when a user logs in:
1. Auth flow completes
2. `setTokens()` is called in `useAuthStore`
3. API client gets the auth token (via interceptor)
4. `isAuthenticated` state changes to `true`
5. All protected screens' effects re-run
6. `setShowAuthPrompt(true)` no longer needed (user authenticated)
7. Screens can now make authenticated API calls

## Testing

```bash
1. Make sure you're logged out
2. Click "My Sales" tab → Auth modal should appear ✓
3. Click "Messages" tab → Auth modal should appear ✓
4. Login via email OTP
5. Navigate to "My Sales" → Should show sales list (no 401) ✓
6. Navigate to "Messages" → Should show threads (no 401) ✓
7. Navigate to "Saved" → Should show saved listings (no 401) ✓
8. Logout and repeat → Auth modal should appear again ✓
```

## Related Fixes

This fix works in conjunction with:
- `AppNavigator.tsx` - Stabilized component tree (earlier fix)
- `dev.sh - mobile:stop` - Helper to restart Expo cleanly
- `multi-cycle-auth.spec.ts` - E2E tests validating the fix
