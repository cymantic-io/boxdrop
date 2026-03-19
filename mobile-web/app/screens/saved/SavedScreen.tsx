import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import { ListingCard, EmptyState, LoadingScreen } from '../../components';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import { useSavedListings, useUnsaveListing } from '../../hooks';
import { colors } from '../../theme';
import { ProfileStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Saved'>;

export function SavedScreen({ navigation }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setShowAuthPrompt = useAuthStore((s) => s.setShowAuthPrompt);

  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
    }
  }, [isAuthenticated, setShowAuthPrompt]);

  const {
    data: savedListings,
    isLoading,
    refetch,
    isRefetching,
  } = useSavedListings({ enabled: isAuthenticated });

  const { mutate: unsave } = useUnsaveListing();

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  const handleListingPress = useCallback(
    (listingId: string) => {
      navigation.navigate('ListingDetail', { listingId });
    },
    [navigation],
  );

  const handleSalePress = useCallback(
    (saleId: string) => {
      navigation.navigate('SaleDetail', { saleId });
    },
    [navigation],
  );

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <WebContentWrapper>
      <FlatList
        data={savedListings ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => handleListingPress(item.id)}
            rightAction={
              <Button
                mode="contained"
                icon="heart"
                onPress={() => unsave(item.id)}
                style={styles.unsaveButton}
                textColor={colors.white}
                buttonColor={colors.accent}
                compact
              >
                Unsave
              </Button>
            }
            footerAction={
              <Button
                mode="text"
                icon="storefront-outline"
                onPress={() => handleSalePress(item.saleId)}
                contentStyle={styles.saleButtonContent}
                labelStyle={styles.saleButtonLabel}
                textColor={colors.primary}
                compact
              >
                View Sale
              </Button>
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState message="No saved items yet" />
        }
      />
      </WebContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  row: {
    paddingHorizontal: 4,
  },
  unsaveButton: {
    borderRadius: 5,
  },
  saleButtonContent: {
    justifyContent: 'flex-start',
  },
  saleButtonLabel: {
    marginLeft: 4,
  },
});
