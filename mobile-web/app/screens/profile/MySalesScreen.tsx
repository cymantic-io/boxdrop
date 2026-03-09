import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMySales } from '../../hooks';
import { colors } from '../../theme';
import { SaleCard, EmptyState, LoadingScreen } from '../../components';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MySales'>;

export function MySalesScreen({ navigation }: Props) {
  const { data: sales, isLoading, refetch, isRefetching } = useMySales();

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sales ?? []}
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
          <EmptyState message="You haven't created any sales yet" icon="🏷️" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, padding: 16, paddingBottom: 24 },
});
