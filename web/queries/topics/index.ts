import { CreateTopicRequest } from "@/@types/topics";
import { createTopic } from "@/api/create-topic";
import { deleteTopic } from "@/api/delete-topic";
import { getTopic } from "@/api/get-topic";
import { listTopics } from "@/api/list-topics";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateTopicMutation(spaceId: string) {
  return useMutation({
    mutationFn: (data: CreateTopicRequest) => createTopic(spaceId, data),
  });
}

export function useGetTopicQuery(spaceId: string, topicId: string) {
  return useQuery({
    queryKey: ["topics", spaceId, topicId],
    queryFn: () => getTopic(spaceId, topicId),
  });
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spaceId, topicId }: { spaceId: string; topicId: string }) =>
      deleteTopic(spaceId, topicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topics", variables.spaceId, variables.topicId],
      });
    },
  });
}

export function useListTopicsQuery(spaceId: string) {
  return useQuery({
    queryKey: ["topics", spaceId],
    queryFn: () => listTopics(spaceId),
  });
}
