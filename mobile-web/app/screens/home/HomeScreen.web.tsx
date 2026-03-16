import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import L from 'leaflet';
import { SearchBar, SaleCard, EmptyState, LoadingScreen } from '../../components';
import { useNearbySales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import { colors } from '../../theme';
import type { HomeStackParamList, Sale } from '../../types';

const FALLBACK_CENTER: [number, number] = [39.8283, -98.5795];
const FALLBACK_ZOOM = 4;

// Fix default marker icons for Leaflet (assets are not bundled by default)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function MapEventsHandler({
  onBoundsChange,
  onViewChange,
}: {
  onBoundsChange: (bounds: MapBounds) => void;
  onViewChange: (center: [number, number], zoom: number) => void;
}) {
  const map = useMap();
  const isInitial = useRef(true);

  useMapEvents({
    moveend: () => {
      if (isInitial.current) {
        isInitial.current = false;
        return;
      }
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
      const center = map.getCenter();
      onViewChange([center.lat, center.lng], map.getZoom());
    },
    load: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
      const center = map.getCenter();
      onViewChange([center.lat, center.lng], map.getZoom());
    },
    zoomend: () => {
      const center = map.getCenter();
      onViewChange([center.lat, center.lng], map.getZoom());
    },
  });

  return null;
}

function SalesMap({
  initialCenter,
  zoom,
  sales,
  selectedSaleId,
  onMarkerClick,
  onViewDetails,
  onBoundsChange,
  onViewChange,
}: {
  initialCenter: [number, number];
  zoom: number;
  sales: Sale[];
  selectedSaleId: string | null;
  onMarkerClick: (saleId: string) => void;
  onViewDetails: (saleId: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  onViewChange: (center: [number, number], zoom: number) => void;
}): JSX.Element {
  return (
    <MapContainer
      center={initialCenter}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventsHandler onBoundsChange={onBoundsChange} onViewChange={onViewChange} />
      {sales.map((sale) => {
        const startsAt = new Date(sale.startsAt).toLocaleDateString();
        const endsAt = new Date(sale.endsAt).toLocaleDateString();
        const isSelected = sale.id === selectedSaleId;
        return (
          <Marker
            key={sale.id}
            position={[sale.latitude, sale.longitude]}
            eventHandlers={{
              click: () => onMarkerClick(sale.id),
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
                <button
                  type="button"
                  onClick={() => onViewDetails(sale.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    marginTop: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#2A9D8F',
                  }}
                >
                  View details →
                </button>
                {isSelected ? (
                  <div style={{ fontSize: 11, color: '#1A7A6E', marginTop: 4 }}>
                    Selected
                  </div>
                ) : null}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const flatListRef = useRef<FlatList<Sale>>(null);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Use user location if available, otherwise fallback
  const mapCenter = useMemo<[number, number]>(
    () => (latitude != null && longitude != null ? [latitude, longitude] : FALLBACK_CENTER),
    [latitude, longitude],
  );
  const mapZoom = latitude != null ? 12 : FALLBACK_ZOOM;
  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number }>({
    center: mapCenter,
    zoom: mapZoom,
  });
  const hasCenteredOnLocation = useRef(false);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    if (hasCenteredOnLocation.current) return;
    setMapView({ center: [latitude, longitude], zoom: 12 });
    hasCenteredOnLocation.current = true;
  }, [latitude, longitude]);

  // Ensure map bounds are initialized with a ~50km radius box around the center so tests don't fail rendering
  const currentMapBounds = mapBounds ?? {
    north: mapCenter[0] + 0.5,
    south: mapCenter[0] - 0.5,
    east: mapCenter[1] + 0.5,
    west: mapCenter[1] - 0.5,
  };

  // Calculate center and radius from bounds
  const queryLat = (currentMapBounds.north + currentMapBounds.south) / 2;
  const queryLng = (currentMapBounds.east + currentMapBounds.west) / 2;
  
  // Calculate radius in km from bounds
  const queryRadius = (() => {
    const latDelta = (currentMapBounds.north - currentMapBounds.south) / 2;
    const lngDelta = (currentMapBounds.east - currentMapBounds.west) / 2;
    const kmPerDegreeLat = 111;
    const kmPerDegreeLng = 111 * Math.cos(queryLat * Math.PI / 180);
    const latKm = latDelta * kmPerDegreeLat;
    const lngKm = lngDelta * kmPerDegreeLng;
    return Math.max(Math.sqrt(latKm * latKm + lngKm * lngKm), 50); // Ensure at least 50km for initial fallback
  })();

  const {
    data: nearbySales,
    isLoading,
    isRefetching,
    error,
  } = useNearbySales(queryLat, queryLng, queryRadius);

  useEffect(() => {
    if (error) {
      console.error('Sales query error:', error);
    }
  }, [error]);

  const isSearching = searchText.trim().length > 0;

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

  const handleMarkerClick = useCallback((saleId: string) => {
    setSelectedSaleId(saleId);
    const index = displayedSales.findIndex((s) => s.id === saleId);
    if (index >= 0) {
      try {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      } catch {
        // index out of range — ignore
      }
    }
  }, [displayedSales]);

  const handleCardPress = useCallback((saleId: string) => {
    setSelectedSaleId(saleId);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
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
          <SalesMap
            initialCenter={mapView.center}
            zoom={mapView.zoom}
            sales={displayedSales}
            selectedSaleId={selectedSaleId}
            onMarkerClick={handleMarkerClick}
            onViewDetails={(saleId) => navigation.navigate('SaleDetail', { saleId })}
            onBoundsChange={setMapBounds}
            onViewChange={(center, zoom) => setMapView({ center, zoom })}
          />
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
