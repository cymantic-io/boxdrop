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
import { useTransactions } from '../../hooks';
import { colors } from '../../theme';
import type { Transaction, ProfileStackParamList } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  CLAIMED: colors.primary,
  PAYMENT_PENDING: '#F59E0B',
  PAID: '#16A34A',
  PICKUP_CONFIRMED: '#0D9488',
  COMPLETED: '#9CA3AF',
  CANCELLED: '#DC2626',
  REFUNDED: '#DC2626',
};

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyTransactions'>;

export function MyTransactionsScreen({ navigation }: Props) {
  const { data: transactions, isLoading, isError, error, refetch } = useTransactions();

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const isActiveTransaction = (status: string) =>
    ['CLAIMED', 'PAYMENT_PENDING', 'PAID', 'PICKUP_CONFIRMED'].includes(status);

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to detail or show pickup token for active transactions
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.listingTitle ?? item.listingId}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] ?? '#9CA3AF' },
          ]}
        >
          <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>

      {isActiveTransaction(item.status) && item.pickupToken && (
        <View style={styles.tokenRow}>
          <Text style={styles.tokenLabel}>Pickup Token:</Text>
          <Text style={styles.tokenValue}>{item.pickupToken}</Text>
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
          {(error as Error)?.message ?? 'Failed to load transactions'}
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
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          transactions?.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your purchases and claims will appear here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
    </View>
  );
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tokenLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
    letterSpacing: 2,
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
