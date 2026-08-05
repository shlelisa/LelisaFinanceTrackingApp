"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppCurrency } from "@/hooks/useAppCurrency";

const VIBRANT_COLORS = [
  "#38bdf8", // Sky Blue
  "#34d399", // Emerald
  "#fb7185", // Rose
  "#a78bfa", // Purple
  "#fbbf24", // Amber
  "#f472b6", // Pink
  "#818cf8", // Indigo
  "#2dd4bf", // Teal
];

type Props = {
  data?: { name: string; value: number }[];
};

export default function ExpenseChart({ data }: Props) {
  const { t } = useTranslation();
  const { format } = useAppCurrency();
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
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={VIBRANT_COLORS[i % VIBRANT_COLORS.length]}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [format(Number(value ?? 0)), ""]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "0.5rem",
              color: "#f8fafc",
              fontSize: "0.875rem",
            }}
            itemStyle={{ color: "#38bdf8" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-medium text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
