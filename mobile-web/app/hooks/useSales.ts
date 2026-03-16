import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSales,
  getSale,
  getNearbySales,
  createSale,
  updateSale,
  deleteSale,
  activateSale,
  endSale,
} from '../services/api';
import type { CreateSaleRequest, UpdateSaleRequest } from '../types';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
  nearby: (lat: number, lng: number, radiusKm: number) =>
    [...saleKeys.all, 'nearby', lat, lng, radiusKm] as const,
};

export function useMySales(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saleKeys.lists(),
    queryFn: getSales,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 30 * 1000,
  });
}

export function useSale(saleId: string | undefined) {
  return useQuery({
    queryKey: saleKeys.detail(saleId!),
    queryFn: () => getSale(saleId!),
    enabled: !!saleId,
    staleTime: 30 * 1000,
  });
}

export function useNearbySales(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm: number,
  refreshTrigger?: number,
) {
  return useQuery({
    queryKey: [...saleKeys.nearby(lat ?? 0, lng ?? 0, radiusKm), refreshTrigger],
    queryFn: () => getNearbySales(lat!, lng!, radiusKm),
    enabled: lat != null && lng != null,
    staleTime: 30 * 1000,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleRequest) => createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleRequest }) =>
      updateSale(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
  });
}

export function useActivateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateSale(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
    },
  });
}

export function useEndSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endSale(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
    },
  });
}
