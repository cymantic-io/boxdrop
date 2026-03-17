import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigationStore } from './useNavigationStore';
import { setAuthToken } from '../services/api';
import type { User } from '../types';

// expo-secure-store is native-only; use localStorage on web
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const TOKEN_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';
const USER_ID_KEY = 'auth_user_id';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthPrompt: boolean;
  authRedirectRoute: string | null;
  isLoggingOut: boolean;
  login: (challengeId: string, method: string, code: string) => Promise<void>;
  register: (challengeId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string, userId: string) => void;
  loadStoredTokens: () => Promise<void>;
  setShowAuthPrompt: (show: boolean, redirectRoute?: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  showAuthPrompt: false,
  authRedirectRoute: null,
  isLoggingOut: false,

  setShowAuthPrompt: (show, redirectRoute) => {
    if (get().isLoggingOut) return;
    set({ showAuthPrompt: show, authRedirectRoute: show ? redirectRoute ?? null : null });
    if (!show) {
      try {
        const { navigationRef } = require('../../App');
        const { currentTab, currentRoute, params } = useNavigationStore.getState();
        if (navigationRef?.current?.isReady()) {
          if (currentRoute) {
            navigationRef.current.navigate(currentTab, { screen: currentRoute, params: params ?? undefined });
          } else if (currentTab) {
            navigationRef.current.navigate(currentTab);
          }
        }
      } catch (e) {
        console.warn('Failed to restore navigation after auth dismiss', e);
      }
    }
  },

  setTokens: (accessToken, refreshToken, userId) => {
    setAuthToken(accessToken);
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_KEY, refreshToken);
    storage.setItem(USER_ID_KEY, userId);
    const redirectRoute = get().authRedirectRoute;
    set({ accessToken, refreshToken, userId, isAuthenticated: true, showAuthPrompt: false, authRedirectRoute: null });
    
    // Navigate to redirect route if set
    if (redirectRoute) {
      setTimeout(() => {
        try {
          const { navigationRef } = require('../../App');
          if (navigationRef?.current?.navigate) {
            navigationRef.current.navigate(redirectRoute);
          }
        } catch (e) {}
      }, 100);
    }
  },

  login: async (challengeId, method, code) => {
    const { loginVerify } = require('../services/api');
    const response = await loginVerify(challengeId, method, code);
    get().setTokens(response.accessToken, response.refreshToken, response.userId);
  },

  register: async (challengeId, code) => {
    const { registerVerify } = require('../services/api');
    const response = await registerVerify(challengeId, code);
    get().setTokens(response.accessToken, response.refreshToken, response.userId);
  },

  logout: async () => {
    set({ isLoggingOut: true });
    setAuthToken(null);
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(REFRESH_KEY);
    await storage.deleteItem(USER_ID_KEY);
    useNavigationStore.getState().clearNavigationState();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
      showAuthPrompt: false,
      authRedirectRoute: null,
    });
    
    // Navigate to HomeTab after logout
    try {
      const { navigationRef } = require('../../App');
      if (navigationRef?.current?.isReady()) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'HomeTab' }],
        });
      } else if (navigationRef?.current?.navigate) {
        navigationRef.current.navigate('HomeTab');
      }
    } catch (e) {
      console.warn('Failed to navigate after logout', e);
    }
    
    // Clear the logout flag after navigation completes
    setTimeout(() => {
      set({ isLoggingOut: false });
    }, 500);
  },

  loadStoredTokens: async () => {
    try {
      const accessToken = await storage.getItem(TOKEN_KEY);
      const refreshToken = await storage.getItem(REFRESH_KEY);
      const userId = await storage.getItem(USER_ID_KEY);

      if (accessToken && refreshToken && userId) {
        setAuthToken(accessToken);
        set({
          accessToken,
          refreshToken,
          userId,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
