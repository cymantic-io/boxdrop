import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';

interface ClaimButtonProps {
  price: number;
  onPress: () => void;
  loading?: boolean;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ price, onPress, loading }) => (
  <Button
    mode="contained"
    onPress={onPress}
    loading={loading}
    disabled={loading}
    style={styles.button}
    contentStyle={styles.content}
    labelStyle={styles.label}
    buttonColor={colors.primary}
    testID="claim-button"
  >
    Claim for ${price.toFixed(2)}
  </Button>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
  },
  content: {
    minHeight: 54,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
