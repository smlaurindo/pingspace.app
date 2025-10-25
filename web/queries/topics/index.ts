import { CreateTopicRequest } from "@/@types/topics";
import { createTopic } from "@/api/create-topic";
import { useMutation } from "@tanstack/react-query";

export function useCreateTopicMutation(spaceId: string) {
  return useMutation({
    mutationFn: (data: CreateTopicRequest) =>
      createTopic(spaceId, data),
  });
}
