import { useAuthStore } from '../../app/stores/useAuthStore';

jest.mock('../../app/services/api', () => ({
  setAuthToken: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import { setAuthToken } from '../../app/services/api';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  it('starts with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setTokens updates state and marks authenticated', () => {
    const { setTokens } = useAuthStore.getState();
    setTokens('access123', 'refresh456', 'user789');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access123');
    expect(state.refreshToken).toBe('refresh456');
    expect(state.userId).toBe('user789');
    expect(state.isAuthenticated).toBe(true);
    expect(setAuthToken).toHaveBeenCalledWith('access123');
  });

  it('logout clears state', async () => {
    const { setTokens, logout } = useAuthStore.getState();
    setTokens('access123', 'refresh456', 'user789');

    await logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.user).toBeNull();
    expect(setAuthToken).toHaveBeenCalledWith(null);
  });
});
