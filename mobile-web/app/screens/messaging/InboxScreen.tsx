import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThreads } from '../../hooks';
import { colors } from '../../theme';
import type { MessageThread, ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Inbox'>;

export function InboxScreen({ navigation }: Props) {
  const { data: threads, isLoading, isError, error, refetch } = useThreads();

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
          <Text style={styles.listingTitle} numberOfLines={1}>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          threads?.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Conversations with buyers and sellers will appear here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
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
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  listingTitle: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 2,
  },
  preview: {
    fontSize: 14,
    color: '#666',
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
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 76,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
