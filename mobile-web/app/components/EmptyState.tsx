import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  message: string;
  icon?: string;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon = '📦', testID }) => (
  <View style={styles.container} testID={testID}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.message}>{message}</Text>
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
  message: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});
