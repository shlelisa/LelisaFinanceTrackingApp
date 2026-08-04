import { computeInsights } from "../storage/financeLogic";

export interface Insight {
  type: "spending" | "budget" | "savings" | "trend";
  message: string;
  severity: "info" | "warning" | "success";
}

export const fetchInsights = async (): Promise<{ insights: Insight[] }> => {
  return computeInsights();
};
