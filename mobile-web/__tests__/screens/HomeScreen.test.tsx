import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../../app/stores/useLocationStore', () => ({
  useLocationStore: () => ({
    location: { latitude: 40.7128, longitude: -74.006 },
    requestLocation: jest.fn(),
  }),
}));

jest.mock('../../app/hooks', () => ({
  useNearbySales: () => ({
    data: [
      {
        id: 's1',
        sellerId: 'u1',
        title: 'Test Sale',
        description: 'A test sale',
        address: '123 Main St',
        latitude: 40.7128,
        longitude: -74.006,
        startsAt: '2025-06-15T09:00:00Z',
        endsAt: '2025-06-15T17:00:00Z',
        status: 'ACTIVE',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      },
    ],
    isLoading: false,
    refetch: jest.fn(),
    isRefetching: false,
  }),
  useSearch: () => ({
    data: [],
    isLoading: false,
    refetch: jest.fn(),
    isRefetching: false,
  }),
}));

import { HomeScreen } from '../../app/screens/home/HomeScreen';

describe('HomeScreen', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const defaultProps: any = {
    navigation: { navigate: jest.fn() } as any,
    route: { params: undefined, key: 'Home', name: 'Home' as const },
  };

  it('renders sales list', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getByText('Test Sale')).toBeTruthy();
  });

  it('renders search bar', () => {
    const { getByPlaceholderText } = render(
      <QueryClientProvider client={queryClient}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getByPlaceholderText('Search sales and listings...')).toBeTruthy();
  });
});
