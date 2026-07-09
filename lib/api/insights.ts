import api from "../axios";

export interface Insight {
  type: "spending" | "budget" | "savings" | "trend";
  message: string;
  severity: "info" | "warning" | "success";
}

export const fetchInsights = (): Promise<{ insights: Insight[] }> =>
  api.get("/insights").then((r) => r.data);
