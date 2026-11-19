/**
 * Yearly reports page - RupeeFlow.
 * Select a year to view Jan-Dec breakdown, annual totals and category spending.
 * Old records are never deleted when a new year starts.
 */

import { useState } from "react";
import { Calendar, BarChart3, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { formatCurrency, formatMonthYear } from "@/utils/formatters";
import Card from "@/components/common/Card";
import StatCard from "@/components/dashboard/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const YearlyReportsPage = () => {
  const { yearlyData, transactions } = useTransactions();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const data = yearlyData(selectedYear);
  const annualIncome = data.reduce((sum, m) => sum + m.income, 0);
  const annualExpense = data.reduce((sum, m) => sum + m.expense, 0);
  const annualSavings = annualIncome - annualExpense;

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y += 1) years.push(y);

  // Category-wise yearly expenses
  const expenseMap = {};
  transactions
    .filter((t) => t.type === "expense" && new Date(t.date).getFullYear() === selectedYear)
    .forEach((t) => {
      expenseMap[t.category] = (expenseMap[t.category] || 0) + Number(t.amount || 0);
    });
  const categoryExpense = Object.entries(expenseMap).map(([category, amount]) => ({ category, amount }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Yearly Reports</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          View your full year financial breakdown from January to December.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input w-40"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {selectedYear} Annual Report
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Annual Income" value={annualIncome} subtitle="January - December" icon={Wallet} />
        <StatCard title="Annual Expenses" value={annualExpense} subtitle="January - December" icon={Wallet} />
        <StatCard title="Annual Balance" value={annualSavings} subtitle="Income - Expenses" icon={Wallet} />
        <StatCard title="Annual Savings" value={annualSavings} subtitle="Income - Expenses" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Month-by-Month Breakdown</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} formatter={(value) => MONTH_NAMES[value]} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {data.map((m) => (
                <div key={m.month} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{MONTH_NAMES[m.month]}</div>
                  <div className="text-xs font-medium text-neutral-900 dark:text-white">
                    Net {formatCurrency(m.balance)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Category-wise Expenses</h2>
            {categoryExpense.length > 0 ? (
              <div className="space-y-3">
                {categoryExpense
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((c) => (
                    <div key={c.category} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{c.category}</span>
                      <span className="text-sm font-medium text-danger-600 dark:text-danger-400">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No expenses recorded this year.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Year Comparison</h2>
            <div className="space-y-3">
              {years
                .filter((y) => y !== selectedYear)
                .slice(0, 3)
                .map((y) => {
                  const other = yearlyData(y);
                  const oi = other.reduce((sum, m) => sum + m.income, 0);
                  const oe = other.reduce((sum, m) => sum + m.expense, 0);
                  return (
                    <div key={y} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{y}</span>
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">
                        Net {formatCurrency(oi - oe)}
                      </span>
                    </div>
                  );
                })}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
              Records from previous years are preserved and never deleted.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default YearlyReportsPage;
