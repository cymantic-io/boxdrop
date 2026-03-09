import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image source={require('../../../assets/icon.png')} style={styles.logoImage} />
        <Text variant="headlineLarge" style={styles.logo}>BoxDrop</Text>

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
              testID="login-email"
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
        <HelperText type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="login-password"
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
        <HelperText type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>

        <Button
          testID="login-submit"
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
        >
          Log In
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          labelStyle={styles.linkText}
        >
          Don't have an account? <Text style={styles.linkBold}>Register</Text>
        </Button>
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
