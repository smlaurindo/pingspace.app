import { CreateSpaceRequest, CreateSpaceResponse } from "@/@types/spaces";
import { api } from "@/lib/api";

export async function createSpace(data: CreateSpaceRequest) {
  return await api.post<CreateSpaceResponse>("/v1/spaces", data);
}
