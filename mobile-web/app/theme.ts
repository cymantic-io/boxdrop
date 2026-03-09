import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#2A9D8F',
  primaryDark: '#1A7A6E',
  primaryLight: '#E0F5F1',
  primaryGradientStart: '#264653',
  primaryGradientEnd: '#2A9D8F',

  accent: '#E76F51',
  accentLight: '#FFF0EB',

  highlight: '#F4A261',
  highlightLight: '#FFF5E6',

  background: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  darkSurface: '#264653',

  textPrimary: '#1D2939',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  border: '#E4E7EC',
  borderLight: '#F2F4F7',

  success: '#12B76A',
  successLight: '#ECFDF3',
  error: '#F04438',
  errorLight: '#FEF3F2',
  warning: '#F79009',
  warningLight: '#FFFAEB',

  white: '#FFFFFF',
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.accent,
    secondaryContainer: colors.accentLight,
    tertiary: colors.highlight,
    tertiaryContainer: colors.highlightLight,
    surface: colors.surface,
    surfaceVariant: colors.borderLight,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.errorLight,
    onPrimary: colors.white,
    onPrimaryContainer: colors.primaryDark,
    onSecondary: colors.white,
    onSecondaryContainer: colors.accent,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onBackground: colors.textPrimary,
    onError: colors.white,
    outline: colors.border,
    outlineVariant: colors.borderLight,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  roundness: 12,
};
