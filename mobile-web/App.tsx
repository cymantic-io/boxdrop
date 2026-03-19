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
  (window as any).__boxdropLastError = null;

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('error', (event) => {
      (window as any).__boxdropLastError = event.error?.message ?? event.message ?? 'Unknown window error';
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = (event as PromiseRejectionEvent).reason;
      (window as any).__boxdropLastError = reason?.message ?? String(reason);
    });
  }

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() ?? '';
    if (message.includes('shadow') || message.includes('pointerEvents') || message.includes('useNativeDriver')) {
      return;
    }
    originalWarn.apply(console, args);
  };

  (window as any).__boxdropNavigate = (tabName: string, options?: unknown) => {
    if (!navigationRef.isReady()) {
      return;
    }
    navigationRef.navigate(tabName as never, options as never);
  };

  (window as any).__boxdropOpenChat = async (threadId: string, listingTitle?: string) => {
    if (!navigationRef.isReady()) {
      return false;
    }

    navigationRef.navigate('MessagesTab' as never, {
      screen: 'Inbox',
    } as never);

    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      const state = navigationRef.getRootState();
      const activeRoute = state?.routes?.[state.index ?? 0];
      if (activeRoute?.name === 'MessagesTab') {
        navigationRef.navigate('MessagesTab' as never, {
          screen: 'Chat',
          params: {
            threadId,
            listingTitle,
          },
        } as never);
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return false;
  };

  (window as any).__boxdropGetNavState = () => {
    if (!navigationRef.isReady()) {
      return null;
    }
    return navigationRef.getRootState();
  };

  (window as any).__boxdropGetLastError = () => (window as any).__boxdropLastError;
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
