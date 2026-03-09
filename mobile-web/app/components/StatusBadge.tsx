import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { SaleStatus } from '../types';

const STATUS_COLORS: Record<SaleStatus, { bg: string; text: string }> = {
  DRAFT: { bg: '#FFF5E6', text: '#F4A261' },
  ACTIVE: { bg: '#ECFDF3', text: '#12B76A' },
  ENDED: { bg: '#F7F7F8', text: '#667085' },
  CANCELLED: { bg: '#FEF3F2', text: '#F04438' },
};

interface StatusBadgeProps {
  status: SaleStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColors = STATUS_COLORS[status];
  return (
    <Chip
      compact
      style={[styles.chip, { backgroundColor: statusColors.bg }]}
      textStyle={[styles.text, { color: statusColors.text }]}
    >
      {status}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
