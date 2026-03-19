import { useLocationStore } from '../../app/stores/useLocationStore';

const mockRequestPermissions = jest.fn();
const mockGetPosition = jest.fn();
const mockGetCurrentPosition = jest.fn();
const mockFetch = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestPermissions(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetPosition(...args),
  Accuracy: { Balanced: 4 },
}));

describe('useLocationStore', () => {
  beforeEach(() => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetPosition.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });
    mockGetCurrentPosition.mockReset();
    mockFetch.mockReset();
    (global as typeof globalThis).fetch = mockFetch;
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: (...args: unknown[]) => mockGetCurrentPosition(...args) },
      configurable: true,
    });
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

  it('requestLocation updates coordinates from browser geolocation', async () => {
    mockGetCurrentPosition.mockImplementation((success: (position: { coords: { latitude: number; longitude: number } }) => void) => {
      success({ coords: { latitude: 40.7128, longitude: -74.006 } });
    });
    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
    expect(state.isLoading).toBe(false);
  });

  it('requestLocation sets error when all methods fail', async () => {
    mockGetCurrentPosition.mockImplementation((_success: unknown, error: (err: { message: string }) => void) => {
      error({ message: 'User denied Geolocation' });
    });
    mockFetch.mockRejectedValueOnce(new Error('network'));

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.errorMsg).toBe('Location unavailable');
    expect(state.isLoading).toBe(false);
  });

  it('requestLocation does not duplicate requests when already loading', async () => {
    useLocationStore.setState({ isLoading: true });
    mockRequestPermissions.mockClear();
    mockGetPosition.mockClear();

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockGetPosition).not.toHaveBeenCalled();
  });

  it('requestLocation does not duplicate requests when location already obtained', async () => {
    useLocationStore.setState({ latitude: 40.7128, longitude: -74.006 });
    mockRequestPermissions.mockClear();
    mockGetPosition.mockClear();

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockGetPosition).not.toHaveBeenCalled();
  });
});
