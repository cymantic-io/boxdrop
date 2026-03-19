import React, { useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import BoxdropIcon from '../../assets/boxdrop-icon.svg';

interface NavItem {
  key: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'HomeTab', label: 'Explore', icon: 'map-search' },
  { key: 'MySalesTab', label: 'My Sales', icon: 'tag-multiple' },
  { key: 'MessagesTab', label: 'Messages', icon: 'message-text' },
  { key: 'ProfileTab', label: 'Profile', icon: 'account' },
];

const ROOT_ROUTES: Record<string, string> = {
  HomeTab: 'Home',
  MySalesTab: 'MySalesList',
  MessagesTab: 'Inbox',
  ProfileTab: 'Profile',
};

export function TopNavBar() {
  const activeTab = useSyncExternalStore(
    (onStoreChange) => {
      const { navigationRef } = require('../../App');
      if (!navigationRef?.addListener) {
        return () => {};
      }

      return navigationRef.addListener('state', onStoreChange);
    },
    () => {
      const { navigationRef } = require('../../App');
      if (!navigationRef?.isReady?.()) {
        return 'HomeTab';
      }
      return getActiveTabName(navigationRef.getRootState());
    },
    () => 'HomeTab'
  );

  const handleNavPress = (key: string) => {
    const { navigationRef } = require('../../App');
    const rootRoute = ROOT_ROUTES[key];

    if (!navigationRef?.isReady?.()) {
      return;
    }

    const currentRoute = getActiveLeafRouteName(navigationRef.getRootState());

    if (activeTab === key && currentRoute && currentRoute !== rootRoute) {
      navigationRef.navigate(key, { screen: rootRoute });
      return;
    }

    navigationRef.navigate(key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Pressable
          style={styles.brand}
          onPress={() => handleNavPress('HomeTab')}
        >
          <BoxdropIcon width={36} height={36} style={styles.logo} />
          <Text variant="headlineMedium" style={styles.brandText}>
            BoxDrop
          </Text>
        </Pressable>

        <View style={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.navLink, isActive && styles.navLinkActive]}
                onPress={() => handleNavPress(item.key)}
                testID={`nav-${item.key}`}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={isActive ? colors.white : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  style={[
                    styles.navLinkText,
                    isActive && styles.navLinkTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function getActiveTabName(state: any): string {
  let currentState = state;
  let activeTab = 'HomeTab';

  while (currentState?.routes?.length) {
    const route = currentState.routes[currentState.index ?? 0];
    if (!route) {
      break;
    }
    if (route.name in ROOT_ROUTES) {
      activeTab = route.name;
    }
    currentState = route.state;
  }

  return activeTab;
}

function getActiveLeafRouteName(state: any): string | null {
  let currentState = state;
  let routeName: string | null = null;

  while (currentState?.routes?.length) {
    const route = currentState.routes[currentState.index ?? 0];
    if (!route) {
      break;
    }
    routeName = route.name ?? null;
    currentState = route.state;
  }

  return routeName;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkSurface,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 64,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandText: {
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navLinkActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navLinkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  navLinkTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
