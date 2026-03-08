import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string, userId: string) => void;
  loadStoredTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: (accessToken, refreshToken, userId) => {
    setAuthToken(accessToken);
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_KEY, refreshToken);
    storage.setItem(USER_ID_KEY, userId);
    set({ accessToken, refreshToken, userId, isAuthenticated: true });
  },

  login: async (email, password) => {
    // Import lazily to avoid circular dependency
    const { login: apiLogin } = require('../services/api');
    const response = await apiLogin({ email, password });
    get().setTokens(response.accessToken, response.refreshToken, response.userId);
  },

  register: async (email, password, displayName) => {
    const { register: apiRegister } = require('../services/api');
    const response = await apiRegister({ email, password, displayName });
    get().setTokens(response.accessToken, response.refreshToken, response.userId);
  },

  logout: async () => {
    setAuthToken(null);
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(REFRESH_KEY);
    await storage.deleteItem(USER_ID_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
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
