import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar } from '../../components';
import { useMapSales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import { colors } from '../../theme';
import type { MapStackParamList } from '../../types';

const DEFAULT_REGION: Region = {
  latitude: 37.55,
  longitude: -90.29,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

type Props = NativeStackScreenProps<MapStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const { latitude, longitude, requestLocation } = useLocationStore();

  useEffect(() => {
    if (latitude == null) {
      requestLocation();
    }
  }, [latitude, requestLocation]);

  const initialRegion = useMemo<Region>(() => {
    if (latitude != null && longitude != null) {
      return {
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    return DEFAULT_REGION;
  }, [latitude, longitude]);

  const { data: sales } = useMapSales(latitude ?? undefined, longitude ?? undefined, 10);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    if (!searchText.trim()) return sales;
    const query = searchText.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.title.toLowerCase().includes(query) ||
        (sale.address && sale.address.toLowerCase().includes(query)) ||
        (sale.description && sale.description.toLowerCase().includes(query)),
    );
  }, [sales, searchText]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {filteredSales.map((sale) => {
          const startsAt = new Date(sale.startsAt).toLocaleDateString();
          const endsAt = new Date(sale.endsAt).toLocaleDateString();
          return (
            <Marker
              key={sale.id}
              coordinate={{
                latitude: sale.latitude,
                longitude: sale.longitude,
              }}
            >
              <Callout
                tooltip
                onPress={() => navigation.navigate('SaleDetail', { saleId: sale.id })}
              >
                <View style={styles.callout}>
                  <Text variant="titleSmall" style={styles.calloutTitle} numberOfLines={1}>
                    {sale.title}
                  </Text>
                  {sale.address ? (
                    <Text variant="bodySmall" style={styles.calloutAddress} numberOfLines={1}>
                      {sale.address}
                    </Text>
                  ) : null}
                  <Text variant="bodySmall" style={styles.calloutDates}>
                    {startsAt} – {endsAt}
                  </Text>
                  {sale.description ? (
                    <Text variant="bodySmall" style={styles.calloutDesc} numberOfLines={2}>
                      {sale.description}
                    </Text>
                  ) : null}
                  <Text variant="labelSmall" style={styles.calloutLink}>
                    View details →
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      <View style={styles.searchOverlay}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search sales on map..."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  callout: {
    minWidth: 200,
    maxWidth: 280,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calloutTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutAddress: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  calloutDates: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  calloutDesc: {
    color: colors.textSecondary,
    marginBottom: 6,
  },
  calloutLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
