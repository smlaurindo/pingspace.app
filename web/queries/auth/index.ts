import { signIn } from "@/api/sign-in";
import { signUp } from "@/api/sign-up";
import { useMutation } from "@tanstack/react-query";

export function useSignUpMutation() {
  return useMutation({
    mutationFn: signUp,
  });
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: signIn,
  });
}