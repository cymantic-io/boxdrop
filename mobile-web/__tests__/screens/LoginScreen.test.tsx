import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

const mockNavigate = jest.fn();

const mockLogin = jest.fn();
jest.mock('../../app/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      login: mockLogin,
      isAuthenticated: false,
    };
    return selector ? selector(state) : state;
  },
}));

import { LoginScreen } from '../../app/screens/auth/LoginScreen';

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('LoginScreen', () => {
  const defaultProps: any = {
    navigation: { navigate: mockNavigate } as any,
    route: { params: undefined, key: 'Login', name: 'Login' as const },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    const { getAllByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getAllByText('Email').length).toBeGreaterThan(0);
    expect(getAllByText('Password').length).toBeGreaterThan(0);
  });

  it('renders login button', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByText('Log In')).toBeTruthy();
  });

  it('renders register link', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByText("Don't have an account? Register")).toBeTruthy();
  });

  it('navigates to Register on link press', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    fireEvent.press(getByText("Don't have an account? Register"));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});
