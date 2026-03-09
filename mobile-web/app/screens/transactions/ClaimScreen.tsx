import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useClaimListing } from '../../hooks';
import { colors } from '../../theme';
import type { Listing } from '../../types';

type ClaimScreenParams = {
  Claim: { listingId: string; listing: Listing };
  MyTransactions: undefined;
};

type Props = NativeStackScreenProps<ClaimScreenParams, 'Claim'>;

export function ClaimScreen({ route, navigation }: Props) {
  const { listingId, listing } = route.params;
  const {
    mutate: claimListing,
    data: transaction,
    isPending,
    isSuccess,
    isError,
    error,
  } = useClaimListing();

  const handleClaim = () => {
    claimListing({ listingId });
  };

  if (isSuccess && transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.successTitle}>Item Claimed!</Text>

          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Your Pickup Token</Text>
            <Text style={styles.token}>{transaction.pickupToken}</Text>
          </View>

          <Text style={styles.instructions}>
            Show this code to the seller when you pick up your item
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Item</Text>
            <Text style={styles.detailValue}>{listing.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              ${transaction.amount?.toFixed(2) ?? listing.currentPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, styles.statusClaimed]}>
              {transaction.status}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('MyTransactions')}
          >
            <Text style={styles.buttonText}>View My Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirm Claim</Text>

        {listing.images?.[0]?.imageUrl && (
          <Image
            source={{ uri: listing.images[0].imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text style={styles.listingTitle}>{listing.title}</Text>
        <Text style={styles.price}>${listing.currentPrice.toFixed(2)}</Text>

        {isError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {(error as Error)?.message ?? 'Failed to claim listing. Please try again.'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleClaim}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Confirm Claim</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 24,
  },
  tokenContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  token: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
    letterSpacing: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusClaimed: {
    color: colors.primary,
  },
});
