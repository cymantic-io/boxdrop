import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[Map] HomeScreen.web loaded');
}

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

interface StoredMapView {
  center: [number, number];
  zoom: number;
  bounds: MapBounds | null;
  origin: [number, number] | null;
}

const MAP_VIEW_KEY = 'boxdrop_explore_map_view';

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

    map.createPane('salesMarkers');
    const markerPane = map.getPane('salesMarkers');
    if (markerPane) {
      markerPane.style.zIndex = '650';
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const emitBounds = () => {
      if (!map._loaded) return;
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
      requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        emitBounds();
      });
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
  const [savedView, setSavedView] = useState<StoredMapView | null>(null);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(MAP_VIEW_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredMapView;
      if (parsed?.center && typeof parsed.center[0] === 'number' && typeof parsed.center[1] === 'number') {
        setSavedView(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const mapCenter = useMemo<[number, number]>(
    () => savedView?.center ?? (latitude != null && longitude != null ? [latitude, longitude] : FALLBACK_CENTER),
    [savedView, latitude, longitude],
  );
  const mapZoom = savedView?.zoom ?? (latitude != null ? 12 : FALLBACK_ZOOM);
  const initialCenterRef = useRef<[number, number]>(mapCenter);
  const initialZoomRef = useRef<number>(mapZoom);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const markerRootRef = useRef<HTMLDivElement | null>(null);
  const hasCenteredOnLocation = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const latRef = useRef<number | null>(latitude ?? null);
  const lngRef = useRef<number | null>(longitude ?? null);
  const pendingCenterRef = useRef<[number, number] | null>(null);
  const originRef = useRef<[number, number] | null>(savedView?.origin ?? null);

  useEffect(() => {
    latRef.current = latitude ?? null;
    lngRef.current = longitude ?? null;
    if (latitude != null && longitude != null && !originRef.current) {
      originRef.current = [latitude, longitude];
    }
    if (!mapReady && savedView?.center) {
      initialCenterRef.current = savedView.center;
      initialZoomRef.current = savedView.zoom;
      setMapBounds(savedView.bounds ?? null);
      return;
    }
    if (latitude != null && longitude != null && !mapReady && !savedView) {
      initialCenterRef.current = [latitude, longitude];
      initialZoomRef.current = 12;
    }
  }, [latitude, longitude, mapReady, savedView]);

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
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    if (typeof window !== 'undefined') {
      const payload: StoredMapView = {
        center: [center.lat, center.lng],
        zoom,
        bounds,
        origin: originRef.current,
      };
      try {
        window.localStorage.setItem(MAP_VIEW_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    if (!markerLayerRef.current) {
      markerLayerRef.current = L.layerGroup().addTo(map);
    }
    setMapReady(true);
    if (savedView?.center) {
      map.setView(savedView.center, savedView.zoom ?? 12);
      if (savedView.bounds) {
        setMapBounds(savedView.bounds);
      }
      hasCenteredOnLocation.current = true;
      return;
    }
    if (pendingCenterRef.current) {
      map.setView(pendingCenterRef.current, 12);
      pendingCenterRef.current = null;
      hasCenteredOnLocation.current = true;
      return;
    }
    maybeCenterOnLocation();
  }, [maybeCenterOnLocation, savedView]);

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
    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        rafId = null;
      });
    };
    const timer = window.setTimeout(handleResize, 0);
    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timer);
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [mapReady]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[Map] marker effect fired', {
        mapReady,
        displayedSales: displayedSales.length,
        selectedSaleId,
      });
    }
  }, [displayedSales, mapReady, selectedSaleId]);

  const ensureMarkerRoot = useCallback((map: L.Map) => {
    const container = map.getContainer();
    let root = markerRootRef.current;
    if (!root) {
      root = document.createElement('div');
      root.style.position = 'absolute';
      root.style.inset = '0';
      root.style.pointerEvents = 'none';
      root.style.zIndex = '650';
      container.appendChild(root);
      markerRootRef.current = root;
    }
    return root;
  }, []);

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      if (typeof window !== 'undefined') {
        console.log('[Map] renderMarkers skipped', { hasMap: !!map, mapReady });
      }
      return;
    }
    const root = ensureMarkerRoot(map);
    root.innerHTML = '';
    const bounds = map.getBounds();
    if (typeof window !== 'undefined') {
      const sample = displayedSales[0];
      console.log('[Map] rendering markers', {
        count: displayedSales.length,
        sample: sample
          ? {
            id: sample.id,
            lat: sample.latitude,
            lng: sample.longitude,
            inView:
              sample.latitude <= bounds.getNorth() &&
              sample.latitude >= bounds.getSouth() &&
              sample.longitude <= bounds.getEast() &&
              sample.longitude >= bounds.getWest(),
          }
          : null,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
      });
    }

    displayedSales.forEach((sale) => {
      if (!Number.isFinite(sale.latitude) || !Number.isFinite(sale.longitude)) {
        return;
      }
      const point = map.latLngToContainerPoint([sale.latitude, sale.longitude]);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        return;
      }
      const isSelected = sale.id === selectedSaleId;
      const size = isSelected ? 16 : 12;
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.left = `${point.x - size / 2}px`;
      dot.style.top = `${point.y - size / 2}px`;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.borderRadius = '50%';
      dot.style.background = isSelected ? '#2A9D8F' : '#10B981';
      dot.style.border = `2px solid ${isSelected ? '#1A7A6E' : '#0F766E'}`;
      dot.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
      dot.style.pointerEvents = 'auto';
      dot.style.cursor = 'pointer';
      dot.title = sale.title;
      dot.onclick = () => {
        handleMarkerClick(sale.id);
        navigation.navigate('SaleDetail', { saleId: sale.id });
      };
      root.appendChild(dot);
    });
  }, [displayedSales, selectedSaleId, handleMarkerClick, navigation, mapReady, ensureMarkerRoot]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const handleMove = () => renderMarkers();
    const handleMoveLive = () => renderMarkers();
    map.on('moveend', handleMove);
    map.on('zoomend', handleMove);
    map.on('move', handleMoveLive);
    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleMove);
      map.off('move', handleMoveLive);
    };
  }, [mapReady, renderMarkers]);

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
          <View style={styles.recenterContainer}>
            <Text
              onPress={() => {
                const origin = originRef.current;
                if (!origin || !mapRef.current) return;
                mapRef.current.setView(origin, 12);
              }}
              style={styles.recenterButton}
            >
              Re-Center
            </Text>
          </View>
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
    position: 'relative',
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
  recenterContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  recenterButton: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
