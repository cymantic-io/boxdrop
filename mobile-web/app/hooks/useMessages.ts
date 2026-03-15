import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getThreads, getThread, createThread, sendMessage } from '../services/api';
import type { CreateThreadRequest, SendMessageRequest } from '../types';

export const messageKeys = {
  all: ['threads'] as const,
  list: () => [...messageKeys.all, 'list'] as const,
  detail: (threadId: string) => [...messageKeys.all, 'detail', threadId] as const,
};

export function useThreads(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: messageKeys.list(),
    queryFn: getThreads,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 30 * 1000,
  });
}

export function useThread(threadId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.detail(threadId!),
    queryFn: () => getThread(threadId!),
    enabled: !!threadId,
    staleTime: 30 * 1000,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateThreadRequest) => createThread(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      data,
    }: {
      threadId: string;
      data: SendMessageRequest;
    }) => sendMessage(threadId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.detail(variables.threadId),
      });
    },
  });
}
