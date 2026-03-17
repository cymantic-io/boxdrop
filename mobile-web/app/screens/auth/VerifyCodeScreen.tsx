import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';
import { loginSendCode } from '../../services/api';
import { colors } from '../../theme';
import BoxdropIcon from '../../../assets/boxdrop-icon.svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

export function VerifyCodeScreen({ route }: Props) {
  const { challengeId, method, email, flow } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const getInstructions = () => {
    switch (method) {
      case 'EMAIL_OTP': return `Enter the verification code sent to ${email}`;
      case 'SMS_OTP': return 'Enter the verification code sent to your phone';
      case 'TOTP': return 'Enter the code from your authenticator app';
      default: return 'Enter your verification code';
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      if (flow === 'login') {
        await login(challengeId, method, code);
      } else {
        await register(challengeId, code);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await loginSendCode(challengeId, method);
      setResendMessage('Code resent!');
      setTimeout(() => setResendMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />
      <View style={styles.closeButtonContainer}>
        <Button
          mode="text"
          onPress={() => useAuthStore.getState().setShowAuthPrompt(false)}
          labelStyle={styles.closeButton}
        >
          ✕
        </Button>
      </View>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <BoxdropIcon width={64} height={64} style={styles.logoImage} />
          <View>
            <Text variant="headlineMedium" style={styles.logo}>BoxDrop</Text>
            <Text variant="bodySmall" style={styles.subtitle}>Verify to finish signing in.</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text variant="titleMedium" style={styles.formTitle}>Verification code</Text>
          <Text style={styles.instructions}>{getInstructions()}</Text>

          <TextInput
            testID="verify-code"
            mode="outlined"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            value={code}
            onChangeText={setCode}
            error={!!error}
            style={[styles.input, styles.codeInput]}
            textColor={colors.white}
            placeholder="Enter 6-digit code"
            placeholderTextColor="rgba(255,255,255,0.45)"
            outlineStyle={styles.inputOutline}
            theme={inputTheme}
          />

          <View style={styles.errorSlot}>
            <HelperText type="error" visible={!!error}>
              {error || ' '}
            </HelperText>
          </View>
          <HelperText type="info" visible={!!resendMessage} style={styles.resendMessage}>
            {resendMessage}
          </HelperText>

          <Button
            testID="verify-submit"
            mode="contained"
            onPress={handleVerify}
            loading={loading}
            disabled={loading || code.length !== 6}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
          >
            Verify
          </Button>

          {(method === 'EMAIL_OTP' || method === 'SMS_OTP') && (
            <Button
              mode="text"
              onPress={handleResend}
              labelStyle={styles.linkText}
              style={styles.registerLink}
              contentStyle={styles.registerButtonContent}
            >
              Resend Code
            </Button>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const inputTheme = {
  colors: {
    primary: colors.accent,
    outline: 'rgba(255,255,255,0.2)',
    onSurfaceVariant: 'rgba(255,255,255,0.65)',
    surface: 'rgba(255,255,255,0.05)',
    background: '#162A33',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#162A33',
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(42,157,143,0.35)',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: -140,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(244,162,97,0.25)',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 18,
    right: 12,
    zIndex: 100,
  },
  closeButton: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  logo: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(12, 24, 30, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  formTitle: {
    color: colors.white,
    fontWeight: '700',
    marginBottom: 6,
  },
  instructions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  inputOutline: {
    borderRadius: 12,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 52,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  linkText: {
    color: colors.accent,
    fontSize: 14,
  },
  resendMessage: {
    color: colors.primary,
    textAlign: 'center',
  },
  errorSlot: {
    minHeight: 22,
    justifyContent: 'center',
  },
  registerButtonContent: {
    height: 40,
  },
  registerLink: {
    marginTop: 4,
  },
});
