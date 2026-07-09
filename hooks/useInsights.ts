import { useQuery } from "@tanstack/react-query";
import { fetchInsights, type Insight } from "@/lib/api/insights";

export const INSIGHTS_KEY = ["insights"] as const;

export const useInsights = () => {
  return useQuery<{ insights: Insight[] }, Error>({
    queryKey: INSIGHTS_KEY,
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};
