"use client";

import { useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const { data: transactions = [] } = useTransactions({
    startDate,
    endDate,
    sortBy: "date",
    sortOrder: "asc",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const dayTransactions = useMemo(() => {
    const map: Record<number, typeof transactions> = {};
    for (const tx of transactions) {
      const day = new Date(tx.date).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(tx);
    }
    return map;
  }, [transactions]);

  const dayTotals = useMemo(() => {
    const map: Record<number, { income: number; expense: number }> = {};
    for (const day in dayTransactions) {
      const d = Number(day);
      map[d] = { income: 0, expense: 0 };
      for (const tx of dayTransactions[d]) {
        if (tx.type === "income") map[d].income += tx.amount;
        else map[d].expense += tx.amount;
      }
    }
    return map;
  }, [dayTransactions]);

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold text-primary">Financial Calendar</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="size-5" />
            </Button>
            <CardTitle className="text-lg">
              {months[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="size-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="bg-background px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-background px-2 py-4" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const totals = dayTotals[day];
                const hasIncome = totals?.income > 0;
                const hasExpense = totals?.expense > 0;
                const items = dayTransactions[day] ?? [];

                return (
                  <div
                    key={day}
                    className={`min-h-[80px] bg-background px-2 py-1.5 text-xs ${
                      day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
                        ? "ring-2 ring-primary ring-inset"
                        : ""
                    }`}
                  >
                    <span className="font-medium">{day}</span>
                    {hasIncome && (
                      <p className="mt-1 text-[10px] text-green-500 truncate">
                        +{formatCurrency(totals.income)}
                      </p>
                    )}
                    {hasExpense && (
                      <p className="text-[10px] text-red-500 truncate">
                        -{formatCurrency(totals.expense)}
                      </p>
                    )}
                    {items.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {items.length} tx{items.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected day detail */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No transactions this month</p>
            ) : (
              <div className="flex flex-col gap-2">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.date).getDate()} {months[new Date(tx.date).getMonth()]}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
