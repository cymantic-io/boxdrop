import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Chip, Text as PaperText, Button as PaperButton } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useListing, useSaveListing, useUnsaveListing } from '../../hooks';
import { colors } from '../../theme';
import { PhotoCarousel, ClaimButton } from '../../components';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import type { HomeStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'ListingDetail'>;

function getPriceColor(current: number, starting: number): string {
  const ratio = current / starting;
  if (ratio >= 0.75) return '#12B76A';
  if (ratio >= 0.4) return '#F4A261';
  return '#E76F51';
}

export function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const userId = useAuthStore((s) => s.userId);
  const { data: listing, isLoading, isError } = useListing(listingId);
  const { mutate: save } = useSaveListing();
  const { mutate: unsave } = useUnsaveListing();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  const priceColor = getPriceColor(listing.currentPrice, listing.startingPrice);
  const isOwner = listing.saleId && userId; // simplified check

  return (
    <View style={styles.container}>
      <WebContentWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PhotoCarousel images={listing.images ?? []} />

        <View style={styles.content}>
          <PaperText variant="headlineSmall" style={styles.title}>{listing.title}</PaperText>

          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: priceColor }]}>
              ${listing.currentPrice.toFixed(2)}
            </Text>
            {listing.currentPrice < listing.startingPrice && (
              <Text style={styles.originalPrice}>
                ${listing.startingPrice.toFixed(2)}
              </Text>
            )}
          </View>

          {listing.minimumPrice > 0 && (
            <Text style={styles.minPrice}>
              Min price: ${listing.minimumPrice.toFixed(2)}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Chip compact style={styles.badge} textStyle={styles.badgeText}>
              {listing.category}
            </Chip>
            {listing.condition && (
              <Chip compact style={[styles.badge, styles.conditionBadge]} textStyle={styles.badgeText}>
                {listing.condition.replace('_', ' ')}
              </Chip>
            )}
            <Chip compact style={[styles.badge, styles.statusBadge]} textStyle={styles.badgeText}>
              {listing.status}
            </Chip>
          </View>

          {listing.description ? (
            <Text style={styles.description}>{listing.description}</Text>
          ) : null}

          <View style={styles.actions}>
            <PaperButton
              mode="outlined"
              icon="heart"
              onPress={() => save(listing.id)}
              style={styles.saveButton}
              textColor="#E76F51"
            >
              Save
            </PaperButton>
          </View>
        </View>
      </ScrollView>

      {listing.status === 'AVAILABLE' && (
        <View style={styles.claimContainer}>
          <ClaimButton
            price={listing.currentPrice}
            onPress={() =>
              (navigation as any).navigate('Claim', {
                listingId: listing.id,
                listing,
              })
            }
          />
        </View>
      )}
      </WebContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { fontSize: 16, color: '#F04438' },
  scrollContent: { paddingBottom: 100 },
  content: { padding: 16 },
  title: { color: '#1D2939', fontWeight: '700', marginBottom: 8 },
  priceSection: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  currentPrice: { fontSize: 28, fontWeight: '700' },
  originalPrice: { fontSize: 16, color: '#98A2B3', textDecorationLine: 'line-through' },
  minPrice: { fontSize: 13, color: '#98A2B3', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  badge: { backgroundColor: '#E0F5F1' },
  conditionBadge: { backgroundColor: '#FFF5E6' },
  statusBadge: { backgroundColor: '#ECFDF3' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#1D2939' },
  description: { fontSize: 15, color: '#667085', lineHeight: 22, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  saveButton: { borderColor: '#E4E7EC', borderRadius: 12 },
  claimContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E4E7EC' },
});
