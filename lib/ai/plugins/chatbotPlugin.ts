import type { AIPlugin, AIInsightItem } from "../aiEngine";
import { getFullAIContext, type FinancialAIContext } from "../aiContextProviders";
import { getStoredDebts, getStoredBills, getStoredCategories, getStoredTransactions } from "../../storage/localStorage";
import { getSpendForCategory, monthRange } from "../../storage/financeLogic";
import { formatCurrencyExact } from "../../currency";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export class ChatbotPlugin implements AIPlugin {
  id = "chatbot-plugin";
  name = "Dynamic Financial AI Reasoning Engine";
  version = "2.0.0";
  capabilities: ("insights" | "forecast" | "categorization" | "chat")[] = ["chat"];

  async analyze(ctx: FinancialAIContext): Promise<AIInsightItem[]> {
    return [];
  }

  public async askQuestion(question: string, context?: FinancialAIContext): Promise<string> {
    const ctx = context || getFullAIContext();
    const fmt = (amount: number, currency?: string) =>
      formatCurrencyExact(amount, currency || ctx.currency);
    const q = question.toLowerCase().trim();

    // 0. User Profile & Phone Number Query
    if (q.includes("phone") || q.includes("contact") || q.includes("profile") || q.includes("number") || q.includes("who am i")) {
      const p = ctx.userProfile;
      return `👤 **Your Registered Profile Info:**\n• **Full Name:** ${p.fullName}\n• **Email:** ${p.email}\n• **Phone Number:** ${p.phone || "Not set (Add it in Profile & Settings)"}\n• **Account Role:** ${p.role.toUpperCase()}`;
    }

    // 1. Dynamic Debt & Loans Query
    if (q.includes("debt") || q.includes("loan") || q.includes("owe") || q.includes("lent") || q.includes("borrow")) {
      const debts = getStoredDebts();
      if (debts.length === 0) {
        return "You currently have no active debt or loan records.";
      }

      const lentList = debts.filter((d) => d.type === "lent" && d.remainingBalance > 0);
      const borrowedList = debts.filter((d) => d.type === "borrowed" && d.remainingBalance > 0);

      let msg = "💳 **Live Debt & Loans Summary:**\n\n";

      if (lentList.length > 0) {
        const totalLent = lentList.reduce((s, d) => s + d.remainingBalance, 0);
        msg += `💰 **Money Lent To Others (${fmt(totalLent)}):**\n`;
        lentList.forEach((d) => {
          msg += `• **${d.person}**: ${fmt(d.remainingBalance, d.currency)} (Due: ${d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "No date"})\n`;
        });
        msg += "\n";
      }

      if (borrowedList.length > 0) {
        const totalBorrowed = borrowedList.reduce((s, d) => s + d.remainingBalance, 0);
        msg += `⚠️ **Money You Borrowed (${fmt(totalBorrowed)}):**\n`;
        borrowedList.forEach((d) => {
          msg += `• **${d.person}**: ${fmt(d.remainingBalance, d.currency)} (Due: ${d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "No date"})\n`;
        });
      }

      return msg;
    }

    // 2. Dynamic Bills & Subscriptions Query
    if (q.includes("bill") || q.includes("subscription") || q.includes("due") || q.includes("utility") || q.includes("unpaid")) {
      const bills = getStoredBills();
      if (bills.length === 0) {
        return "You have no recurring bills or subscriptions configured.";
      }

      const unpaid = bills.filter((b) => b.status === "unpaid");
      if (unpaid.length === 0) {
        return "🎉 Great news! All your recurring bills for this cycle are marked as **Paid**.";
      }

      const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);
      let msg = `📅 **Upcoming & Unpaid Bills (${fmt(totalUnpaid)}):**\n\n`;
      unpaid.forEach((b) => {
        msg += `• **${b.name}** (${b.category}): ${fmt(b.amount, b.currency)} — Due: ${b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "Pending"}\n`;
      });
      return msg;
    }

    // 3. Dynamic Category / Merchant Lookup
    const allCategories = getStoredCategories().map((c) => c.name.toLowerCase());
    const matchedCategory = allCategories.find((catName) => catName && q.includes(catName));

    if (matchedCategory) {
      const spentThisMonth = getSpendForCategory(
        getStoredTransactions(),
        matchedCategory,
        monthRange(0),
      );
      return `📊 Dynamic Lookup for **${matchedCategory.toUpperCase()}**:\nYou have spent **${fmt(spentThisMonth)}** in this category this month.`;
    }

    // Dynamic Merchant Lookup
    const transactions = getStoredTransactions();
    const words = q.split(" ").filter((w) => w.length > 3 && !["much", "spent", "where", "what", "show", "tell", "about"].includes(w));

    for (const word of words) {
      const matches = transactions.filter((t) => t.type === "expense" && t.description.toLowerCase().includes(word));
      if (matches.length > 0) {
        const total = matches.reduce((s, t) => s + t.amount, 0);
        return `🔍 Found **${matches.length}** expense${matches.length === 1 ? "" : "s"} matching "${word}":\nTotal spent: **${fmt(total)}** across matching items.`;
      }
    }

    // 4. Dynamic Saving Suggestions & Financial Coaching
    if (
      q.includes("suggest") ||
      q.includes("advice") ||
      q.includes("recommend") ||
      q.includes("tip") ||
      q.includes("how to save") ||
      q.includes("what should i do")
    ) {
      const savingsRate = ctx.transactionVelocity.savingsRatePercentage;
      const totalIncome = ctx.transactionVelocity.totalIncome;
      const totalExpenses = ctx.transactionVelocity.totalExpenses;
      const netSavings = ctx.transactionVelocity.netSavings;
      const topExpenseCategories = Object.entries(ctx.transactionVelocity.expenseCategoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const topCatStr = topExpenseCategories.map(([cat, amt]) => `• **${cat}**: ${fmt(amt)}`).join("\n");

      let adviceMsg = `🤖 **Dynamic AI Financial Advisor Response:**\n\n`;

      adviceMsg += `📊 **Real-Time Portfolio Analysis:**\n`;
      adviceMsg += `• **Monthly Cash Flow:** ${fmt(totalIncome)} (In) vs ${fmt(totalExpenses)} (Out)\n`;
      adviceMsg += `• **Net Monthly Surplus:** ${fmt(netSavings)} (${savingsRate}% rate)\n\n`;

      adviceMsg += `🔍 **Primary Expenditure Focus Areas:**\n${topCatStr || "• No major expense categories recorded."}\n\n`;

      adviceMsg += `💡 **Tailored AI Optimization Strategy:**\n`;
      if (savingsRate < 20) {
        adviceMsg += `1. **Target 20% Net Savings:** Increase monthly surplus to at least **${fmt(totalIncome * 0.2)}**.\n`;
      } else {
        adviceMsg += `1. **High Savings Rate Maintained:** You are saving **${savingsRate}%** of your total monthly cash flow.\n`;
      }

      if (topExpenseCategories.length > 0) {
        const topCat = topExpenseCategories[0];
        adviceMsg += `2. **Optimize ${topCat[0]}:** Trimming **${topCat[0]}** by 15% recovers **${fmt(topCat[1] * 0.15)}** per month.\n`;
      }

      adviceMsg += `3. **Enforce Budget Guardrails:** Put hard monthly limits on your highest velocity categories in **Budgets**.\n`;
      adviceMsg += `4. **Goal Acceleration:** Redirect surpluses to your active goals in **Savings Goals**.`;

      return adviceMsg;
    }

    // 5. Dynamic Budget Check
    if (q.includes("budget") || q.includes("limit") || q.includes("over")) {
      const exceeded = ctx.budgetRisk.budgets.filter((b) => b.riskLevel === "exceeded");
      if (exceeded.length > 0) {
        const categories = exceeded.map((b) => `• **${b.category}**: ${fmt(b.spent)} spent / ${fmt(b.limit)} limit`).join("\n");
        return `⚠️ **Dynamic Alert: Exceeded Budgets Detected!**\n\n${categories}\n\nOverall budget adherence: **${ctx.budgetRisk.overallAdherenceRate}%**.`;
      }
      return `✅ All active budgets are currently **within healthy limits**. Overall adherence rate: **${ctx.budgetRisk.overallAdherenceRate}%**.`;
    }

    // 6. Dynamic Account Balances
    if (q.includes("account") || q.includes("bank") || q.includes("cash") || q.includes("balance") || q.includes("net worth")) {
      const list = ctx.liquidity.accountsSummary
        .map((a) => `• **${a.name}** (${a.type}): ${fmt(a.balance, a.currency)}`)
        .join("\n");
      return `🏦 **Dynamic Accounts & Liquidity Overview:**\nTotal Net Worth: **${fmt(ctx.liquidity.totalLiquidity)}**\n\n${list}`;
    }

    // 7. Dynamic Greetings
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("who are you")) {
      return `Hello! 👋 I am your Dynamic Financial AI Assistant. I analyze your live transactions, debts, bills, categories, and accounts to answer your questions in real time. Try asking me about debts, bills, spending on any category, or savings advice!`;
    }

    // Dynamic Fallback with Live Metrics
    return `🔍 **Dynamic Financial Summary:**\n• Total Liquidity: **${fmt(ctx.liquidity.totalLiquidity)}**\n• Total Income: **${fmt(ctx.transactionVelocity.totalIncome)}**\n• Total Expenses: **${fmt(ctx.transactionVelocity.totalExpenses)}**\n• Savings Rate: **${ctx.transactionVelocity.savingsRatePercentage}%**\n\nTry asking me: *"Who owes me money?"*, *"What bills are due?"*, *"How much did I spend on [Category/Merchant]?"*, or *"What do you suggest on saving?"*.`;
  }
}
