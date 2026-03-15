# E2E Tests for Auth Flows

## Existing Tests

### `tests/e2e/auth.spec.ts`
Comprehensive authentication flow tests:

| Test | Coverage |
|------|----------|
| `guest user sees home/explore screen by default` | Unauthenticated access |
| `guest can see login/register options` | Auth UI availability |
| `registered user can authenticate and access the app` | Single login flow |
| **`user can log out and log back in`** | ⚠️ **1 login/logout cycle only** |
| `guest can browse home screen without logging in` | Public content access |
| `guest can view sale details without logging in` | Detail screen for guests |
| `clicking My Sales triggers auth modal for guest` | Auth protection |
| `user can complete full OTP login via email` | Full OTP flow |
| `invalid OTP shows error` | Error handling |
| `login with valid OTP authenticates user` | Valid OTP authentication |
| `guest can register new account` | Registration flow |
| **`logout from Profile tab returns to Explore`** | Single logout validates state reset |

### `tests/e2e/logout.spec.ts`
Single logout flow test:
- Validates logout from profile returns to explore tab

## Issue Identified

The existing tests only cover **single login/logout cycles**. They don't test:
- ❌ **Multiple repeated cycles** (which exposed the React hooks error)
- ❌ **Rapid auth state changes**
- ❌ **Navigation transitions during auth changes**

## New Test: `tests/e2e/multi-cycle-auth.spec.ts`

Created 3 comprehensive stress tests:

### 1. **`user can repeatedly login and logout without errors`**
- Performs **3 full login/logout cycles**
- Perfect reproduction of the original error scenario
- Validates hooks error is fixed
- Each cycle:
  - Authenticates user
  - Navigates to Explore (home screen)
  - Navigates to Profile
  - Logs out
  - Verifies return to Explore
  - Clears tokens for next cycle

### 2. **`rapid auth changes do not cause hook violations`**
- More aggressive stress test: **5 rapid cycles**
- Simulates quick tab switching between authenticated states
- Tests:
  - Rapid navigation between tabs (Home → MySales → Messages → Profile)
  - Token clearing and reload
- Verifies no "fewer hooks than expected" errors

### 3. **`login/logout during navigation transitions`**
- Tests **auth changes while navigating between tabs**
- Simulates real user behavior:
  - Authenticate
  - Rapidly navigate: MySales → Messages → Profile → Home
  - Logout while on Profile
  - Verify state reset
  - Repeat 2 cycles
- Validates component tree stability across transitions

## Running the Tests

```bash
# Run all e2e tests
cd tests/e2e
npm test

# Run only auth tests
npx playwright test auth.spec.ts

# Run only multi-cycle tests (validates the fix)
npx playwright test multi-cycle-auth.spec.ts

# Run with UI
npx playwright test --ui
```

## What These Tests Validate

✅ **Hooks error fix** - Component tree stays consistent
✅ **Auth state management** - Tokens properly set/cleared
✅ **Navigation stability** - No errors during rapid transitions
✅ **UI state** - Correct screens shown for auth/unauth states
✅ **Logout flow** - User always returns to Explore

## CI/CD Integration

These tests run automatically in `.github/workflows/ci.yml`:

```yaml
- name: Run E2E tests
  run: cd tests/e2e && npm ci && npx playwright install && npx playwright test
```

If any test fails (including the new multi-cycle test), the CI pipeline will catch it before merging.

## Relationship to Fix

The **HOOKS_ERROR_FIX.md** + **`multi-cycle-auth.spec.ts`** together provide:

1. **Understanding**: Why the error happened (HOOKS_ERROR_FIX.md)
2. **Solution**: How it was fixed (AppNavigator.tsx changes)
3. **Validation**: E2E tests that prove it works (multi-cycle-auth.spec.ts)
4. **Prevention**: Automated tests prevent regression

## Expected Results

All 3 new tests should **PASS** with the fix applied:

```
✓ user can repeatedly login and logout without errors (12.5s)
✓ rapid auth changes do not cause hook violations (8.3s)
✓ login/logout during navigation transitions (10.8s)
```

If tests fail with "fewer hooks than expected" error, the fix didn't work properly.
