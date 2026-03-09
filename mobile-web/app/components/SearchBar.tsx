import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { colors } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  testID,
}) => {
  const handleClear = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  return (
    <Searchbar
      testID={testID}
      placeholder={placeholder}
      onChangeText={onChangeText}
      onClearIconPress={handleClear}
      value={value}
      style={styles.searchbar}
      inputStyle={styles.input}
      mode="bar"
    />
  );
};

const styles = StyleSheet.create({
  searchbar: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    fontSize: 15,
  },
});
