import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors } from '../theme';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  rightAction?: React.ReactNode;
  footerAction?: React.ReactNode;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  rightAction,
  footerAction,
}) => {
  const hasDiscount = listing.currentPrice < listing.startingPrice;
  const imageUrl = listing.images?.[0]?.imageUrl;

  return (
    <Card style={styles.card} onPress={onPress} mode="outlined">
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text variant="bodySmall" style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
      </View>
      <Card.Content style={styles.info}>
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text variant="titleSmall" style={styles.title} numberOfLines={1}>
              {listing.title}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, hasDiscount && styles.priceDecayed]}>
                ${listing.currentPrice.toFixed(2)}
              </Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>${listing.startingPrice.toFixed(2)}</Text>
              )}
            </View>
            <Text variant="labelSmall" style={styles.category}>{listing.category}</Text>
          </View>
          {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </View>
        {footerAction ? <View style={styles.footerAction}>{footerAction}</View> : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: 12,
    width: '48%',
    marginHorizontal: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
  },
  info: {
    paddingTop: 8,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  rightAction: {
    marginLeft: 8,
  },
  footerAction: {
    marginTop: 10,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  priceDecayed: {
    color: colors.accent,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  category: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
