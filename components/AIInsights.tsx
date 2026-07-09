"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInsights } from "@/hooks/useInsights";
import { Loader2, Lightbulb, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const severityConfig = {
  warning: { icon: AlertTriangle, class: "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20" },
  success: { icon: CheckCircle2, class: "border-green-500/30 bg-green-50 dark:bg-green-950/20" },
  info: { icon: Info, class: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20" },
};

export default function AIInsights() {
  const { t } = useTranslation();
  const { data, isLoading } = useInsights();
  const insights = data?.insights ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Lightbulb className="size-5 text-yellow-500" />
        <CardTitle className="text-lg">{t("ai.title")}</CardTitle>
      </CardHeader>
      <CardContent>
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
            {insights.map((insight, i) => {
              const cfg = severityConfig[insight.severity];
              const Icon = cfg.icon;
              const typeLabel = t(`ai.type_${insight.type}`);

              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${cfg.class}`}
                >
                  <Icon className="mt-0.5 size-5 shrink-0" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {typeLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase ${
                          insight.severity === "warning"
                            ? "border-yellow-500 text-yellow-600"
                            : insight.severity === "success"
                              ? "border-green-500 text-green-600"
                              : "border-blue-500 text-blue-600"
                        }`}
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {insight.message.split(/\*\*(.*?)\*\*/).map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
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
