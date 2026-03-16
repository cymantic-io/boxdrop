import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { LeafletEventHandlerFnMap } from 'leaflet';
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

const SalesMap = React.memo(function SalesMap({
  initialCenter,
  zoom,
  onBoundsChange,
  onMapReady,
}: {
  initialCenter: [number, number];
  zoom: number;
  onBoundsChange: (bounds: MapBounds) => void;
  onMapReady: (map: L.Map) => void;
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const emitBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    const handlers: LeafletEventHandlerFnMap = {
      load: emitBounds,
      moveend: emitBounds,
      zoomend: emitBounds,
    };

    map.on(handlers);
    map.whenReady(() => {
      map.invalidateSize();
      emitBounds();
    });

    mapInstanceRef.current = map;
    onMapReady(map);

    return () => {
      map.off(handlers);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [initialCenter, zoom, onBoundsChange, onMapReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const { latitude, longitude, requestLocation } = useLocationStore();
  const flatListRef = useRef<FlatList<Sale>>(null);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const mapCenter = useMemo<[number, number]>(
    () => (latitude != null && longitude != null ? [latitude, longitude] : FALLBACK_CENTER),
    [latitude, longitude],
  );
  const mapZoom = latitude != null ? 12 : FALLBACK_ZOOM;
  const initialCenterRef = useRef<[number, number]>(mapCenter);
  const initialZoomRef = useRef<number>(mapZoom);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const hasCenteredOnLocation = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const latRef = useRef<number | null>(latitude ?? null);
  const lngRef = useRef<number | null>(longitude ?? null);
  const pendingCenterRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    latRef.current = latitude ?? null;
    lngRef.current = longitude ?? null;
    if (latitude != null && longitude != null && !mapReady) {
      initialCenterRef.current = [latitude, longitude];
      initialZoomRef.current = 12;
    }
  }, [latitude, longitude, mapReady]);

  const maybeCenterOnLocation = useCallback(() => {
    const lat = latRef.current;
    const lng = lngRef.current;
    if (lat == null || lng == null) return;
    if (hasCenteredOnLocation.current) return;
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], 12);
    hasCenteredOnLocation.current = true;
  }, []);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    if (!markerLayerRef.current) {
      markerLayerRef.current = L.layerGroup().addTo(map);
    }
    setMapReady(true);
    if (pendingCenterRef.current) {
      map.setView(pendingCenterRef.current, 12);
      pendingCenterRef.current = null;
      hasCenteredOnLocation.current = true;
      return;
    }
    maybeCenterOnLocation();
  }, [maybeCenterOnLocation]);

  const currentMapBounds = mapBounds ?? {
    north: mapCenter[0] + 0.5,
    south: mapCenter[0] - 0.5,
    east: mapCenter[1] + 0.5,
    west: mapCenter[1] - 0.5,
  };

  const queryLat = (currentMapBounds.north + currentMapBounds.south) / 2;
  const queryLng = (currentMapBounds.east + currentMapBounds.west) / 2;

  const queryRadius = (() => {
    const latDelta = (currentMapBounds.north - currentMapBounds.south) / 2;
    const lngDelta = (currentMapBounds.east - currentMapBounds.west) / 2;
    const kmPerDegreeLat = 111;
    const kmPerDegreeLng = 111 * Math.cos(queryLat * Math.PI / 180);
    const latKm = latDelta * kmPerDegreeLat;
    const lngKm = lngDelta * kmPerDegreeLng;
    return Math.max(Math.sqrt(latKm * latKm + lngKm * lngKm), 50);
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

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markerLayerRef.current;
    if (!map || !layerGroup) return;
    if (!mapReady) return;

    layerGroup.clearLayers();
    displayedSales.forEach((sale) => {
      const startsAt = new Date(sale.startsAt).toLocaleDateString();
      const endsAt = new Date(sale.endsAt).toLocaleDateString();
      const isSelected = sale.id === selectedSaleId;

      const popupHtml = `
        <div style="min-width: 180px; max-width: 260px;">
          <strong style="font-size: 14px;">${sale.title}</strong>
          ${sale.address ? `<div style="font-size: 12px; color: #667085; margin-top: 2px;">${sale.address}</div>` : ''}
          <div style="font-size: 12px; color: #98A2B3; margin-top: 2px;">${startsAt} – ${endsAt}</div>
          ${sale.description ? `<div style="font-size: 12px; color: #667085; margin-top: 4px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${sale.description}</div>` : ''}
          <button data-sale-id="${sale.id}" style="border: none; background: none; padding: 0; margin-top: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #2A9D8F;">View details →</button>
          ${isSelected ? `<div style="font-size: 11px; color: #1A7A6E; margin-top: 4px;">Selected</div>` : ''}
        </div>
      `;

      const marker = L.marker([sale.latitude, sale.longitude]);
      marker.on('click', () => handleMarkerClick(sale.id));
      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const popupEl = marker.getPopup()?.getElement();
        if (!popupEl) return;
        const button = popupEl.querySelector<HTMLButtonElement>('button[data-sale-id]');
        if (button) {
          button.onclick = () => navigation.navigate('SaleDetail', { saleId: sale.id });
        }
      });
      marker.addTo(layerGroup);
    });
  }, [displayedSales, selectedSaleId, handleMarkerClick, navigation, mapReady]);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    if (hasCenteredOnLocation.current) return;
    if (mapRef.current) {
      maybeCenterOnLocation();
      return;
    }
    pendingCenterRef.current = [latitude, longitude];
  }, [latitude, longitude, mapReady, maybeCenterOnLocation]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const handleResize = () => {
      map.invalidateSize();
    };
    const timer = window.setTimeout(handleResize, 0);
    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [mapReady]);

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
            initialCenter={initialCenterRef.current}
            zoom={initialZoomRef.current}
            onBoundsChange={handleBoundsChange}
            onMapReady={handleMapReady}
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
    minHeight: 400,
  },
  listPanel: {
    width: '40%',
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    minHeight: 400,
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
