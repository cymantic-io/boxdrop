import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useListings, useCreateListing } from '../../hooks';
import { colors } from '../../theme';
import { ListingCard, DraftItemForm, EmptyState } from '../../components';
import type { CreateSaleStackParamList, CreateListingRequest } from '../../types';

type Props = NativeStackScreenProps<CreateSaleStackParamList, 'AddListings'>;

export function AddListingsScreen({ route, navigation }: Props) {
  const { saleId } = route.params;
  const { data: listings, isLoading } = useListings(saleId);
  const { mutate: createListing, isPending } = useCreateListing();

  const handleAddItem = (data: CreateListingRequest) => {
    createListing({ saleId, data });
  };

  const handleDone = () => {
    navigation.navigate('SaleDetail', { saleId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={listings ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>
              {listings?.length ?? 0} item{(listings?.length ?? 0) !== 1 ? 's' : ''} added
            </Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => {}} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          !isLoading ? <EmptyState message="Add your first item below" icon="📸" /> : null
        }
      />
      <View style={styles.formContainer}>
        <DraftItemForm onSubmit={handleAddItem} loading={isPending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  heading: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  doneButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  doneText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  listContent: { paddingBottom: 16 },
  row: { paddingHorizontal: 12 },
  formContainer: { padding: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
});
