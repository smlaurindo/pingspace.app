import { createSpace } from "@/api/create-space";
import { useMutation } from "@tanstack/react-query";

export function useCreateSpaceMutation() {
  return useMutation({
    mutationFn: createSpace,
  });
}
