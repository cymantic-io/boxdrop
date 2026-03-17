import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme';
import BoxdropIcon from '../../assets/boxdrop-icon.svg';

interface EmptyStateProps {
  message: string;
  icon?: string;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, testID }) => (
  <View style={styles.container} testID={testID}>
    {icon ? (
      <Text style={styles.icon}>{icon}</Text>
    ) : (
      <BoxdropIcon width={80} height={80} style={styles.logoImage} />
    )}
    <Text variant="bodyLarge" style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 16,
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
