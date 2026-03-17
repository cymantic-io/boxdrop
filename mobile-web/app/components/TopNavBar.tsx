import React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { colors } from '../theme';

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

interface TopNavBarProps {
  state: any;
  navigation: any;
  descriptors: any;
}

export function TopNavBar({ state, navigation }: TopNavBarProps) {
  const activeRoute = state?.routes?.[state.index]?.name;
  const logoSource = Platform.OS === 'web'
    ? require('../../assets/boxdrop-mark.svg')
    : require('../../assets/icon.png');

  const handleNavPress = (key: string) => {
    if (activeRoute === key) {
      const tabRoute = state.routes.find((r: any) => r.name === key);
      if (tabRoute?.state && tabRoute.state.index > 0) {
        navigation.dispatch({
          ...CommonActions.reset({
            index: 0,
            routes: [{ name: tabRoute.state.routes[0].name }],
          }),
          target: tabRoute.state.key,
        });
        return;
      }
    }
    navigation.navigate(key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Pressable
          style={styles.brand}
          onPress={() => handleNavPress('HomeTab')}
        >
          <Image
            source={logoSource}
            style={styles.logo}
          />
          <Text variant="headlineMedium" style={styles.brandText}>
            BoxDrop
          </Text>
        </Pressable>

        <View style={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.key;
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
