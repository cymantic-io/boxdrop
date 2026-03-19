// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 40.7128, longitude: -74.006 },
  })),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiUrl: 'http://localhost:8080' } },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockIcon = (props) =>
    React.createElement(View, {
      ...props,
      testID: props.testID || `icon-${props.name || 'mock'}`,
    });

  return {
    __esModule: true,
    MaterialCommunityIcons: MockIcon,
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
    default: {
      MaterialCommunityIcons: MockIcon,
      Ionicons: MockIcon,
      FontAwesome: MockIcon,
    },
  };
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) =>
    React.createElement(View, {
      ...props,
      testID: props.testID || `icon-${props.name || 'mock'}`,
    });

  return {
    __esModule: true,
    default: MockIcon,
  };
});

jest.mock('@react-native-vector-icons/material-design-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) =>
    React.createElement(View, {
      ...props,
      testID: props.testID || `icon-${props.name || 'mock'}`,
    });

  return {
    __esModule: true,
    default: MockIcon,
  };
}, { virtual: true });

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) =>
    React.createElement(View, {
      ...props,
      testID: props.testID || `icon-${props.name || 'mock'}`,
    });

  return {
    __esModule: true,
    default: MockIcon,
  };
}, { virtual: true });

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMapView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref, testID: props.testID || 'mock-map-view' })
  );

  const MockMarker = (props) =>
    React.createElement(View, { ...props, testID: props.testID || 'mock-map-marker' });

  const MockCallout = (props) =>
    React.createElement(View, { ...props, testID: props.testID || 'mock-map-callout' });

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Callout: MockCallout,
    PROVIDER_GOOGLE: 'google',
  };
});
