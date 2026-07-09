"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

const COLORS = [
  "#025aa2",
  "#4a9eff",
  "#7fc1ff",
  "#b0d8ff",
  "#e0f0ff",
  "#6b7280",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

type Props = {
  data?: { name: string; value: number }[];
};

export default function ExpenseChart({ data }: Props) {
  const { t } = useTranslation();
  const chartData = data && data.length > 0 ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        {t("charts.no_expense_data")}
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
