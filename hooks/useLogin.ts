import { useMutation } from "@tanstack/react-query";
import type { LoginInput } from "@/lib/types/auth";
import { loginUser } from "@/lib/api/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
  });
}
