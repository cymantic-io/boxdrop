import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Button, Text as PaperText } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSale, useListings, useActivateSale } from '../../hooks';
import { colors } from '../../theme';
import { ListingCard, EmptyState, StatusBadge } from '../../components';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import type { HomeStackParamList, Listing } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'SaleDetail'>;

export function SaleDetailScreen({ route, navigation }: Props) {
  const { saleId } = route.params;
  const userId = useAuthStore((s) => s.userId);
  const { data: sale, isLoading: saleLoading } = useSale(saleId);
  const { data: listings, isLoading: listingsLoading } = useListings(saleId);
  const { mutate: activate, isPending: activating } = useActivateSale();

  if (saleLoading || listingsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Sale not found</Text>
      </View>
    );
  }

  const isOwner = sale.sellerId === userId;
  const startsAt = new Date(sale.startsAt).toLocaleDateString();
  const endsAt = new Date(sale.endsAt).toLocaleDateString();

  const handleListingPress = (listing: Listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  return (
    <View style={styles.container}>
      <WebContentWrapper>
      <FlatList
        data={listings ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <PaperText variant="headlineSmall" style={styles.title}>{sale.title}</PaperText>
              <StatusBadge status={sale.status} />
            </View>
            <Text style={styles.dates}>{startsAt} – {endsAt}</Text>
            {sale.description ? (
              <Text style={styles.description}>{sale.description}</Text>
            ) : null}
            {sale.address && (
              <Text style={styles.address}>📍 {sale.address}</Text>
            )}
            {isOwner && sale.status === 'DRAFT' && (
              <Button
                mode="contained"
                style={styles.activateButton}
                contentStyle={styles.activateButtonContent}
                onPress={() => activate(saleId)}
                disabled={activating}
                loading={activating}
              >
                Activate Sale
              </Button>
            )}
            <PaperText variant="titleMedium" style={styles.sectionTitle}>
              Items ({listings?.length ?? 0})
            </PaperText>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => handleListingPress(item)} />
        )}
        ListEmptyComponent={<EmptyState message="No items listed yet" icon="📋" />}
      />
      </WebContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { fontSize: 16, color: '#F04438' },
  header: { padding: 16, backgroundColor: '#FFFFFF', marginBottom: 8, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: '#1D2939', fontWeight: '700', flex: 1, marginRight: 8 },
  dates: { fontSize: 14, color: '#98A2B3', marginBottom: 6 },
  description: { fontSize: 15, color: '#667085', marginBottom: 8, lineHeight: 22 },
  address: { fontSize: 14, color: '#667085', marginBottom: 12 },
  activateButton: { backgroundColor: '#2A9D8F', borderRadius: 12, marginBottom: 12 },
  activateButtonContent: { paddingVertical: 4 },
  sectionTitle: { color: '#1D2939', marginTop: 8, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  row: { paddingHorizontal: 12, gap: 0 },
});
