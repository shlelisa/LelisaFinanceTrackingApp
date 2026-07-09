import api from "../axios";
import type { AuthResponse } from "../types/api";

export const loginUser = (data: { email: string; password: string }): Promise<AuthResponse> =>
  api.post("/auth/login", data).then((r) => r.data as AuthResponse);

export const registerUser = (data: { fullName: string; email: string; phone?: string; password: string }): Promise<AuthResponse> =>
  api.post("/auth/register", data).then((r) => r.data as AuthResponse);

export const fetchProfile = () =>
  api.get("/auth/profile").then((r) => r.data.user);

export const updateProfileApi = (data: { fullName?: string; phone?: string }) =>
  api.put("/auth/profile", data).then((r) => r.data.user);

export const updatePreferencesApi = (data: { currency?: string; language?: string; theme?: string }) =>
  api.put("/auth/preferences", data).then((r) => r.data.user);

export const changePasswordApi = (data: { currentPassword: string; newPassword: string }) =>
  api.put("/auth/change-password", data).then((r) => r.data);
