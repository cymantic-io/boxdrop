import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

const mockNavigate = jest.fn();

jest.mock('../../app/services/api', () => ({
  loginStart: jest.fn(),
  loginSendCode: jest.fn(),
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders email input', () => {
    const { getByTestId } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByTestId('login-email')).toBeTruthy();
  });

  it('renders continue button', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders register link', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByText('Create an account')).toBeTruthy();
  });

  it('navigates to Register on link press', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    fireEvent.press(getByText('Create an account'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});
