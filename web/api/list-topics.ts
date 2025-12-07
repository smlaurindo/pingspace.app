import type { ListTopicsResponse } from "@/@types/topics";
import { api } from "@/lib/api";

export async function listTopics(spaceId: string) {
  const response = await api.get<ListTopicsResponse[]>(
    `/v1/spaces/${spaceId}/topics`
  );

  return response.data;
}
