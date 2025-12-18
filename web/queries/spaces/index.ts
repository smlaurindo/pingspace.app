import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createSpace } from "@/api/create-space";
import { listSpaces } from "@/api/list-spaces";
import { getSpace } from "@/api/get-space";

export function useCreateSpaceMutation() {
  return useMutation({
    mutationFn: createSpace,
  });
}

export function useListSpacesInfiniteQuery(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: ["spaces", { limit }],
    queryFn: ({ pageParam }) => listSpaces({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  });
}

export function useGetSpaceQuery(spaceId: string) {
  return useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpace(spaceId),
  });
}
