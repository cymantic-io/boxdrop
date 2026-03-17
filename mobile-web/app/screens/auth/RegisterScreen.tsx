import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { register } from '../../services/api';
import { colors } from '../../theme';
import BoxdropIcon from '../../../assets/boxdrop-icon.svg';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormData {
  displayName: string;
  email: string;
}

export function RegisterScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: { displayName: '', email: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await register(data.email, data.displayName);
      navigation.navigate('VerifyCode', {
        challengeId: result.challengeId,
        method: 'EMAIL_OTP',
        email: data.email,
        flow: 'register',
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <BoxdropIcon width={64} height={64} style={styles.logoImage} />
          <View>
            <Text variant="headlineMedium" style={styles.logo}>BoxDrop</Text>
            <Text variant="bodySmall" style={styles.subtitle}>Create your account to start selling and saving.</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text variant="titleMedium" style={styles.formTitle}>Create your account</Text>
          <Text variant="bodySmall" style={styles.formSubtitle}>We’ll send a one-time code to verify your email.</Text>

          <Controller
            control={control}
            name="displayName"
            rules={{ required: 'Display name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                testID="register-name"
                mode="outlined"
                placeholder="Display name"
                autoCapitalize="words"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.displayName}
                style={styles.input}
                textColor={colors.white}
                placeholderTextColor="rgba(255,255,255,0.45)"
                outlineStyle={styles.inputOutline}
                theme={inputTheme}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.displayName}>{errors.displayName?.message}</HelperText>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                testID="register-email"
                mode="outlined"
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.email}
                style={styles.input}
                textColor={colors.white}
                placeholderTextColor="rgba(255,255,255,0.45)"
                outlineStyle={styles.inputOutline}
                theme={inputTheme}
              />
            )}
          />
          <HelperText testID="error-email" type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>

          <View style={styles.errorSlot}>
            <HelperText type="error" visible={!!error} style={styles.registerError}>
              {error || ' '}
            </HelperText>
          </View>

          <Button
            testID="register-submit"
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
          >
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            labelStyle={styles.registerLinkText}
            style={styles.registerLink}
            contentStyle={styles.registerButtonContent}
          >
            Already have an account? Log in
          </Button>
        </View>
      </ScrollView>
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
    flexGrow: 1,
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
    marginTop: 12,
    marginBottom: 16,
  },
  formTitle: {
    color: colors.white,
    fontWeight: '700',
  },
  formSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  inputOutline: {
    borderRadius: 12,
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
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
  },
  registerError: {
    textAlign: 'center',
    fontSize: 14,
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
  registerLinkText: {
    color: colors.accent,
    fontWeight: '600',
  },
  linkBold: {
    color: colors.accent,
    fontWeight: '600',
  },
});
