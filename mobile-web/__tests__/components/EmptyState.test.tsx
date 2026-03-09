import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../../app/components/EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    const { getByText } = render(<EmptyState message="No items" />);
    expect(getByText('No items')).toBeTruthy();
  });

  it('renders default logo image when no icon', () => {
    const { queryByText } = render(<EmptyState message="Empty" />);
    // When no icon prop, shows the app logo image instead of an emoji
    expect(queryByText('📦')).toBeNull();
  });

  it('renders custom icon', () => {
    const { getByText } = render(<EmptyState message="Empty" icon="🎉" />);
    expect(getByText('🎉')).toBeTruthy();
  });
});
