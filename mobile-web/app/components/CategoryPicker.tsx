import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORIES } from '../types';
import { colors } from '../theme';

interface CategoryPickerProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
  categories?: readonly string[];
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selected,
  onSelect,
  categories = CATEGORIES,
}) => (
  <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipSelected]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextSelected]}>All</Text>
      </TouchableOpacity>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, selected === cat && styles.chipSelected]}
          onPress={() => onSelect(cat === selected ? null : cat)}
        >
          <Text style={[styles.chipText, selected === cat && styles.chipTextSelected]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
