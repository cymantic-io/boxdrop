import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThreads } from '../../hooks';
import { colors } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import type { MessageThread, MessagesStackParamList } from '../../types';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import { EmptyState } from '../../components';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Inbox'>;

export function InboxScreen({ navigation }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setShowAuthPrompt = useAuthStore((s) => s.setShowAuthPrompt);

  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true, 'MessagesTab');
    }
  }, [isAuthenticated, setShowAuthPrompt]);

  const { data: threads, isLoading, isError, error, refetch } = useThreads({ enabled: isAuthenticated });

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

  const renderItem = ({ item }: { item: MessageThread }) => (
    <TouchableOpacity
      testID={`thread-row-${item.id}`}
      style={styles.threadRow}
      onPress={() =>
        navigation.navigate('Chat', {
          threadId: item.id,
          listingTitle: item.listingTitle,
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.otherUserName ?? item.buyerId ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUserName ?? (item.buyerId ? `Buyer` : `Seller`)}
          </Text>
          <Text style={styles.time}>{formatTime(item.lastMessageAt ?? item.createdAt)}</Text>
        </View>

        {item.listingTitle && (
          <Text testID={`thread-listing-${item.id}`} style={styles.listingTitle} numberOfLines={1}>
            Re: {item.listingTitle}
          </Text>
        )}

        <Text style={styles.preview} numberOfLines={1}>
          {item.lastMessage ?? 'No messages yet'}
        </Text>
      </View>

      {(item.unreadCount ?? 0) > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
        <Text style={styles.errorText}>
          {(error as Error)?.message ?? 'Failed to load messages'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isWeb = Platform.OS === 'web';

  const list = (
    <FlatList
      data={threads ?? []}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={
        (threads ?? []).length === 0 ? styles.emptyContainer : styles.listContent
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <EmptyState message="Conversations with buyers and sellers will appear here." />
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );

  if (isWeb) {
    return (
      <View style={styles.container}>
        <WebContentWrapper>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.heading}>Messages</Text>
              <Text style={styles.subheading}>All buyer and seller conversations.</Text>
            </View>
          </View>
          <View style={styles.listCard}>{list}</View>
        </WebContentWrapper>
      </View>
    );
  }

  return <View style={styles.container}>{list}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  threadContent: {
    flex: 1,
    marginRight: 8,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
  listingTitle: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 2,
  },
  preview: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    paddingBottom: 16,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subheading: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
