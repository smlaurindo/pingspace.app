import { ListSpacesRequest, ListSpacesResponse } from "@/@types/spaces";
import { api } from "@/lib/api";

export async function listSpaces({
  cursor,
  limit = 20,
}: ListSpacesRequest): Promise<ListSpacesResponse> {
  const response = await api.get<ListSpacesResponse>("/v1/spaces", {
    params: { cursor, limit },
  });

  return response.data;
}
