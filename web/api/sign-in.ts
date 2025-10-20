import { SignInRequest } from "@/@types/auth";
import { api } from "@/lib/api";

export async function signIn(data: SignInRequest) {
  return await api.post("/v1/auth/sign-in", data);
}
