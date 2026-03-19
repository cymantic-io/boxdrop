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
import { useNavigation } from '@react-navigation/native';
import { useSale, useListings, useActivateSale, useSavedListings, useSaveListing, useUnsaveListing } from '../../hooks';
import { colors } from '../../theme';
import { ListingCard, EmptyState, StatusBadge } from '../../components';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import type { HomeStackParamList, Listing } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'SaleDetail'>;

export function SaleDetailScreen({ route, navigation }: Props) {
  const { saleId } = route.params;
  const rootNavigation = useNavigation<any>();
  const userId = useAuthStore((s) => s.userId);
  const { data: sale, isLoading: saleLoading, error: saleError } = useSale(saleId);
  const { data: listings, isLoading: listingsLoading } = useListings(saleId);
  const { mutate: activate, isPending: activating } = useActivateSale();
  const { data: savedListings } = useSavedListings({ enabled: !!userId });
  const { mutate: save } = useSaveListing();
  const { mutate: unsave } = useUnsaveListing();
  const savedIds = new Set(savedListings?.map((item) => item.id));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      useAuthStore.getState().setShowAuthPrompt(true, undefined, action);
      return;
    }
    action();
  };

  if (saleLoading || listingsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (saleError || !sale) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Sale not found</Text>
      </View>
    );
  }

  const isOwner = sale.sellerId === userId;
  const startsAt = new Date(sale.startsAt).toLocaleDateString();
  const endsAt = new Date(sale.endsAt).toLocaleDateString();
  const displayStatus = sale.status === 'ACTIVE' && new Date(sale.startsAt) > new Date()
    ? 'PENDING' as const
    : sale.status;

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
              <StatusBadge status={displayStatus} />
            </View>
            <Text style={styles.dates}>{startsAt} – {endsAt}</Text>
            {sale.description ? (
              <Text style={styles.description}>{sale.description}</Text>
            ) : null}
            {sale.address && (
              <Text style={styles.address}>📍 {sale.address}</Text>
            )}
            {isOwner && (
              <Button
                mode="outlined"
                icon="pencil"
                style={styles.editButton}
                textColor={colors.primary}
                onPress={() =>
                  rootNavigation.navigate('MySalesTab', {
                    screen: 'ManageSale',
                    params: { saleId },
                  })
                }
              >
                Edit Sale
              </Button>
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
        renderItem={({ item }) => {
          const isSaved = savedIds.has(item.id);
          return (
            <ListingCard
              listing={item}
              onPress={() => handleListingPress(item)}
              rightAction={
                <Button
                  mode={isSaved ? 'contained' : 'outlined'}
                  icon={isSaved ? 'heart' : 'heart-outline'}
                  onPress={() => requireAuth(() => (isSaved ? unsave(item.id) : save(item.id)))}
                  style={isSaved ? styles.savedButton : styles.saveButton}
                  textColor={isSaved ? colors.white : colors.accent}
                  buttonColor={isSaved ? colors.accent : undefined}
                  compact
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              }
            />
          );
        }}
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
  editButton: { borderColor: colors.primary, borderRadius: 12, marginBottom: 8 },
  activateButton: { backgroundColor: '#2A9D8F', borderRadius: 12, marginBottom: 12 },
  activateButtonContent: { paddingVertical: 4 },
  sectionTitle: { color: '#1D2939', marginTop: 8, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  row: { paddingHorizontal: 12, gap: 0 },
  saveButton: { borderColor: colors.accent, borderRadius: 5 },
  savedButton: { borderRadius: 5 },
});
