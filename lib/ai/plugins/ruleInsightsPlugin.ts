import type { AIPlugin, AIInsightItem } from "../aiEngine";
import type { FinancialAIContext } from "../aiContextProviders";
import { formatCurrencyExact } from "../../currency";

export class RuleInsightsPlugin implements AIPlugin {
  id = "rule-insights-plugin";
  name = "Rule-Based Insight Generator";
  version = "1.0.0";
  capabilities: ("insights" | "forecast" | "categorization" | "chat")[] = ["insights"];

  async analyze(ctx: FinancialAIContext): Promise<AIInsightItem[]> {
    const insights: AIInsightItem[] = [];

    // Check Budget Risks
    ctx.budgetRisk.budgets.forEach((b) => {
      if (b.riskLevel === "exceeded") {
        insights.push({
          id: `budget_exceeded_${b.category}`,
          type: "budget",
          title: "Budget Exceeded",
          message: `You have exceeded your **${b.category}** budget limit by ${formatCurrencyExact(Math.abs(b.remaining), ctx.currency)}.`,
          severity: "warning",
          actionableLink: "/budgets",
        });
      } else if (b.riskLevel === "warning") {
        insights.push({
          id: `budget_warning_${b.category}`,
          type: "budget",
          title: "Budget Threshold Alert",
          message: `You have used over 80% of your **${b.category}** budget.`,
          severity: "info",
          actionableLink: "/budgets",
        });
      }
    });

    // Check Savings Velocity
    if (ctx.transactionVelocity.totalIncome > 0) {
      if (ctx.transactionVelocity.savingsRatePercentage >= 20) {
        insights.push({
          id: "savings_rate_healthy",
          type: "savings",
          title: "Healthy Savings Velocity",
          message: `Excellent! You are saving **${ctx.transactionVelocity.savingsRatePercentage}%** of your total monthly income.`,
          severity: "success",
        });
      } else if (ctx.transactionVelocity.savingsRatePercentage < 10) {
        insights.push({
          id: "savings_rate_low",
          type: "savings",
          title: "Low Savings Velocity",
          message: `Your current savings rate is **${ctx.transactionVelocity.savingsRatePercentage}%**. Consider setting up budget limits to boost savings.`,
          severity: "warning",
        });
      }
    }

    return insights;
  }
}
