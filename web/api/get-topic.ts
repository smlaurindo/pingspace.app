import { GetTopicResponse } from "@/@types/topics";
import { api } from "@/lib/api";

export async function getTopic(spaceId: string, topicId: string) {
  const response = await api.get<GetTopicResponse>(
    `/v1/spaces/${spaceId}/topics/${topicId}`
  );

  return response.data;
}
