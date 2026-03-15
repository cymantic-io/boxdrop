import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSavedListings,
  saveListing,
  unsaveListing,
} from '../services/api';

export const savedKeys = {
  all: ['saved'] as const,
  list: () => [...savedKeys.all, 'list'] as const,
};

export function useSavedListings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: savedKeys.list(),
    queryFn: getSavedListings,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 30 * 1000,
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => saveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
    },
  });
}

export function useUnsaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => unsaveListing(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.list() });
      const previous = queryClient.getQueryData(savedKeys.list());
      queryClient.setQueryData(savedKeys.list(), (old: any[] | undefined) =>
        old ? old.filter((item) => item.id !== listingId) : [],
      );
      return { previous };
    },
    onError: (_err, _listingId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(savedKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
    },
  });
}
