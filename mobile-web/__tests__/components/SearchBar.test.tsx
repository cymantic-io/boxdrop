import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { SearchBar } from '../../app/components/SearchBar';

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('SearchBar', () => {
  it('renders input with placeholder', () => {
    const { getByPlaceholderText } = renderWithPaper(
      <SearchBar value="" onChangeText={() => {}} placeholder="Search..." />,
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('uses default placeholder when none provided', () => {
    const { getByPlaceholderText } = renderWithPaper(
      <SearchBar value="" onChangeText={() => {}} />,
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onChangeText on input', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = renderWithPaper(
      <SearchBar value="" onChangeText={onChangeText} placeholder="Search..." />,
    );
    fireEvent.changeText(getByPlaceholderText('Search...'), 'test');
    expect(onChangeText).toHaveBeenCalledWith('test');
  });

  it('renders with value', () => {
    const { getByDisplayValue } = renderWithPaper(
      <SearchBar value="hello" onChangeText={() => {}} />,
    );
    expect(getByDisplayValue('hello')).toBeTruthy();
  });

  it('renders empty when no value', () => {
    const { getByPlaceholderText } = renderWithPaper(
      <SearchBar value="" onChangeText={() => {}} />,
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });
});
