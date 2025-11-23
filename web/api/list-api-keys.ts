import type { ListApiKeysResponse } from "@/@types/api-keys";
import { api } from "@/lib/api";

export async function listApiKeys(spaceId: string) {
  const response = await api.get<ListApiKeysResponse>(`/v1/spaces/${spaceId}/api-keys`);
  return response.data;
}
