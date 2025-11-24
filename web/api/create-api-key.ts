import type { CreateApiKeyRequest, CreateApiKeyResponse } from "@/@types/api-keys";
import { api } from "@/lib/api";

export async function createApiKey(spaceId: string, data: CreateApiKeyRequest) {
  const response = await api.post<CreateApiKeyResponse>(`/v1/spaces/${spaceId}/api-keys`, data);
  return response.data;
}
