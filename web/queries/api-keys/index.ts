import type { CreateApiKeyRequest } from "@/@types/api-keys";
import { createApiKey } from "@/api/create-api-key";
import { listApiKeys } from "@/api/list-api-keys";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useCreateApiKeyMutation(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => createApiKey(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", spaceId] });
    },
  });
}

export function useListApiKeysInfiniteQuery(
  spaceId: string,
  limit: number = 20
) {
  return useInfiniteQuery({
    queryKey: ["api-keys", spaceId],
    queryFn: ({ pageParam }) =>
      listApiKeys(spaceId, { cursor: pageParam, limit, type: "ACTIVE" }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  });
}
