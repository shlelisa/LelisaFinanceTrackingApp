"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ProtectedRoute from "@/components/ProtectedRoute";
import ExpenseChart from "@/components/ExpenseChart";
import AIInsights from "@/components/AIInsights";
import Money from "@/components/Money";
import { useDashboardSummary } from "@/hooks/useTransactions";
import type { Transaction } from "@/lib/types/transaction";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: summary, isLoading } = useDashboardSummary();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const cards = [
    {
      label: "Balance",
      value: summary?.balance ?? 0,
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      label: "Income",
      value: summary?.totalIncome ?? 0,
      color: "text-success",
      bg: "bg-success/5",
    },
    {
      label: "Expenses",
      value: summary?.totalExpenses ?? 0,
      color: "text-error",
      bg: "bg-error/5",
    },
  ];

  const recentTransactions: Transaction[] = summary?.recentTransactions ?? [];

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl space-y-8 p-6 pb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your financial overview today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.label} className={card.bg}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="h-8 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  <p className={`text-2xl font-bold tracking-tight ${card.color}`}>
                    <Money amount={card.value} />
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <AIInsights />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 w-full animate-pulse rounded bg-muted" />
              ) : (
                <ExpenseChart data={summary?.expenseBreakdown} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transactions yet.
                </p>
              ) : (
                recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} — {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === "income" ? "text-success" : "text-error"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      <Money amount={tx.amount} />
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/transactions")}
            className="flex-1 sm:flex-none"
          >
            Add Transaction
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/reports")}
            className="flex-1 sm:flex-none"
          >
            View Reports
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/budgets")}
            className="flex-1 sm:flex-none"
          >
            Manage Budgets
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
