import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useChangePassword } from '../../hooks';
import { colors } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordScreen({ navigation }: Props) {
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  const onSubmit = (data: ChangePasswordForm) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Password changed successfully.');
          navigation.goBack();
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.response?.data?.message ?? error.message ?? 'Failed to change password.');
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <Controller
        control={control}
        name="currentPassword"
        rules={{ required: 'Current password is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.currentPassword && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter current password"
            secureTextEntry
          />
        )}
      />
      {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword.message}</Text>}

      <Text style={styles.label}>New Password</Text>
      <Controller
        control={control}
        name="newPassword"
        rules={{
          required: 'New password is required',
          minLength: { value: 8, message: 'Must be at least 8 characters' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.newPassword && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter new password"
            secureTextEntry
          />
        )}
      />
      {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}

      <Text style={styles.label}>Confirm New Password</Text>
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Please confirm your password',
          validate: (v) => v === newPassword || 'Passwords do not match',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Confirm new password"
            secureTextEntry
          />
        )}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

      <TouchableOpacity
        style={[styles.button, changePassword.isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={changePassword.isPending}
        activeOpacity={0.7}
      >
        {changePassword.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
