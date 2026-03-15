import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const NAV_STATE_KEY = 'navigation_state';

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

interface NavigationState {
  currentTab: string;
  currentRoute: string | null;
  params: Record<string, any> | null;
  setNavigationState: (tab: string, route: string | null, params?: Record<string, any> | null) => void;
  loadNavigationState: () => Promise<{ tab: string; route: string | null; params: Record<string, any> | null } | null>;
  clearNavigationState: () => Promise<void>;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentTab: 'HomeTab',
  currentRoute: null,
  params: null,

  setNavigationState: async (tab, route, params = null) => {
    set({ currentTab: tab, currentRoute: route, params });
    try {
      await storage.setItem(NAV_STATE_KEY, JSON.stringify({ tab, route, params }));
    } catch (e) {
      console.warn('Failed to save navigation state', e);
    }
  },

  loadNavigationState: async () => {
    try {
      const saved = await storage.getItem(NAV_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        set({ currentTab: state.tab, currentRoute: state.route, params: state.params });
        return state;
      }
    } catch (e) {
      console.warn('Failed to load navigation state', e);
    }
    return null;
  },

  clearNavigationState: async () => {
    set({ currentTab: 'HomeTab', currentRoute: null, params: null });
    try {
      await storage.deleteItem(NAV_STATE_KEY);
    } catch (e) {
      console.warn('Failed to clear navigation state', e);
    }
  },
}));
