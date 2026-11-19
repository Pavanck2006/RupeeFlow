
/**
 * Expense category pie chart using Recharts.
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "@/utils/formatters";

// Category colors
const CATEGORY_COLORS = {
  food: "#ef4444",
  shopping: "#ec4899",
  transport: "#06b6d4",
  rent: "#8b5cf6",
  bills: "#f59e0b",
  healthcare: "#10b981",
  education: "#3b82f6",
  entertainment: "#a855f7",
  travel: "#14b8a6",
  "other-expenses": "#64748b",
  salary: "#22c55e",
  freelance: "#3b82f6",
  business: "#8b5cf6",
  investment: "#f59e0b",
  "other-income": "#64748b",
};

const ExpensePieChart = ({ data = [] }) => {
  // Check whether data is available
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-gray-500">
        No expense data available
      </div>
    );
  }

  // Calculate total amount
  const total = data.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Prevent invalid chart values
  const chartData = data
    .map((item) => ({
      ...item,
      amount: Number(item.amount) || 0,
    }))
    .filter((item) => item.amount > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-gray-500">
        No valid expense data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  CATEGORY_COLORS[entry.category] || "#94a3b8"
                }
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={(name) => {
              const entry = chartData.find(
                (item) => item.category === name
              );

              const percentage = entry && total > 0
                ? (
                    (Number(entry.amount) / total) * 100
                  ).toFixed(1)
                : "0.0";

              return `${name} - ${percentage}%`;
            }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
