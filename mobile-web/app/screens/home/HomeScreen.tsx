import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar, SaleCard, EmptyState, LoadingScreen } from '../../components';
import { useNearbySales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import type { HomeStackParamList } from '../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const { latitude, longitude, requestLocation } = useLocationStore();

  useEffect(() => {
    if (latitude == null) {
      requestLocation();
    }
  }, [latitude, requestLocation]);

  const {
    data: nearbySales,
    isLoading,
    refetch,
    isRefetching,
  } = useNearbySales(latitude ?? undefined, longitude ?? undefined, 10);

  const filteredSales = searchText.trim()
    ? (nearbySales ?? []).filter(
        (s) =>
          s.title.toLowerCase().includes(searchText.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchText.toLowerCase()),
      )
    : nearbySales ?? [];

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container} testID="home-screen">
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search sales and listings..."
        testID="search-input"
      />
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SaleCard
            sale={item}
            onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            message={searchText.trim() ? 'No results found' : 'No sales nearby'}
            testID={searchText.trim() ? 'search-empty' : undefined}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
