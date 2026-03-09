import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { CreateListingRequest, ListingCondition } from '../types';
import { colors } from '../theme';

interface DraftItemFormProps {
  onSubmit: (data: CreateListingRequest) => void;
  loading?: boolean;
}

export const DraftItemForm: React.FC<DraftItemFormProps> = ({ onSubmit, loading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateListingRequest>({
    defaultValues: {
      title: '',
      description: '',
      startingPrice: 0,
      minimumPrice: 0,
      category: '',
      condition: 'GOOD' as ListingCondition,
    },
  });

  const handleFormSubmit = (data: CreateListingRequest) => {
    onSubmit({
      ...data,
      startingPrice: Number(data.startingPrice),
      minimumPrice: Number(data.minimumPrice),
    });
    reset();
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.heading}>Add Item</Text>

      <Controller
        control={control}
        name="title"
        rules={{ required: 'Title is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Item title *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.title}
            style={styles.input}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.title}>{errors.title?.message}</HelperText>

      <Controller
        control={control}
        name="category"
        rules={{ required: 'Category is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Category *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.category}
            style={styles.input}
          />
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="startingPrice"
          rules={{ required: 'Price required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Starting price *"
              value={value ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={!!errors.startingPrice}
              style={[styles.input, styles.halfInput]}
            />
          )}
        />
        <Controller
          control={control}
          name="minimumPrice"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Min price"
              value={value ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              style={[styles.input, styles.halfInput]}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Description (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={2}
            style={[styles.input, styles.multiline]}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(handleFormSubmit)}
        loading={loading}
        disabled={loading}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
        icon="plus"
      >
        Add Item
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    elevation: 3,
  },
  heading: {
    color: colors.textPrimary,
    marginBottom: 12,
    fontWeight: '700',
  },
  input: {
    marginBottom: 4,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 60,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  addButtonContent: {
    height: 48,
  },
});
