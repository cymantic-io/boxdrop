import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Avatar, Card, Text, List, Divider, ActivityIndicator, Portal, Dialog, Button } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCurrentUser } from '../../hooks';
import { colors } from '../../theme';
import { LoadingScreen } from '../../components';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import type { ProfileStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  label: string;
  icon: string;
  route: keyof ProfileStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Edit Profile', icon: 'account-edit', route: 'EditProfile' },
  { label: 'My Transactions', icon: 'swap-horizontal-circle', route: 'MyTransactions' },
  { label: 'Saved Items', icon: 'heart', route: 'Saved' },
  { label: 'Settings', icon: 'cog', route: 'Settings' },
];

export function ProfileScreen({ navigation }: Props) {
  const isWeb = Platform.OS === 'web';
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const setShowAuthPrompt = useAuthStore((s) => s.setShowAuthPrompt);

  const showLogoutDialog = () => setLogoutDialogVisible(true);
  const hideLogoutDialog = () => setLogoutDialogVisible(false);

  const handleLogout = async () => {
    hideLogoutDialog();
    await logout();
  };

  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true, 'ProfileTab');
    }
  }, [isAuthenticated, setShowAuthPrompt]);

  const { data: user, isLoading, isError, error } = useCurrentUser();

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {(error as Error)?.message ?? 'Failed to load profile'}
        </Text>
      </View>
    );
  }

  const initial = (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <WebContentWrapper>
        <View style={styles.headerRow}>
          <View>
            <Text variant="headlineMedium" style={styles.pageTitle}>Profile</Text>
            <Text variant="bodySmall" style={styles.pageSubtitle}>Manage your account and activity</Text>
          </View>
        </View>

        <View style={[styles.profileGrid, isWeb ? styles.profileGridWeb : styles.profileGridMobile]}>
          <Card style={styles.profileCard} mode="outlined">
            <View style={styles.profileAccent} />
            <Card.Content style={styles.profileContent}>
              <Avatar.Text
                size={80}
                label={initial}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <Text variant="headlineSmall" style={styles.displayName}>{user?.displayName ?? 'User'}</Text>
              <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text variant="titleLarge" style={styles.statValue}>{user?.trustScore ?? 50}</Text>
                  <Text variant="labelSmall" style={styles.statLabel}>Trust Score</Text>
                </View>
                <Divider style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text variant="titleLarge" style={styles.statValue}>{user?.reviewCount ?? 0}</Text>
                  <Text variant="labelSmall" style={styles.statLabel}>Reviews</Text>
                </View>
                <Divider style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text variant="titleLarge" style={styles.statValue}>
                    {user?.averageRating ? user.averageRating.toFixed(1) : '—'}
                  </Text>
                  <Text variant="labelSmall" style={styles.statLabel}>Avg Rating</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.menuColumn}>
            <Card style={styles.menuCard} mode="outlined">
              {MENU_ITEMS.map((item, index) => (
                <React.Fragment key={item.route}>
                  <List.Item
                    title={item.label}
                    left={(props) => <List.Icon {...props} icon={item.icon} color={colors.primary} />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => navigation.navigate(item.route as any)}
                    titleStyle={styles.menuLabel}
                    style={styles.menuItem}
                  />
                  {index < MENU_ITEMS.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>

            <Card style={styles.logoutCard} mode="outlined">
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={showLogoutDialog}
                activeOpacity={0.6}
                testID="logout-menu-button"
              >
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>

        <Portal>
          <Dialog visible={logoutDialogVisible} onDismiss={hideLogoutDialog} style={styles.logoutDialog}>
            <Dialog.Title style={styles.logoutDialogTitle}>Log out?</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.logoutDialogBody}>You can sign back in anytime with a one‑time code.</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.logoutDialogActions}>
              <Button
                onPress={hideLogoutDialog}
                mode="outlined"
                textColor={colors.textSecondary}
                style={styles.logoutDialogCancel}
              >
                Cancel
              </Button>
              <Button
                onPress={handleLogout}
                testID="logout-confirm-button"
                mode="contained"
                buttonColor={colors.error}
                textColor={colors.white}
                style={styles.logoutDialogConfirm}
              >
                Log Out
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </WebContentWrapper>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  profileCard: {
    flex: 1.1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  profileAccent: {
    height: 90,
    backgroundColor: colors.darkSurface,
  },
  avatar: {
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
    marginTop: -40,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  displayName: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: colors.textMuted,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 4,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 4,
  },
  menuLabel: {
    color: colors.textPrimary,
  },
  divider: {
    backgroundColor: colors.borderLight,
  },
  logoutCard: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  logoutDialog: {
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  logoutDialogTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  logoutDialogBody: {
    color: colors.textSecondary,
  },
  logoutDialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoutDialogCancel: {
    borderRadius: 12,
    borderColor: colors.borderLight,
  },
  logoutDialogConfirm: {
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  pageSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  profileGrid: {
    alignItems: 'flex-start',
    gap: 16,
  },
  profileGridWeb: {
    flexDirection: 'row',
  },
  profileGridMobile: {
    flexDirection: 'column',
  },
  menuColumn: {
    flex: 1,
    gap: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});
