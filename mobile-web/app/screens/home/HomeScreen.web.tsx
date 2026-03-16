import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar, SaleCard, EmptyState, LoadingScreen } from '../../components';
import { useNearbySales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import { colors } from '../../theme';
import type { HomeStackParamList, Sale } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 5;

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function MapController({
  onBoundsChange,
  onCenterChange,
  fitToSales,
}: {
  onBoundsChange: (bounds: MapBounds) => void;
  onCenterChange: (lat: number, lng: number) => void;
  fitToSales: Sale[] | null;
}) {
  const map = useMap();
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      const center = map.getCenter();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
      // Only trigger refetch if center changed significantly (more than 500m)
      if (!prevCenterRef.current || 
          Math.abs(center.lat - prevCenterRef.current.lat) > 0.005 ||
          Math.abs(center.lng - prevCenterRef.current.lng) > 0.005) {
        prevCenterRef.current = { lat: center.lat, lng: center.lng };
        onCenterChange(center.lat, center.lng);
      }
    },
  });

  useEffect(() => {
    if (fitToSales && fitToSales.length > 0) {
      const bounds = L.latLngBounds(fitToSales.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [fitToSales, map]);

  return null;
}

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  // Track map center separately - starts with location store, updates on map move
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  // Trigger refetch when map center changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const flatListRef = useRef<FlatList<Sale>>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // Initialize map center from location store on first load
  useEffect(() => {
    if (latitude != null && longitude != null && !mapCenter) {
      setMapCenter({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, mapCenter]);

  useEffect(() => {
    if (latitude == null && !locationLoading) {
      requestLocation();
    }
  }, [latitude, locationLoading, requestLocation]);

  const isSearching = searchText.trim().length > 0;

  // Use mapCenter if available, otherwise fall back to location store
  const effectiveLat = mapCenter?.lat ?? latitude ?? undefined;
  const effectiveLng = mapCenter?.lng ?? longitude ?? undefined;

  const {
    data: nearbySales,
    isLoading,
    isRefetching,
  } = useNearbySales(effectiveLat ?? undefined, effectiveLng ?? undefined, 10, refreshTrigger);

  // Handler for when map center changes (user pans/zooms)
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const searchFilteredSales = useMemo(() => {
    const sales = nearbySales ?? [];
    if (!isSearching) return sales;
    const query = searchText.toLowerCase();
    return sales.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query),
    );
  }, [nearbySales, searchText, isSearching]);

  // When searching: map fits to results and list shows all matches
  // When browsing: list shows only sales visible in current map viewport
  const displayedSales = useMemo(() => {
    if (isSearching) return searchFilteredSales;
    if (!mapBounds) return searchFilteredSales;
    return searchFilteredSales.filter(
      (s) =>
        s.latitude >= mapBounds.south &&
        s.latitude <= mapBounds.north &&
        s.longitude >= mapBounds.west &&
        s.longitude <= mapBounds.east,
    );
  }, [searchFilteredSales, mapBounds, isSearching]);

  // Only fit map to search results when actively searching
  const fitToSales = isSearching ? searchFilteredSales : null;

  // Use mapCenter if available (from map movement), otherwise fall back to location store
  const center = useMemo<[number, number]>(() => {
    if (mapCenter) {
      return [mapCenter.lat, mapCenter.lng];
    }
    if (latitude != null && longitude != null) {
      return [latitude, longitude];
    }
    return DEFAULT_CENTER;
  }, [mapCenter, latitude, longitude]);

  const zoom = mapCenter || latitude != null ? 12 : DEFAULT_ZOOM;

  const scrollToSale = useCallback(
    (saleId: string) => {
      const index = displayedSales.findIndex((s) => s.id === saleId);
      if (index >= 0) {
        try {
          flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        } catch {
          // index out of range — ignore
        }
      }
    },
    [displayedSales],
  );

  const handleMarkerClick = useCallback(
    (saleId: string) => {
      setSelectedSaleId(saleId);
      scrollToSale(saleId);
    },
    [scrollToSale],
  );

  const handleCardPress = useCallback((saleId: string) => {
    setSelectedSaleId(saleId);
    const marker = markerRefs.current[saleId];
    if (marker) {
      marker.openPopup();
    }
  }, []);

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container} testID="home-screen">
      <View style={styles.searchBar}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search sales and listings..."
          testID="search-input"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.mapPanel}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController onBoundsChange={setMapBounds} onCenterChange={handleMapCenterChange} fitToSales={fitToSales} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {searchFilteredSales.map((sale) => {
              const startsAt = new Date(sale.startsAt).toLocaleDateString();
              const endsAt = new Date(sale.endsAt).toLocaleDateString();
              return (
                <Marker
                  key={sale.id}
                  position={[sale.latitude, sale.longitude]}
                  eventHandlers={{
                    add: (e) => {
                      markerRefs.current[sale.id] = e.target as L.Marker;
                    },
                    click: () => handleMarkerClick(sale.id),
                  }}
                >
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
        <View style={styles.listPanel} testID="sale-list-panel">
          <FlatList
            ref={flatListRef}
            data={displayedSales}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedSaleId;
              return (
                <View
                  style={[
                    styles.cardWrapper,
                    isSelected && styles.cardWrapperSelected,
                  ]}
                >
                  <SaleCard
                    sale={item}
                    onPress={() => handleCardPress(item.id)}
                    onViewDetails={() => navigation.navigate('SaleDetail', { saleId: item.id })}
                  />
                </View>
              );
            }}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                message={searchText.trim() ? 'No results found' : 'No sales nearby'}
                testID={searchText.trim() ? 'search-empty' : undefined}
              />
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    backgroundColor: colors.darkSurface,
    paddingBottom: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mapPanel: {
    width: '60%',
  },
  listPanel: {
    width: '40%',
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  list: {
    flexGrow: 1,
    padding: 16,
  },
  cardWrapper: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  cardWrapperSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
});
