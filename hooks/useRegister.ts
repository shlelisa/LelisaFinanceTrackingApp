import { useMutation } from "@tanstack/react-query";
import type { RegisterInput } from "@/lib/types/auth";
import { registerUser } from "@/lib/api/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
  });
}
