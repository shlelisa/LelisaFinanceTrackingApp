import type { RegisterInput, LoginInput } from "../types/auth";
import api from "../axios";

export const registerUser = (data: RegisterInput) =>
  api.post("/auth/register", data).then((res) => res.data);

export const loginUser = (data: LoginInput) =>
  api.post("/auth/login", data).then((res) => res.data);
