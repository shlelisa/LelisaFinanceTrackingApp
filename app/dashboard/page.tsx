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
import FavoritesWidget from "@/components/FavoritesWidget";
import FinancialHealthCard from "@/components/FinancialHealthCard";
import SmartStatisticsCard from "@/components/SmartStatisticsCard";
import IncomePeriodCard from "@/components/IncomePeriodCard";
import Money from "@/components/Money";
import { useDashboardSummary } from "@/hooks/useTransactions";
import type { Transaction } from "@/lib/types/transaction";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Wallet, TrendingUp, TrendingDown, ArrowRight, PlusCircle, BarChart3, Target } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: summary, isLoading } = useDashboardSummary();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("dashboard.greeting_morning")
      : hour < 18
        ? t("dashboard.greeting_afternoon")
        : t("dashboard.greeting_evening");

  const cards = [
    {
      label: t("common.balance"),
      value: summary?.balance ?? 0,
      icon: Wallet,
      color: "text-primary",
      iconBg: "bg-primary/10 text-primary",
      border: "border-primary/20",
    },
    {
      label: t("common.income"),
      value: summary?.totalIncome ?? 0,
      icon: TrendingUp,
      color: "text-success",
      iconBg: "bg-success/10 text-success",
      border: "border-success/20",
    },
    {
      label: t("common.expenses"),
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "text-error",
      iconBg: "bg-error/10 text-error",
      border: "border-error/20",
    },
  ];

  const recentTransactions: Transaction[] = summary?.recentTransactions ?? [];

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 pb-12">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => router.push("/transactions")}
            className="mt-3 sm:mt-0 shadow-sm"
          >
            <PlusCircle className="mr-1.5 size-4" />
            {t("dashboard.add_transaction")}
          </Button>
        </div>

        {/* Responsive Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className={`stat-card-hover border ${card.border} transition-all`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <div className={`flex size-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-28 animate-pulse rounded bg-muted" />
                  ) : (
                    <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.color}`}>
                      <Money amount={card.value} />
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Income Period Tracker */}
        <IncomePeriodCard />

        {/* Favorites Quick Add Shortcut */}
        <FavoritesWidget />

        {/* AI Insights & Financial Health Score & Smart Statistics */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AIInsights />
          <FinancialHealthCard />
        </div>

        <SmartStatisticsCard />

        {/* Expense Breakdown & Recent Activity */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="border shadow-xs">
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="text-base font-semibold">{t("dashboard.expense_breakdown")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="h-64 w-full animate-pulse rounded bg-muted" />
              ) : (
                <ExpenseChart data={summary?.expenseBreakdown} />
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-xs flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                <CardTitle className="text-base font-semibold">{t("dashboard.recent_transactions")}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/transactions")}
                  className="text-xs text-primary hover:text-primary/80 gap-1 px-2"
                >
                  {t("common.all")} <ArrowRight className="size-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t("dashboard.no_transactions")}
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between rounded-xl bg-muted/40 p-3 sm:px-4 transition-colors hover:bg-muted/70"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          tx.type === "income" ? "bg-success/15 text-success" : tx.type === "expense" ? "bg-error/15 text-error" : "bg-muted/15 text-muted-foreground"
                        }`}>
                          {tx.type === "income" ? <TrendingUp className="size-4" /> : tx.type === "expense" ? <TrendingDown className="size-4" /> : <ArrowRight className="size-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.category} • {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          tx.type === "income" ? "text-success" : tx.type === "expense" ? "text-error" : "text-muted-foreground"
                        }`}
                      >
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "↔"}
                        <Money amount={tx.amount} />
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/transactions")}
            className="w-full justify-center gap-2 py-5"
          >
            <PlusCircle className="size-4 text-primary" />
            {t("dashboard.add_transaction")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/reports")}
            className="w-full justify-center gap-2 py-5"
          >
            <BarChart3 className="size-4 text-primary" />
            {t("common.view_reports")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/budgets")}
            className="w-full justify-center gap-2 py-5"
          >
            <Target className="size-4 text-primary" />
            {t("common.manage_budgets")}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
