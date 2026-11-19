/**
 * Monthly income vs expenses chart using Recharts.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatMonthYear } from "@/utils/formatters";

const COLORS = { income: "#22c55e", expense: "#ef4444" };

const MonthlyChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
            labelFormatter={(label) => label}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
          />
          <Legend />
          <Bar dataKey="income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
