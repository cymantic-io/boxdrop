import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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

describe('LoginScreen', () => {
  const defaultProps: any = {
    navigation: { navigate: mockNavigate } as any,
    route: { params: undefined, key: 'Login', name: 'Login' as const },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders login button', () => {
    const { getByText } = render(<LoginScreen {...defaultProps} />);
    expect(getByText('Log In')).toBeTruthy();
  });

  it('renders register link', () => {
    const { getByText } = render(<LoginScreen {...defaultProps} />);
    expect(getByText('Register')).toBeTruthy();
  });

  it('navigates to Register on link press', () => {
    const { getByText } = render(<LoginScreen {...defaultProps} />);
    fireEvent.press(getByText('Register'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});
