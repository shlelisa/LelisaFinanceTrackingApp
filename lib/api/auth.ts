import type { AuthResponse, UserPreferences } from "../types/api";
import {
  getStoredUser,
  saveStoredUser,
  authenticateLocalUser,
  registerLocalUser,
} from "../storage/localStorage";

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  return authenticateLocalUser(data.email, data.password);
};

export const registerUser = async (data: { fullName: string; email: string; phone?: string; password: string }): Promise<AuthResponse> => {
  const registeredUser = registerLocalUser({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
  });
  return {
    message: "Registration successful",
    token: "local_token_" + Date.now(),
    user: registeredUser,
  };
};

export const fetchProfile = async () => {
  return getStoredUser();
};

export const updateProfileApi = async (data: { fullName?: string; phone?: string }) => {
  return saveStoredUser(data);
};

export const updatePreferencesApi = async (data: { currency?: string; language?: string; theme?: string }) => {
  const currentUser = getStoredUser();
  const currentPrefs: UserPreferences = currentUser.preferences || {};
  const newPrefs: UserPreferences = { ...currentPrefs, ...data };

  if (typeof window !== "undefined") {
    if (data.currency) localStorage.setItem("app_currency", data.currency);
    if (data.language) localStorage.setItem("app_language", data.language);
    if (data.theme) localStorage.setItem("app_theme", data.theme);
  }

  return saveStoredUser({ preferences: newPrefs });
};

export const changePasswordApi = async (data: { currentPassword: string; newPassword: string }) => {
  return { message: "Password updated locally" };
};
