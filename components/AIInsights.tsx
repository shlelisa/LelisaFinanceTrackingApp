"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIEngineRegistry, type AIInsightItem } from "@/lib/ai/aiEngine";
import { saveDerivedAICache, getDerivedAICache } from "@/lib/ai/aiDerivedStorage";
import { Loader2, Lightbulb, AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const severityConfig = {
  warning: { icon: AlertTriangle, class: "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20" },
  success: { icon: CheckCircle2, class: "border-green-500/30 bg-green-50 dark:bg-green-950/20" },
  info: { icon: Info, class: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20" },
};

export default function AIInsights() {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<AIInsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEngineInsights() {
      setIsLoading(true);
      try {
        const results = await AIEngineRegistry.getInstance().runAnalysis();
        setInsights(results);
        saveDerivedAICache(results);
      } catch (err) {
        console.error("AI Engine execution error", err);
        const cached = getDerivedAICache();
        if (cached) setInsights(cached.insights);
      } finally {
        setIsLoading(false);
      }
    }

    loadEngineInsights();
  }, []);

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center gap-2 border-b py-3">
        <Sparkles className="size-5 text-amber-500" />
        <CardTitle className="text-base font-bold">{t("ai.title")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : insights.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("ai.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {insights.map((insight) => {
              const cfg = severityConfig[insight.severity] || severityConfig.info;
              const Icon = cfg.icon;

              return (
                <div
                  key={insight.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 shadow-2xs ${cfg.class}`}
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{insight.title}</span>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {insight.message.split(/\*\*(.*?)\*\*/).map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
