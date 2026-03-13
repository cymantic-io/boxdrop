import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Chip, Text as PaperText, Button as PaperButton } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useListing, useSale, useSavedListings, useSaveListing, useUnsaveListing, useCreateOffer, useCreateThread } from '../../hooks';
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
  const { data: sale } = useSale(listing?.saleId);
  const { data: savedListings } = useSavedListings();
  const { mutate: save } = useSaveListing();
  const { mutate: unsave } = useUnsaveListing();
  const isSaved = savedListings?.some((item) => item.id === listingId) ?? false;
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const { mutate: makeOffer, isPending: offerPending } = useCreateOffer();
  const { mutate: createThread, isPending: threadPending } = useCreateThread();

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
  const isOwner = sale?.sellerId === userId;

  return (
    <View style={styles.container} testID="listing-detail-screen">
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
              mode={isSaved ? 'contained' : 'outlined'}
              icon={isSaved ? 'heart' : 'heart-outline'}
              onPress={() => isSaved ? unsave(listing.id) : save(listing.id)}
              style={isSaved ? styles.savedButton : styles.saveButton}
              textColor={isSaved ? colors.white : colors.accent}
              buttonColor={isSaved ? colors.accent : undefined}
            >
              {isSaved ? 'Saved' : 'Save'}
            </PaperButton>
          </View>
        </View>
      </ScrollView>

      {listing.status === 'AVAILABLE' && !isOwner && (
        <View style={styles.claimContainer}>
          <View style={styles.actionRow}>
            <View style={styles.actionFlex}>
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
            <View style={styles.actionFlex}>
              <PaperButton
                mode="outlined"
                icon="hand-extended"
                onPress={() => setShowOfferModal(true)}
                style={styles.offerButton}
                contentStyle={styles.actionButtonContent}
                textColor={colors.primary}
              >
                Make Offer
              </PaperButton>
            </View>
            <View style={styles.actionFlex}>
              <PaperButton
                mode="outlined"
                icon="message-question"
                onPress={() => {
                  createThread(
                    { listingId: listing.id, message: '' },
                    {
                      onSuccess: (thread) => {
                        (navigation as any).getParent()?.navigate('MessagesTab', {
                          screen: 'Chat',
                          params: { threadId: thread.id, listingTitle: listing.title },
                        });
                      },
                    }
                  );
                }}
                loading={threadPending}
                disabled={threadPending}
                style={styles.questionButton}
                contentStyle={styles.actionButtonContent}
                textColor={colors.textSecondary}
              >
                Ask
              </PaperButton>
            </View>
          </View>
        </View>
      )}
      </WebContentWrapper>
      <Modal visible={showOfferModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <PaperText variant="titleMedium" style={styles.modalTitle}>Make an Offer</PaperText>
            <PaperText variant="bodySmall" style={styles.modalSubtitle}>
              Current price: ${listing.currentPrice.toFixed(2)}
            </PaperText>
            <TextInput
              style={styles.modalInput}
              placeholder="Your offer amount"
              keyboardType="decimal-pad"
              value={offerAmount}
              onChangeText={setOfferAmount}
            />
            <PaperButton
              mode="contained"
              onPress={() => {
                const amount = parseFloat(offerAmount);
                if (!amount || amount <= 0) return;
                makeOffer(
                  { listingId: listing.id, amount },
                  {
                    onSuccess: (result) => {
                      setShowOfferModal(false);
                      setOfferAmount('');
                      (navigation as any).getParent()?.navigate('MessagesTab', {
                        screen: 'Chat',
                        params: { threadId: result.thread.id, listingTitle: listing.title },
                      });
                    },
                  }
                );
              }}
              loading={offerPending}
              disabled={offerPending || !offerAmount}
              style={styles.modalSubmit}
              buttonColor={colors.primary}
            >
              Submit Offer
            </PaperButton>
            <PaperButton
              mode="text"
              onPress={() => { setShowOfferModal(false); setOfferAmount(''); }}
              textColor={colors.textSecondary}
            >
              Cancel
            </PaperButton>
          </View>
        </View>
      </Modal>
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
  saveButton: { borderColor: colors.accent, borderRadius: 12 },
  savedButton: { borderRadius: 12 },
  claimContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E4E7EC' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionFlex: { flex: 1 },
  offerButton: { borderColor: colors.primary, borderRadius: 14 },
  actionButtonContent: { minHeight: 54 },
  questionButton: { borderColor: colors.textMuted, borderRadius: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: colors.textMuted, marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.textPrimary },
  modalSubmit: { borderRadius: 12, marginBottom: 8 },
});
