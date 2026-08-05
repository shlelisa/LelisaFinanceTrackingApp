"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import TranslationProvider from "@/components/TranslationProvider";

import { AIEngineRegistry } from "@/lib/ai/aiEngine";
import { RuleInsightsPlugin } from "@/lib/ai/plugins/ruleInsightsPlugin";
import { PredictiveForecastPlugin } from "@/lib/ai/plugins/predictiveForecastPlugin";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    // Initialize AI Engine Plugins
    const aiEngine = AIEngineRegistry.getInstance();
    aiEngine.registerPlugin(new RuleInsightsPlugin());
    aiEngine.registerPlugin(new PredictiveForecastPlugin());

    const theme = localStorage.getItem("pft_theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>{children}</TranslationProvider>
    </QueryClientProvider>
  );
}
