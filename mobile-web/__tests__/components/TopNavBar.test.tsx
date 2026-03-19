import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopNavBar } from '../../app/components/TopNavBar';

const mockNavigate = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
const mockGetRootState = jest.fn();

jest.mock('../../App', () => ({
  navigationRef: {
    isReady: jest.fn(() => true),
    addListener: (...args: any[]) => mockAddListener(...args),
    getRootState: () => mockGetRootState(),
    navigate: (...args: any[]) => mockNavigate(...args),
  },
}));

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: (props: any) => <View testID={`icon-${props.name}`} {...props} />,
  };
});

describe('TopNavBar', () => {
  const createState = (activeIndex: number, nestedIndex = 0) => ({
    index: activeIndex,
    routes: [
      { name: 'HomeTab', key: 'home-key', state: { key: 'home-stack-key', index: 0, routes: [{ name: 'Home' }] } },
      { name: 'MySalesTab', key: 'mysales-key', state: { key: 'mysales-stack-key', index: 0, routes: [{ name: 'MySalesList' }] } },
      { name: 'MessagesTab', key: 'messages-key', state: { key: 'messages-stack-key', index: 0, routes: [{ name: 'Inbox' }] } },
      {
        name: 'ProfileTab',
        key: 'profile-key',
        state: {
          key: 'profile-stack-key',
          index: nestedIndex,
          routes: [{ name: 'Profile' }, { name: 'Settings' }],
        },
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRootState.mockReturnValue(createState(0));
  });

  it('renders all navigation items', () => {
    const { getByText } = render(<TopNavBar />);
    expect(getByText('Explore')).toBeTruthy();
    expect(getByText('My Sales')).toBeTruthy();
    expect(getByText('Messages')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('navigates to a different tab when pressed', () => {
    const { getByText } = render(<TopNavBar />);
    fireEvent.press(getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfileTab');
  });

  it('resets stack when pressing the already active tab with nested screens', () => {
    const stateWithNestedProfile = createState(3, 1);
    mockGetRootState.mockReturnValue(stateWithNestedProfile);
    const { getByText } = render(<TopNavBar />);
    fireEvent.press(getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfileTab', { screen: 'Profile' });
  });

  it('does not dispatch reset when pressing active tab at root', () => {
    mockGetRootState.mockReturnValue(createState(3, 0));
    const { getByText } = render(<TopNavBar />);
    fireEvent.press(getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfileTab');
  });
});
