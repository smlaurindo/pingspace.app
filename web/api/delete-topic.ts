import { api } from "@/lib/api";

export async function deleteTopic(spaceId: string, topicId: string) {
  return await api.delete<void>(
    `/v1/spaces/${spaceId}/topics/${topicId}`
  );
}