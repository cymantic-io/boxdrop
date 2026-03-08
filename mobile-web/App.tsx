import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './app/navigation/AppNavigator';
import { useAuthStore } from './app/stores/useAuthStore';

const linking = {
  prefixes: ['http://localhost:8081'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: '',
              SaleDetail: 'sale/:saleId',
              ListingDetail: 'listing/:listingId',
            },
          },
        },
      },
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
    },
  },
});

export default function App() {
  const loadStoredTokens = useAuthStore((state) => state.loadStoredTokens);

  useEffect(() => {
    loadStoredTokens();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer linking={linking}>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
