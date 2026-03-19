import { create } from 'zustand';
import * as Location from 'expo-location';

const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

async function fetchLocationFromDevice(): Promise<{ latitude: number; longitude: number } | null> {
  if (isWeb) return null;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (e) {
    console.log('[Location] Device geolocation error:', e);
    return null;
  }
}

async function fetchLocationFromBrowser(): Promise<{ latitude: number; longitude: number } | null> {
  console.log('[Location] Checking browser geolocation, isWeb:', isWeb, 'has geolocation:', !!navigator.geolocation);
  if (!isWeb || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[Location] Browser geolocation success:', position.coords.latitude, position.coords.longitude);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.log('[Location] Browser geolocation error:', err.message);
        resolve(null);
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}

async function fetchLocationFromIP(): Promise<{ latitude: number; longitude: number } | null> {
  console.log('[Location] Fetching IP geolocation...');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    console.log('[Location] IP geolocation response:', data);
    const latitude = typeof data.latitude === 'number' ? data.latitude : Number.parseFloat(data.latitude);
    const longitude = typeof data.longitude === 'number' ? data.longitude : Number.parseFloat(data.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
    return null;
  } catch (e) {
    console.log('[Location] IP geolocation error:', e);
    return null;
  }
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isLoading: boolean;
  requestLocation: () => Promise<void>;
  setTestLocation: (lat: number, lng: number) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  latitude: null,
  longitude: null,
  errorMsg: null,
  isLoading: false,

  requestLocation: async () => {
    console.log('[Location] requestLocation called');
    const state = get();
    if (state.isLoading || (state.latitude != null && state.longitude != null)) {
      console.log('[Location] Skipping - isLoading:', state.isLoading, 'has location:', state.latitude != null);
      return;
    }
    set({ isLoading: true, errorMsg: null });

    const deviceLocation = await fetchLocationFromDevice();
    if (deviceLocation) {
      console.log('[Location] Using device location');
      set({ ...deviceLocation, isLoading: false });
      return;
    }

    const browserLocation = await fetchLocationFromBrowser();
    if (browserLocation) {
      console.log('[Location] Using browser location');
      set({ ...browserLocation, isLoading: false });
      return;
    }

    const ipLocation = await fetchLocationFromIP();
    if (ipLocation) {
      console.log('[Location] Using IP location');
      set({ ...ipLocation, isLoading: false });
      return;
    }

    console.log('[Location] No location available');
    set({ errorMsg: 'Location unavailable', isLoading: false });
  },

  setTestLocation: (lat: number, lng: number) => {
    set({ latitude: lat, longitude: lng, isLoading: false });
  },
}));

// Eagerly request location on module load
if (typeof window !== 'undefined') {
  console.log('[Location] Module loaded, requesting location...');
  useLocationStore.getState().requestLocation();
}

if (typeof window !== 'undefined') {
  (window as any).__boxdropLocationStore = useLocationStore;
}
