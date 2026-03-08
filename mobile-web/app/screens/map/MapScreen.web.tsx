import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar } from '../../components';
import { useMapSales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import type { MapStackParamList } from '../../types';

// Fix default marker icons for Leaflet (assets are not bundled by default)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 5;

type Props = NativeStackScreenProps<MapStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const { latitude, longitude, requestLocation } = useLocationStore();

  useEffect(() => {
    if (latitude == null) {
      requestLocation();
    }
  }, [latitude, requestLocation]);

  const center = useMemo<[number, number]>(() => {
    if (latitude != null && longitude != null) {
      return [latitude, longitude];
    }
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  const zoom = latitude != null ? 12 : DEFAULT_ZOOM;

  const { data: sales } = useMapSales(latitude ?? undefined, longitude ?? undefined, 10);

  const handleSalePress = (saleId: string) => {
    navigation.navigate('SaleDetail', { saleId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchOverlay}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search sales on map..."
        />
      </View>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ flex: 1, width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(sales ?? []).map((sale) => (
          <Marker
            key={sale.id}
            position={[sale.latitude, sale.longitude]}
            eventHandlers={{ click: () => handleSalePress(sale.id) }}
          >
            <Popup>{sale.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
});
