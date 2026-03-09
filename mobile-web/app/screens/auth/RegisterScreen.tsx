import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await register(data.email, data.password, data.displayName);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('../../../assets/icon.png')} style={styles.logoImage} />
        <Text variant="headlineLarge" style={styles.logo}>BoxDrop</Text>

        <Controller
          control={control}
          name="displayName"
          rules={{ required: 'Display name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="register-name"
              mode="flat"
              label="Display Name"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.displayName}
              style={styles.input}
              textColor="#FFFFFF"
              placeholderTextColor="rgba(255,255,255,0.4)"
              theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)', primary: '#F4A261', surfaceVariant: 'rgba(255,255,255,0.12)' } }}
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
              mode="flat"
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.email}
              style={styles.input}
              textColor="#FFFFFF"
              placeholderTextColor="rgba(255,255,255,0.4)"
              theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)', primary: '#F4A261', surfaceVariant: 'rgba(255,255,255,0.12)' } }}
            />
          )}
        />
        <HelperText testID="error-email" type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="register-password"
              mode="flat"
              label="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.password}
              style={styles.input}
              textColor="#FFFFFF"
              placeholderTextColor="rgba(255,255,255,0.4)"
              theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)', primary: '#F4A261', surfaceVariant: 'rgba(255,255,255,0.12)' } }}
            />
          )}
        />
        <HelperText testID="error-password" type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="register-confirm-password"
              mode="flat"
              label="Confirm Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.confirmPassword}
              style={styles.input}
              textColor="#FFFFFF"
              placeholderTextColor="rgba(255,255,255,0.4)"
              theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)', primary: '#F4A261', surfaceVariant: 'rgba(255,255,255,0.12)' } }}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.confirmPassword}>{errors.confirmPassword?.message}</HelperText>

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
          labelStyle={styles.linkText}
        >
          Already have an account? Log in
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#264653',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
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
  input: {
    marginBottom: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
  linkBold: {
    color: '#F4A261',
    fontWeight: '600',
  },
});
