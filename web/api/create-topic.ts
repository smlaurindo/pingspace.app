import { CreateTopicRequest } from "@/@types/topics";
import { api } from "@/lib/api";

export async function createTopic(spaceId: string, data: CreateTopicRequest) {
  return await api.post(`/v1/spaces/${spaceId}/topics`, data);
}
