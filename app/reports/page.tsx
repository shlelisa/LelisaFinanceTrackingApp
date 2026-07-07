"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const now = new Date();
const currentMonth = months[now.getMonth()];

const categoryData = [
  { name: "Food & Drinks", value: 4500, color: "#025aa2", percentage: 30 },
  { name: "Transport", value: 2500, color: "#4a9eff", percentage: 17 },
  { name: "Shopping", value: 3500, color: "#7fc1ff", percentage: 23 },
  { name: "Bills", value: 3000, color: "#b0d8ff", percentage: 20 },
  { name: "Other", value: 1500, color: "#e0f0ff", percentage: 10 },
];

const trendData = [
  { month: "Jan", income: 8000, expenses: 5000 },
  { month: "Feb", income: 8500, expenses: 5200 },
  { month: "Mar", income: 9000, expenses: 4800 },
  { month: "Apr", income: 9500, expenses: 5300 },
  { month: "May", income: 10000, expenses: 5600 },
  { month: "Jun", income: 11000, expenses: 6000 },
  { month: "Jul", income: 12000, expenses: 5800 },
  { month: "Aug", income: 11500, expenses: 6200 },
  { month: "Sep", income: 10500, expenses: 5900 },
  { month: "Oct", income: 10000, expenses: 5500 },
  { month: "Nov", income: 9500, expenses: 5100 },
  { month: "Dec", income: 13000, expenses: 7000 },
];

const totalExpenses = categoryData.reduce((sum, c) => sum + c.value, 0);

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary">
            Financial Reports
          </h1>
          <select
            defaultValue={currentMonth}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-3">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="font-medium">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={[...categoryData].sort((a, b) => b.value - a.value)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[...categoryData]
                      .sort((a, b) => b.value - a.value)
                      .map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#025aa2"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#dc2626"
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-primary-lighter/50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-2xl">💰</span>
            <p className="text-sm text-muted-foreground">
              Where is your money going? You spent{" "}
              <strong className="text-foreground">
                ETB {totalExpenses.toLocaleString()}
              </strong>{" "}
              this month across {categoryData.length} categories.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
