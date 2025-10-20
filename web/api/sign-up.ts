import { SignUpRequest } from "@/@types/auth";
import { api } from "@/lib/api";

export async function signUp(data: SignUpRequest) {
  return await api.post("/v1/auth/sign-up", data);
}
