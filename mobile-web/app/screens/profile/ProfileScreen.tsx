import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Card, Text, List, Divider, ActivityIndicator } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCurrentUser } from '../../hooks';
import { colors } from '../../theme';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  label: string;
  icon: string;
  route: keyof ProfileStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Edit Profile', icon: 'account-edit', route: 'EditProfile' },
  { label: 'My Sales', icon: 'tag-multiple', route: 'MySales' },
  { label: 'My Transactions', icon: 'swap-horizontal-circle', route: 'MyTransactions' },
  { label: 'Messages', icon: 'message-text', route: 'Inbox' },
  { label: 'Settings', icon: 'cog', route: 'Settings' },
];

export function ProfileScreen({ navigation }: Props) {
  const { data: user, isLoading, isError, error } = useCurrentUser();

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
      <Card style={styles.profileCard} mode="outlined">
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

      <Card style={styles.menuCard} mode="outlined">
        {MENU_ITEMS.map((item, index) => (
          <React.Fragment key={item.route}>
            <List.Item
              title={item.label}
              left={(props) => <List.Icon {...props} icon={item.icon} color={colors.textSecondary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate(item.route as any)}
              titleStyle={styles.menuLabel}
            />
            {index < MENU_ITEMS.length - 1 && <Divider style={styles.divider} />}
          </React.Fragment>
        ))}
      </Card>
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
    padding: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  profileCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
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
    overflow: 'hidden',
  },
  menuLabel: {
    color: colors.textPrimary,
  },
  divider: {
    backgroundColor: colors.borderLight,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});
