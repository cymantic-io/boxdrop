import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCreateSale } from '../../hooks';
import { colors } from '../../theme';
import { useLocationStore } from '../../stores/useLocationStore';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import type { CreateSaleStackParamList, CreateSaleRequest } from '../../types';

type Props = NativeStackScreenProps<CreateSaleStackParamList, 'CreateSale'>;

export function CreateSaleScreen({ navigation }: Props) {
  const { latitude, longitude } = useLocationStore();
  const { mutate: createSale, isPending } = useCreateSale();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateSaleRequest>({
    defaultValues: {
      title: '',
      description: '',
      address: '',
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      startsAt: '',
      endsAt: '',
    },
  });

  const onSubmit = (data: CreateSaleRequest) => {
    const saleData = {
      ...data,
      latitude: data.latitude || latitude || 0,
      longitude: data.longitude || longitude || 0,
    };

    createSale(saleData, {
      onSuccess: (sale) => {
        navigation.replace('AddListings', { saleId: sale.id });
      },
      onError: (error) => {
        Alert.alert('Error', (error as Error).message ?? 'Failed to create sale');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <WebContentWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineSmall" style={styles.heading}>Create a Sale</Text>

        <Text variant="labelLarge" style={styles.label}>Title *</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Title"
              style={styles.input}
              placeholder="e.g., Moving Sale - Everything Must Go!"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.title}
            />
          )}
        />
        {errors.title && <HelperText type="error">{errors.title.message}</HelperText>}

        <Text variant="labelLarge" style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Description"
              style={[styles.input, styles.multiline]}
              placeholder="Describe your sale..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Text variant="labelLarge" style={styles.label}>Address *</Text>
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Address is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Address"
              style={styles.input}
              placeholder="123 Main St, City, State"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.address}
            />
          )}
        />
        {errors.address && <HelperText type="error">{errors.address.message}</HelperText>}

        {latitude && longitude && (
          <Text variant="bodySmall" style={styles.locationNote}>
            📍 Using your current location ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </Text>
        )}

        <Text variant="labelLarge" style={styles.label}>Start Date/Time (ISO format) *</Text>
        <Controller
          control={control}
          name="startsAt"
          rules={{ required: 'Start date is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Start Date/Time"
              style={styles.input}
              placeholder="2025-06-15T09:00:00"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.startsAt}
            />
          )}
        />
        {errors.startsAt && <HelperText type="error">{errors.startsAt.message}</HelperText>}

        <Text variant="labelLarge" style={styles.label}>End Date/Time (ISO format) *</Text>
        <Controller
          control={control}
          name="endsAt"
          rules={{ required: 'End date is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="End Date/Time"
              style={styles.input}
              placeholder="2025-06-15T17:00:00"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.endsAt}
            />
          )}
        />
        {errors.endsAt && <HelperText type="error">{errors.endsAt.message}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          loading={isPending}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitText}
        >
          Create Sale & Add Items
        </Button>
      </ScrollView>
      </WebContentWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  heading: { color: '#1D2939', marginBottom: 20, fontWeight: '700' },
  label: { color: '#667085', marginBottom: 6, marginTop: 12 },
  input: { marginBottom: 4, backgroundColor: colors.surface },
  multiline: { minHeight: 80 },
  locationNote: { color: '#12B76A', marginTop: 8 },
  submitButton: { backgroundColor: '#2A9D8F', borderRadius: 12, marginTop: 24 },
  submitButtonContent: { paddingVertical: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
