import React from 'react';
import { Platform, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../theme';
import { TopNavBar } from '../components/TopNavBar';
import type {
  AuthStackParamList,
  HomeStackParamList,
  MapStackParamList,
  CreateSaleStackParamList,
  SavedStackParamList,
  ProfileStackParamList,
} from '../types';

const isWeb = Platform.OS === 'web';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Home screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { SaleDetailScreen } from '../screens/home/SaleDetailScreen';
import { ListingDetailScreen } from '../screens/home/ListingDetailScreen';
import { ClaimScreen } from '../screens/home/ClaimScreen';

// Map screens
import { MapScreen } from '../screens/map/MapScreen';
import { SaleDetailScreen as MapSaleDetailScreen } from '../screens/home/SaleDetailScreen';
import { ListingDetailScreen as MapListingDetailScreen } from '../screens/home/ListingDetailScreen';

// Create Sale screens
import { CreateSaleScreen } from '../screens/create/CreateSaleScreen';
import { AddListingsScreen } from '../screens/create/AddListingsScreen';

// Saved screens
import { SavedScreen } from '../screens/saved/SavedScreen';
import { ListingDetailScreen as SavedListingDetailScreen } from '../screens/home/ListingDetailScreen';

// Profile screens
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MySalesScreen } from '../screens/profile/MySalesScreen';
import { MyTransactionsScreen } from '../screens/transactions/MyTransactionsScreen';
import { InboxScreen } from '../screens/messaging/InboxScreen';
import { ChatScreen } from '../screens/messaging/ChatScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';

const defaultStackScreenOptions = {
  headerStyle: { backgroundColor: colors.darkSurface },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: 'bold' as const },
  ...(isWeb ? { headerShown: false } : {}),
};

// --- Auth Stack ---
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

// --- Home Stack ---
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Sale Details' }} />
      <HomeStackNav.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <HomeStackNav.Screen name="Claim" component={ClaimScreen} options={{ title: 'Claim Item' }} />
    </HomeStackNav.Navigator>
  );
}

// --- Map Stack ---
const MapStackNav = createNativeStackNavigator<MapStackParamList>();

function MapStack() {
  return (
    <MapStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <MapStackNav.Screen name="Map" component={MapScreen} />
      <MapStackNav.Screen name="SaleDetail" component={MapSaleDetailScreen} options={{ title: 'Sale Details' }} />
      <MapStackNav.Screen name="ListingDetail" component={MapListingDetailScreen} options={{ title: 'Listing Details' }} />
    </MapStackNav.Navigator>
  );
}

// --- Create Sale Stack ---
const CreateStackNav = createNativeStackNavigator<CreateSaleStackParamList>();

function CreateStack() {
  return (
    <CreateStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <CreateStackNav.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'Create Sale' }} />
      <CreateStackNav.Screen name="AddListings" component={AddListingsScreen} options={{ title: 'Add Listings' }} />
    </CreateStackNav.Navigator>
  );
}

// --- Saved Stack ---
const SavedStackNav = createNativeStackNavigator<SavedStackParamList>();

function SavedStack() {
  return (
    <SavedStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <SavedStackNav.Screen name="Saved" component={SavedScreen} />
      <SavedStackNav.Screen name="ListingDetail" component={SavedListingDetailScreen} options={{ title: 'Listing Details' }} />
    </SavedStackNav.Navigator>
  );
}

// --- Profile Stack ---
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} />
      <ProfileStackNav.Screen name="MySales" component={MySalesScreen} options={{ title: 'My Sales' }} />
      <ProfileStackNav.Screen name="MyTransactions" component={MyTransactionsScreen} options={{ title: 'My Transactions' }} />
      <ProfileStackNav.Screen name="Inbox" component={InboxScreen} />
      <ProfileStackNav.Screen name="Chat" component={ChatScreen} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStackNav.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
    </ProfileStackNav.Navigator>
  );
}

// --- Main Tabs ---
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
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
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="map-marker-radius" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateStack}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="plus-circle" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStack}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="heart" size={size} color={color} />,
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

// --- Root Navigator ---
const RootStack = createNativeStackNavigator();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}
