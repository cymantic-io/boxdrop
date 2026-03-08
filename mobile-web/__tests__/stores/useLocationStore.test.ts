import { useLocationStore } from '../../app/stores/useLocationStore';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 40.7128, longitude: -74.006 },
  }),
}));

describe('useLocationStore', () => {
  beforeEach(() => {
    useLocationStore.setState({
      latitude: null,
      longitude: null,
      errorMsg: null,
      isLoading: false,
    });
  });

  it('starts with null coordinates', () => {
    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
  });

  it('requestLocation updates coordinates', async () => {
    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
    expect(state.isLoading).toBe(false);
  });

  it('requestLocation sets error when permission denied', async () => {
    const Location = require('expo-location');
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.errorMsg).toBe('Location permission denied');
  });

  it('requestLocation sets error on failure', async () => {
    const Location = require('expo-location');
    Location.getCurrentPositionAsync.mockRejectedValueOnce(new Error('fail'));

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.errorMsg).toBe('Failed to get location');
    expect(state.isLoading).toBe(false);
  });
});
