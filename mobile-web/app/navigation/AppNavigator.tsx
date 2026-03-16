import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { colors } from '../theme';
import { TopNavBar } from '../components/TopNavBar';
import type {
  AuthStackParamList,
  HomeStackParamList,
  MySalesStackParamList,
  MessagesStackParamList,
  ProfileStackParamList,
} from '../types';

const isWeb = Platform.OS === 'web';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerifyCodeScreen } from '../screens/auth/VerifyCodeScreen';
import { MethodPickerScreen } from '../screens/auth/MethodPickerScreen';

// Home screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { SaleDetailScreen } from '../screens/home/SaleDetailScreen';
import { ListingDetailScreen } from '../screens/home/ListingDetailScreen';
import { ClaimScreen } from '../screens/home/ClaimScreen';

// My Sales screens
import { MySalesScreen as MySalesListScreen } from '../screens/sales/MySalesScreen';
import { ManageSaleScreen } from '../screens/sales/ManageSaleScreen';
import { CreateSaleScreen } from '../screens/create/CreateSaleScreen';
import { AddListingsScreen } from '../screens/create/AddListingsScreen';

// Saved screens
import { SavedScreen } from '../screens/saved/SavedScreen';

// Profile screens
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MyTransactionsScreen } from '../screens/transactions/MyTransactionsScreen';
import { InboxScreen } from '../screens/messaging/InboxScreen';
import { ChatScreen } from '../screens/messaging/ChatScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SecuritySettingsScreen } from '../screens/profile/SecuritySettingsScreen';
import { TOTPSetupScreen } from '../screens/profile/TOTPSetupScreen';
import { SMSSetupScreen } from '../screens/profile/SMSSetupScreen';

const defaultStackScreenOptions = {
  headerStyle: { backgroundColor: colors.darkSurface },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: 'bold' as const },
};

const webRootScreenOptions = isWeb ? { headerShown: false } as const : {};

// --- Auth Stack (overlay) ---
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();

function AuthStackOverlay() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer independent style={{ flex: 1 }}>
        <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
          <AuthStackNav.Screen name="Login" component={LoginScreen} />
          <AuthStackNav.Screen name="Register" component={RegisterScreen} />
          <AuthStackNav.Screen name="VerifyCode" component={VerifyCodeScreen} />
          <AuthStackNav.Screen name="MethodPicker" component={MethodPickerScreen} />
        </AuthStackNav.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

// --- Home Stack ---
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} options={webRootScreenOptions} />
      <HomeStackNav.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Sale Details' }} />
      <HomeStackNav.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <HomeStackNav.Screen name="Claim" component={ClaimScreen} options={{ title: 'Claim Item' }} />
    </HomeStackNav.Navigator>
  );
}

// --- My Sales Stack ---
const MySalesStackNav = createNativeStackNavigator<MySalesStackParamList>();

function MySalesStack() {
  return (
    <MySalesStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <MySalesStackNav.Screen name="MySalesList" component={MySalesListScreen} options={{ title: 'My Sales', ...webRootScreenOptions }} />
      <MySalesStackNav.Screen name="ManageSale" component={ManageSaleScreen} options={{ title: 'Manage Sale' }} />
      <MySalesStackNav.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'Create Sale' }} />
      <MySalesStackNav.Screen name="AddListings" component={AddListingsScreen} options={{ title: 'Add Listings' }} />
      <MySalesStackNav.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
    </MySalesStackNav.Navigator>
  );
}

// --- Messages Stack ---
const MessagesStackNav = createNativeStackNavigator<MessagesStackParamList>();

function MessagesStack() {
  return (
    <MessagesStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <MessagesStackNav.Screen name="Inbox" component={InboxScreen} options={{ title: 'Messages', ...webRootScreenOptions }} />
      <MessagesStackNav.Screen name="Chat" component={ChatScreen} />
    </MessagesStackNav.Navigator>
  );
}

// --- Profile Stack ---
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} options={webRootScreenOptions} />
      <ProfileStackNav.Screen name="MyTransactions" component={MyTransactionsScreen} options={{ title: 'My Transactions' }} />
      <ProfileStackNav.Screen name="Saved" component={SavedScreen} options={{ title: 'Saved Items' }} />
      <ProfileStackNav.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStackNav.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ title: 'Security' }} />
      <ProfileStackNav.Screen name="TOTPSetup" component={TOTPSetupScreen} options={{ title: 'Authenticator Setup' }} />
      <ProfileStackNav.Screen name="SMSSetup" component={SMSSetupScreen} options={{ title: 'SMS Setup' }} />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
    </ProfileStackNav.Navigator>
  );
}

// --- Main Tabs ---
const Tab = createBottomTabNavigator();

function MainTabs() {
  const loadNavigationState = useNavigationStore((state) => state.loadNavigationState);
  const currentTab = useNavigationStore((state) => state.currentTab);
  const setNavigationState = useNavigationStore((state) => state.setNavigationState);
  const [initialTab, setInitialTab] = React.useState<string | undefined>('HomeTab');
  const [forceReset, setForceReset] = React.useState(0);

  useEffect(() => {
    loadNavigationState().then((state) => {
      if (state?.tab) {
        setInitialTab(state.tab);
      }
    });
  }, [loadNavigationState]);

  const handleTabChange = (tab: string) => {
    setNavigationState(tab, null, null);
  };

  return (
    <Tab.Navigator
      key={forceReset}
      initialRouteName={initialTab}
      screenListeners={({ navigation }) => ({
        state: (e: any) => {
          const index = e.state?.index;
          const tabName = e.state?.routeNames?.[index];
          if (tabName && tabName !== currentTab) {
            handleTabChange(tabName);
          }
        },
      })}
      layout={isWeb ? ({ children, state, navigation, descriptors }: any) => (
        <View style={{ flex: 1 }}>
          <TopNavBar state={state} navigation={navigation} descriptors={descriptors} />
          {children}
        </View>
      ) : undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: isWeb
          ? { display: 'none' as const }
          : {
              backgroundColor: colors.white,
              borderTopColor: colors.borderLight,
              borderTopWidth: 1,
              elevation: 8,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
              height: 56,
              paddingBottom: 6,
            },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="map-search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MySalesTab"
        component={MySalesStack}
        options={{
          tabBarLabel: 'My Sales',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="tag-multiple" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="message-text" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="account" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple Auth Overlay - renders auth stack directly without nested NavigationContainer
function AuthOverlay() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }]} testID="auth-overlay">
      {isWeb ? (
        <View style={styles.authOverlayContainer}>
          <View style={styles.authOverlayCard}>
            <View style={styles.authOverlayContent}>
              <AuthStackOverlay />
            </View>
          </View>
        </View>
      ) : (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.authOverlayContainer}>
            <View style={styles.authOverlayCard}>
              <View style={styles.authOverlayContent}>
                <AuthStackOverlay />
              </View>
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const showAuthPrompt = useAuthStore((state) => state.showAuthPrompt);

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.white }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
      {showAuthPrompt && <AuthOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  authOverlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  authOverlayCard: {
    width: '100%',
    maxWidth: 440,
    minWidth: 320,
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.darkSurface,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  authOverlayContent: {
    flex: 1,
    minHeight: 420,
  },
});
