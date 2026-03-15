import React, { useEffect } from 'react';
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

  useEffect(() => {
    loadStoredTokens();
  }, []);

  // Set document title on mount and for navigation
  useEffect(() => {
    const handleStateChange = () => {
      const state = navigationRef.current?.getRootState();
      if (!state) return;
      
      // Navigate through nested navigators to find the current screen
      let route = state.routes[state.index];
      while (route.state && 'routes' in route.state && route.state.index !== undefined) {
        route = route.state.routes[route.state.index];
      }
      
      if (route?.name) {
        const title = getScreenTitle(route.name);
        document.title = title ? `${title} | BoxDrop` : 'BoxDrop';
      }
    };

    const subscription = navigationRef.addListener('state', handleStateChange);
    handleStateChange(); // Set initial title

    return () => {
      subscription();
    };
  }, []);

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

function getScreenTitle(routeName: string): string {
  const titles: Record<string, string> = {
    Home: 'Explore',
    HomeTab: 'Explore',
    SaleDetail: 'Sale Details',
    ListingDetail: 'Listing Details',
    Claim: 'Claim Item',
    MySalesList: 'My Sales',
    ManageSale: 'Manage Sale',
    CreateSale: 'Create Sale',
    AddListings: 'Add Listings',
    Inbox: 'Messages',
    Chat: 'Chat',
    Profile: 'Profile',
    MyTransactions: 'My Transactions',
    Saved: 'Saved Items',
    EditProfile: 'Edit Profile',
    Settings: 'Settings',
    SecuritySettings: 'Security',
    TOTPSetup: 'Authenticator Setup',
    SMSSetup: 'SMS Setup',
    Login: 'Login',
    Register: 'Register',
    VerifyCode: 'Verify Code',
    MethodPicker: 'Choose Method',
  };
  return titles[routeName] || '';
}
