import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe, changePassword } from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types';

export const userKeys = {
  me: ['user', 'me'] as const,
};

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: userKeys.me,
    queryFn: getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
}
