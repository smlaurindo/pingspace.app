import { GetSpaceResponse } from "@/@types/spaces";
import { api } from "@/lib/api";

export async function getSpace(spaceId: string): Promise<GetSpaceResponse> {
  const response = await api.get<GetSpaceResponse>(`/v1/spaces/${spaceId}`);

  return response.data;
}
