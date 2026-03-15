import { create } from 'zustand';
import * as Location from 'expo-location';

async function fetchLocationFromIP(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

const DEFAULT_LOCATION = { latitude: 37.5584, longitude: -90.2714 };

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isLoading: boolean;
  requestLocation: () => Promise<void>;
  setTestLocation: (lat: number, lng: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  errorMsg: null,
  isLoading: false,

  requestLocation: async () => {
    const state = useLocationStore.getState();
    if (state.isLoading || (state.latitude != null && state.longitude != null)) {
      return;
    }
    set({ isLoading: true, errorMsg: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const ipLocation = await fetchLocationFromIP();
        if (ipLocation) {
          set({ ...ipLocation, isLoading: false });
          return;
        }
        set({ errorMsg: 'Location permission denied', isLoading: false });
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
      });
      set({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        isLoading: false,
      });
    } catch (error) {
      const ipLocation = await fetchLocationFromIP();
      if (ipLocation) {
        set({ ...ipLocation, isLoading: false });
        return;
      }
      set({ ...DEFAULT_LOCATION, errorMsg: 'Failed to get location', isLoading: false });
    }
  },

  setTestLocation: (lat: number, lng: number) => {
    set({ latitude: lat, longitude: lng, isLoading: false });
  },
}));

if (typeof window !== 'undefined') {
  (window as any).__boxdropLocationStore = useLocationStore;
}
