import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface WebContentWrapperProps {
  children: React.ReactNode;
}

export function WebContentWrapper({ children }: WebContentWrapperProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
  },
});
