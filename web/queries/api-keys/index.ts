import type { CreateApiKeyRequest } from "@/@types/api-keys";
import { createApiKey } from "@/api/create-api-key";
import { listApiKeys } from "@/api/list-api-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateApiKeyMutation(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => createApiKey(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", spaceId] });
    },
  });
}

export function useListApiKeysQuery(spaceId: string) {
  return useQuery({
    queryKey: ["api-keys", spaceId],
    queryFn: () => listApiKeys(spaceId),
  });
}
