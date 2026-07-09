"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCategoryBreakdown } from "@/hooks/useTransactions";
import { useMemo, useState } from "react";
import { Loader2, Download } from "lucide-react";
import Money from "@/components/Money";
import { exportCSV, exportPDF, exportExcel } from "@/lib/export";
import api from "@/lib/axios";

const COLORS = [
  "#025aa2", "#4a9eff", "#7fc1ff", "#b0d8ff", "#e0f0ff",
  "#6b7280", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
];

type ReportScope = "this-month" | "this-week" | "last-30" | "this-year" | "custom";

const scopeLabels: Record<ReportScope, string> = {
  "this-month": "This Month",
  "this-week": "This Week",
  "last-30": "Last 30 Days",
  "this-year": "This Year",
  "custom": "Custom Range",
};

export default function ReportsPage() {
  const now = new Date();
  const [scope, setScope] = useState<ReportScope>("this-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState(now.toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: categoryData, isLoading: categoriesLoading } = useCategoryBreakdown();

  const fetchCustomReport = async (startDate: string, endDate: string, groupBy: string) => {
    setLoading(true);
    try {
      const res = await api.get("/transactions/report/range", {
        params: { startDate, endDate, groupBy },
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateScope = (newScope: ReportScope) => {
    setScope(newScope);
    if (newScope === "custom") return;

    const now = new Date();
    let startDate: string, endDate: string, groupBy: string;

    switch (newScope) {
      case "this-week": {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        startDate = monday.toISOString().slice(0, 10);
        endDate = new Date().toISOString().slice(0, 10);
        groupBy = "daily";
        break;
      }
      case "last-30": {
        const thirtyAgo = new Date(now);
        thirtyAgo.setDate(thirtyAgo.getDate() - 30);
        startDate = thirtyAgo.toISOString().slice(0, 10);
        endDate = new Date().toISOString().slice(0, 10);
        groupBy = "daily";
        break;
      }
      case "this-year": {
        startDate = `${now.getFullYear()}-01-01`;
        endDate = `${now.getFullYear()}-12-31`;
        groupBy = "monthly";
        break;
      }
      case "this-month":
      default: {
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        endDate = new Date().toISOString().slice(0, 10);
        groupBy = "daily";
        break;
      }
    }

    fetchCustomReport(startDate, endDate, groupBy);
  };

  const handleCustomSearch = () => {
    if (!customStart || !customEnd) return;
    const diffDays = (new Date(customEnd).getTime() - new Date(customStart).getTime()) / (1000 * 60 * 60 * 24);
    const groupBy = diffDays > 90 ? "monthly" : "daily";
    fetchCustomReport(customStart, customEnd, groupBy);
  };

  const getCsvData = () =>
    reportData?.report?.map((r: any) => ({ Period: r.label, Income: r.income, Expense: r.expense })) ?? [];

  const handleExportCSV = () => {
    exportCSV(getCsvData(), `report-${scope}`);
  };

  const handleExportPDF = () => {
    const data = getCsvData();
    if (!data.length) return;
    exportPDF(
      `Financial Report - ${scopeLabels[scope]}`,
      ["Period", "Income", "Expense"],
      data.map((r: any) => [r.Period, String(r.Income), String(r.Expense)]),
      `report-${scope}`,
    );
  };

  const handleExportExcel = () => {
    const data = getCsvData();
    if (!data.length) return;
    exportExcel(data, `report-${scope}`);
  };

  const trendData = useMemo(() => reportData?.report ?? [], [reportData]);
  const categoryBreakdown = useMemo(() => {
    const data = reportData?.categoryBreakdown ?? categoryData ?? [];
    if (!data || data.length === 0) return [];
    return data.map((c: any) => ({
      name: c.name,
      value: c.value,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, [reportData, categoryData]);

  const totalExpenses = categoryBreakdown.reduce((sum: number, c: any) => sum + c.value, 0);
  const totalIncome = reportData?.summary?.totalIncome ?? 0;

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary">
            Financial Reports
          </h1>
          <div className="flex items-center gap-2">
            {reportData && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-1 size-4" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="mr-1 size-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <Download className="mr-1 size-4" /> Excel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scope selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(scopeLabels) as [ReportScope, string][]).map(([key, label]) => (
            <Button
              key={key}
              variant={scope === key ? "default" : "outline"}
              size="sm"
              onClick={() => updateScope(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Custom date picker */}
        {scope === "custom" && (
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Start</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">End</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button size="sm" onClick={handleCustomSearch}>Generate</Button>
          </div>
        )}

        {!reportData && scope !== "custom" && !loading && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Select a report scope above to generate data
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : trendData.length > 0 && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Income</p>
                  <p className="text-2xl font-bold text-green-500">
                    <Money amount={totalIncome} />
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold text-red-500">
                    <Money amount={totalExpenses} />
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Savings</p>
                  <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-500" : "text-red-500"}`}>
                    <Money amount={totalIncome - totalExpenses} />
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryBreakdown.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No expense data</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryBreakdown.map((entry: any) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {categoryBreakdown.map((c: any) => {
                          const pct = totalExpenses > 0 ? Math.round((c.value / totalExpenses) * 100) : 0;
                          return (
                            <div key={c.name} className="flex items-center gap-2 text-sm">
                              <span className="size-3 rounded-sm" style={{ backgroundColor: c.color }} />
                              <span className="text-muted-foreground">{c.name}</span>
                              <span className="font-medium">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryBreakdown.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No data</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={[...categoryBreakdown].sort((a: any, b: any) => b.value - a.value)}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {[...categoryBreakdown]
                            .sort((a: any, b: any) => b.value - a.value)
                            .map((entry: any) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trend ({scopeLabels[scope]})</CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="income" stroke="#025aa2" strokeWidth={2} name="Income" />
                      <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} name="Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
