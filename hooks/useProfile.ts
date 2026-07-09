import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfileApi, updatePreferencesApi } from "@/lib/api/auth";

export const PROFILE_KEY = ["profile"] as const;

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullName?: string; phone?: string }) => updateProfileApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { currency?: string; language?: string; theme?: "light" | "dark" }) =>
      updatePreferencesApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
};
