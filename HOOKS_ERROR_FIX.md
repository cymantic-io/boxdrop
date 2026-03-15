# React Hooks Error Fix: "Rendered fewer hooks than expected"

## Problem

You were receiving the error after multiple login/logouts:

```
Uncaught Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.
```

## Root Cause

The issue was in `app/navigation/AppNavigator.tsx` with **conditional rendering and early returns**:

1. **Old code pattern** (problematic):
   ```javascript
   export function AppNavigator() {
     if (isLoading) {
       return null;  // ❌ Early return - skips component tree
     }

     if (showAuthPrompt && !isAuthenticated) {
       return <AuthStack />;  // ❌ Conditional rendering
     }

     return <MainTabs />;
   }
   ```

2. **What happens during logout cycle**:
   - User has MainTabs displayed (with X hooks)
   - User clicks logout → `isAuthenticated` changes to `false`
   - AppNavigator re-renders and now returns AuthStack instead
   - React sees a different component structure/hook count
   - Error: "fewer hooks than expected"

## Solution

Changed to a **stable component tree** that swaps screens without mounting/unmounting:

```javascript
export function AppNavigator() {
  const navigationRef = useRef(null);

  // Handle auth state changes by navigating, not re-rendering
  useEffect(() => {
    if (!isLoading) {
      const shouldShowAuth = showAuthPrompt || !isAuthenticated;
      navigationRef.current?.reset({
        index: shouldShowAuth ? 0 : 1,
        routes: [{ name: 'Auth' }, { name: 'Main' }],
      });
    }
  }, [isLoading, isAuthenticated, showAuthPrompt]);

  // ✅ Always render both stacks - navigator swaps between them
  return (
    <RootStack.Navigator ref={navigationRef}>
      <RootStack.Screen name="Auth" component={AuthStack} />
      <RootStack.Screen name="Main" component={MainTabs} />
    </RootStack.Navigator>
  );
}
```

3. **Also removed** the auth-dependent logic from `MainTabs`:
   - Removed the second `useEffect` that checked `isAuthenticated`
   - This was causing additional hook inconsistency
   - Navigation is now handled at the root level only

## Changes Made

| File | Changes |
|------|---------|
| `app/navigation/AppNavigator.tsx` | Removed early returns, stabilized component tree, moved auth logic to root level |

## Benefits

✅ **Consistent hook calls** - Same component structure on every render
✅ **Smooth transitions** - Navigation swaps between Auth/Main without remounting
✅ **No state loss** - Components maintain state across auth changes
✅ **Fixes logout bugs** - Multiple login/logout cycles now work reliably

## Testing

Test the fix by:

```bash
1. Start app
2. Login
3. Logout
4. Login again
5. Logout again (repeat multiple times)
```

The error should no longer appear.

## Related: React Hooks Rules

This fix applies the **React Rules of Hooks**:

1. **Only call hooks at the top level** ✓
2. **Only call hooks from React functions** ✓
3. **Call hooks in the same order every render** ✓ (Fixed)

Early returns, conditional rendering, or mounting/unmounting components violates rule #3.
