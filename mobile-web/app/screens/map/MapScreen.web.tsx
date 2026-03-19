import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

const FALLBACK_CENTER: [number, number] = [39.8283, -98.5795];
const FALLBACK_ZOOM = 4;

function LocationUpdater({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], 12);
    }
  }, [map, latitude, longitude]);
  return null;
}

type Props = NativeStackScreenProps<MapStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const { latitude, longitude, requestLocation } = useLocationStore();

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const center: [number, number] = latitude != null && longitude != null
    ? [latitude, longitude]
    : FALLBACK_CENTER;

  const zoom = latitude != null ? 12 : FALLBACK_ZOOM;

  const fetchLat = latitude ?? FALLBACK_CENTER[0];
  const fetchLng = longitude ?? FALLBACK_CENTER[1];
  const { data: sales } = useMapSales(fetchLat, fetchLng, 50);

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
        <LocationUpdater latitude={latitude} longitude={longitude} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredSales.map((sale) => {
          const startsAt = new Date(sale.startsAt).toLocaleDateString();
          const endsAt = new Date(sale.endsAt).toLocaleDateString();
          return (
            <Marker key={sale.id} position={[sale.latitude, sale.longitude]}>
              <Popup>
                <div style={{ minWidth: 180, maxWidth: 260 }}>
                  <strong style={{ fontSize: 14 }}>{sale.title}</strong>
                  {sale.address ? (
                    <div style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>
                      {sale.address}
                    </div>
                  ) : null}
                  <div style={{ fontSize: 12, color: '#98A2B3', marginTop: 2 }}>
                    {startsAt} – {endsAt}
                  </div>
                  {sale.description ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#667085',
                        marginTop: 4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {sale.description}
                    </div>
                  ) : null}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('[Map] Navigating to SaleDetail:', sale.id);
                      navigation.navigate('SaleDetail', { saleId: sale.id });
                    }}
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#2A9D8F',
                      textDecoration: 'none',
                    }}
                  >
                    View details →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
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
