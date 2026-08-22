import type { AIPlugin, AIInsightItem } from "../aiEngine";
import type { FinancialAIContext } from "../aiContextProviders";
import { formatCurrencyExact } from "../../currency";

export class PredictiveForecastPlugin implements AIPlugin {
  id = "predictive-forecast-plugin";
  name = "Predictive Financial Forecasting Engine";
  version = "1.0.0";
  capabilities: ("insights" | "forecast" | "categorization" | "chat")[] = ["forecast"];

  async analyze(ctx: FinancialAIContext): Promise<AIInsightItem[]> {
    const insights: AIInsightItem[] = [];

    // Analyze Goals
    ctx.goalVelocity.goals.forEach((g) => {
      if (g.percentage >= 100) {
        insights.push({
          id: `goal_achieved_${g.name}`,
          type: "savings",
          title: "Goal Achieved!",
          message: `Congratulations! You have reached 100% of your **${g.name}** target (${formatCurrencyExact(g.target, ctx.currency)}).`,
          severity: "success",
          actionableLink: "/goals",
        });
      } else if (g.estimatedMonthsToComplete > 0) {
        insights.push({
          id: `goal_forecast_${g.name}`,
          type: "recommendation",
          title: `Forecast: ${g.name}`,
          message: `At your current savings pace, you will reach your **${g.name}** goal in approximately **${g.estimatedMonthsToComplete} months**.`,
          severity: "info",
          actionableLink: "/goals",
        });
      }
    });

    // Weekend Expense Patterns
    if (ctx.transactionVelocity.weekendExpensePercentage > 40) {
      insights.push({
        id: "weekend_spending_pattern",
        type: "spending",
        title: "Weekend Spending Concentration",
        message: `Over **${ctx.transactionVelocity.weekendExpensePercentage}%** of your total expenses occur on weekends.`,
        severity: "info",
      });
    }

    return insights;
  }
}
