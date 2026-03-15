import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';
import { loginSendCode } from '../../services/api';

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
        <Image source={require('../../../assets/icon.png')} style={styles.logoImage} />
        <Text variant="headlineLarge" style={styles.logo}>BoxDrop</Text>

        <Text style={styles.instructions}>{getInstructions()}</Text>

        <TextInput
          testID="verify-code"
          mode="flat"
          label="Verification Code"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleVerify}
          value={code}
          onChangeText={setCode}
          error={!!error}
          style={[styles.input, styles.codeInput]}
          textColor="#FFFFFF"
          placeholderTextColor="rgba(255,255,255,0.4)"
          theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)', primary: '#F4A261', surfaceVariant: 'rgba(255,255,255,0.12)' } }}
        />

        <HelperText type="error" visible={!!error}>{error}</HelperText>
        <HelperText type="info" visible={!!resendMessage} style={styles.resendMessage}>{resendMessage}</HelperText>

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
          >
            Resend Code
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#264653',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
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
  },
  logoImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 24,
  },
  logo: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  instructions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#2A9D8F',
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
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  resendMessage: {
    color: '#2A9D8F',
    textAlign: 'center',
  },
});
