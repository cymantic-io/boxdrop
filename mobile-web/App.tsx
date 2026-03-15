import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './app/navigation/AppNavigator';
import { useAuthStore } from './app/stores/useAuthStore';
import { paperTheme } from './app/theme';
import { FunPopupContainer } from './app/components/FunPopup';

export const navigationRef = createNavigationContainerRef();

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() ?? '';
    if (message.includes('shadow') || message.includes('pointerEvents') || message.includes('useNativeDriver')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

const linking: any = {
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const showAuthPrompt = useAuthStore((state) => state.showAuthPrompt);
  const prevStateRef = React.useRef<{ isAuthenticated: boolean; showAuthPrompt: boolean }>({
    isAuthenticated: true,
    showAuthPrompt: false,
  });

  useEffect(() => {
    loadStoredTokens();
  }, []);

  // Handle navigation when auth state changes
  useEffect(() => {
    const targetRoute = showAuthPrompt || !isAuthenticated ? 'Auth' : 'Main';
    const prevRoute = prevStateRef.current.showAuthPrompt || !prevStateRef.current.isAuthenticated ? 'Auth' : 'Main';

    // Only navigate if the target route changed
    if (targetRoute !== prevRoute && navigationRef.isReady()) {
      if (targetRoute === 'Auth') {
        // Navigate to Auth screen
        navigationRef.navigate('Auth' as never);
      } else {
        // Navigate to Main screen
        navigationRef.navigate('Main' as never);
      }
    }

    prevStateRef.current = { isAuthenticated, showAuthPrompt };
  }, [showAuthPrompt, isAuthenticated]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer linking={linking} ref={navigationRef}>
            <StatusBar style="light" />
            <AppNavigator />
            <FunPopupContainer />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
