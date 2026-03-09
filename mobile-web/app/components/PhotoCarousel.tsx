import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ListingImage } from '../types';
import { colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoCarouselProps {
  images: ListingImage[];
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (images.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No Photos</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        )}
      />
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  placeholder: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
