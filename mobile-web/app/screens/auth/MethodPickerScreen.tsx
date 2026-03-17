import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Text, HelperText, List } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { loginSendCode } from '../../services/api';
import BoxdropIcon from '../../../assets/boxdrop-icon.svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'MethodPicker'>;

const METHOD_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  EMAIL_OTP: { label: 'Email Code', description: 'Receive a code via email', icon: 'email-outline' },
  SMS_OTP: { label: 'SMS Code', description: 'Receive a code via text message', icon: 'cellphone-message' },
  TOTP: { label: 'Authenticator App', description: 'Use Google Authenticator or similar', icon: 'shield-key-outline' },
};

export function MethodPickerScreen({ navigation, route }: Props) {
  const { challengeId, methods, email } = route.params;
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (method: string) => {
    setLoading(method);
    setError(null);
    try {
      if (method !== 'TOTP') {
        await loginSendCode(challengeId, method);
      }
      navigation.navigate('VerifyCode', {
        challengeId,
        method,
        email,
        flow: 'login',
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to send code');
    } finally {
      setLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <BoxdropIcon width={64} height={64} style={styles.logoImage} />
        <Text variant="headlineLarge" style={styles.logo}>BoxDrop</Text>

        <Text style={styles.instructions}>Choose a verification method</Text>

        <View style={styles.methodList}>
          {methods.map((method) => {
            const info = METHOD_LABELS[method] ?? { label: method, description: '', icon: 'help-circle-outline' };
            return (
              <List.Item
                key={method}
                title={info.label}
                description={info.description}
                left={(props) => <List.Icon {...props} icon={info.icon} color="#F4A261" />}
                onPress={() => handleSelect(method)}
                disabled={loading !== null}
                style={styles.methodItem}
                titleStyle={styles.methodTitle}
                descriptionStyle={styles.methodDescription}
              />
            );
          })}
        </View>

        <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText>

        {loading && (
          <Button loading disabled style={styles.loadingButton} labelStyle={styles.buttonText}>
            Sending...
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoImage: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 18,
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
  methodList: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  methodItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  methodTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  methodDescription: {
    color: 'rgba(255,255,255,0.5)',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
  loadingButton: {
    marginTop: 16,
  },
  buttonText: {
    color: 'rgba(255,255,255,0.6)',
  },
});
