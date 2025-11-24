import type { ListApiKeyRequest, ListApiKeysResponse } from "@/@types/api-keys";
import { api } from "@/lib/api";

export async function listApiKeys(
  spaceId: string,
  { cursor, limit = 20, type = "ACTIVE" }: ListApiKeyRequest
): Promise<ListApiKeysResponse> {
  const response = await api.get<ListApiKeysResponse>(
    `/v1/spaces/${spaceId}/api-keys`,
    { params: { cursor, limit, type } }
  );
  return response.data;
}
