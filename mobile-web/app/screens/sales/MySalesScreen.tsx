import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import BoxdropIcon from '../../../assets/boxdrop-icon.svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text } from 'react-native-paper';
import { SaleCard, EmptyState, LoadingScreen } from '../../components';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import { useMySales } from '../../hooks';
import { colors } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import { MySalesStackParamList, Sale } from '../../types';

type Props = NativeStackScreenProps<MySalesStackParamList, 'MySalesList'>;

type Category = 'draft' | 'pending' | 'active' | 'ended';

const CATEGORY_LABELS: Record<Category, string> = {
  draft: 'Draft',
  pending: 'Pending',
  active: 'Active',
  ended: 'Ended',
};

const CATEGORY_ORDER: Category[] = ['active', 'pending', 'draft', 'ended'];

const EMPTY_MESSAGES: Record<Category, string> = {
  draft: 'No draft sales. Tap "New Sale" to get started!',
  pending: 'No upcoming sales scheduled.',
  active: 'No active sales right now.',
  ended: 'No past sales yet.',
};

function categorizeSales(sales: Sale[]) {
  const now = new Date();
  const groups: Record<Category, Sale[]> = {
    draft: [],
    pending: [],
    active: [],
    ended: [],
  };

  for (const sale of sales) {
    if (sale.status === 'DRAFT') {
      groups.draft.push(sale);
    } else if (sale.status === 'ENDED' || sale.status === 'CANCELLED') {
      groups.ended.push(sale);
    } else if (sale.status === 'ACTIVE' && new Date(sale.startsAt) > now) {
      groups.pending.push(sale);
    } else {
      groups.active.push(sale);
    }
  }

  return groups;
}

export function MySalesScreen({ navigation }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setShowAuthPrompt = useAuthStore((s) => s.setShowAuthPrompt);

  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true, 'MySalesTab');
    }
  }, [isAuthenticated, setShowAuthPrompt]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setShowAuthPrompt(true, 'MySalesTab');
      }
    }, [isAuthenticated, setShowAuthPrompt])
  );

  const [selectedCategory, setSelectedCategory] = useState<Category>('active');
  const { data: sales, isLoading, refetch, isRefetching } = useMySales({ enabled: isAuthenticated });

  const groups = useMemo(() => categorizeSales(sales ?? []), [sales]);
  const currentSales = groups[selectedCategory];

  const handleSalePress = useCallback(
    (saleId: string) => {
      navigation.navigate('ManageSale', { saleId });
    },
    [navigation],
  );

  const handleNewSale = useCallback(() => {
    navigation.navigate('CreateSale');
  }, [navigation]);

  if (!isAuthenticated || (isLoading && !isRefetching)) {
    return <LoadingScreen />;
  }

  const isWeb = Platform.OS === 'web';

  const emptyState = <EmptyState message={EMPTY_MESSAGES[selectedCategory]} />;

  const saleList = (
    <FlatList
      data={currentSales}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SaleCard sale={item} onPress={() => handleSalePress(item.id)} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={emptyState}
    />
  );

  if (isWeb) {
    return (
      <View style={styles.container}>
        <WebContentWrapper>
          <View style={styles.webHeader}>
            <View>
              <Text variant="headlineSmall" style={styles.heading}>
                My Sales
              </Text>
              <Text style={styles.subheading}>Track activity and manage listings.</Text>
            </View>
            <Button
              mode="contained"
              icon="plus"
              onPress={handleNewSale}
              buttonColor={colors.primary}
              textColor={colors.textOnPrimary}
              style={styles.newSaleButton}
            >
              New Sale
            </Button>
          </View>
          <View style={styles.webLayout}>
            <View style={styles.sidebarCard}>
              {CATEGORY_ORDER.map((cat) => {
                const isSelected = cat === selectedCategory;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.sidebarItem,
                      isSelected && styles.sidebarItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sidebarText,
                        isSelected && styles.sidebarTextSelected,
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                    <View style={[styles.countPill, isSelected && styles.countPillActive]}>
                      <Text style={[styles.countText, isSelected && styles.countTextActive]}>
                        {groups[cat].length}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.webContentCard}>{saleList}</View>
          </View>
        </WebContentWrapper>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.nativeHeader}>
        <View style={styles.tabRow}>
          {CATEGORY_ORDER.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.tab, isSelected && styles.tabSelected]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isSelected && styles.tabTextSelected,
                  ]}
                >
                  {CATEGORY_LABELS[cat]} ({groups[cat].length})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {saleList}
      <Button
        mode="contained"
        icon="plus"
        onPress={handleNewSale}
        buttonColor={colors.primary}
        textColor={colors.textOnPrimary}
        style={styles.fab}
      >
        New Sale
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Web layout
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  heading: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  subheading: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  newSaleButton: {
    borderRadius: 12,
  },
  webLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sidebarCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  sidebarItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  sidebarText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  countPill: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countPillActive: {
    backgroundColor: colors.primary,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  countTextActive: {
    color: colors.white,
  },
  webContentCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  // Native layout
  nativeHeader: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    elevation: 4,
  },
});
