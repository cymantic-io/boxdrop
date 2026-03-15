import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  getTransaction,
  claimListing,
  confirmPayment,
  confirmPickup,
  cancelTransaction,
} from '../services/api';
import type { ClaimListingRequest } from '../types';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionKeys.all, 'list'] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
};

export function useTransactions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: getTransactions,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 30 * 1000,
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.detail(id!),
    queryFn: () => getTransaction(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useClaimListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClaimListingRequest) => claimListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useConfirmPickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => confirmPickup(id, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
