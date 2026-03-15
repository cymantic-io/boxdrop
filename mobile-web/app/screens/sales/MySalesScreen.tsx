import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

  const [selectedCategory, setSelectedCategory] = useState<Category>('active');
  const { data: sales, isLoading, refetch, isRefetching } = useMySales({ enabled: isAuthenticated });

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

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

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  const isWeb = Platform.OS === 'web';

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
      ListEmptyComponent={
        <EmptyState message={EMPTY_MESSAGES[selectedCategory]} icon="📦" />
      }
    />
  );

  if (isWeb) {
    return (
      <View style={styles.container}>
        <WebContentWrapper>
          <View style={styles.webHeader}>
            <Text variant="headlineSmall" style={styles.heading}>
              My Sales
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={handleNewSale}
              buttonColor={colors.primary}
              textColor={colors.textOnPrimary}
            >
              New Sale
            </Button>
          </View>
          <View style={styles.webLayout}>
            <View style={styles.sidebar}>
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
                      {CATEGORY_LABELS[cat]} ({groups[cat].length})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.webContent}>{saleList}</View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  webLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    paddingTop: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
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
  webContent: {
    flex: 1,
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
