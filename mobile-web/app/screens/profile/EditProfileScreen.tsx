import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCurrentUser, useUpdateProfile } from '../../hooks';
import { uploadImage } from '../../services/api';
import { colors } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { launchImageLibraryAsync, MediaTypeOptions } = await import('expo-image-picker');
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const formData = new FormData();
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() ?? 'avatar.jpg';
        formData.append('file', {
          uri,
          name: filename,
          type: 'image/jpeg',
        } as any);
        const url = await uploadImage(formData);
        setAvatarUrl(url);
        setUploading(false);
      }
    } catch (error: any) {
      setUploading(false);
      Alert.alert('Upload Failed', error.message ?? 'Could not upload image.');
    }
  };

  const handleSave = () => {
    updateProfile.mutate(
      {
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        address: address.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated.');
          navigation.goBack();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message ?? 'Failed to update profile.');
        },
      },
    );
  };

  const initial = (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} activeOpacity={0.7}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        {uploading ? (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : (
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={address}
        onChangeText={setAddress}
        placeholder="Your address (for pickup directions)"
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.saveButton, updateProfile.isPending && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={updateProfile.isPending}
        activeOpacity={0.7}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: colors.primary,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
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
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveButton: {
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
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
