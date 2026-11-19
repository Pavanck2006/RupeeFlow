/**
 * Monthly reports page - RupeeFlow.
 * Select a month/year to view income, expenses, savings, category spending and month comparison.
 */

import { useState } from "react";
import { Calendar, BarChart3, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { formatCurrency, formatMonthYear } from "@/utils/formatters";
import Card from "@/components/common/Card";
import StatCard from "@/components/dashboard/StatCard";
import MonthlyChart from "@/components/charts/MonthlyChart";
import ExpensePieChart from "@/components/charts/ExpensePieChart";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MonthlyReportsPage = () => {
  const {
    monthlyData,
    categoryWiseExpense,
    categoryWiseIncome,
    transactions,
  } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const md = monthlyData(selectedYear, selectedMonth);
  const expenseCategories = categoryWiseExpense(selectedYear, selectedMonth);
  const incomeCategories = categoryWiseIncome(selectedYear, selectedMonth);
  const savings = md.income - md.expense;

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y += 1) years.push(y);

  const displayDateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;

  // Comparison with previous month
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prev = monthlyData(prevYear, prevMonth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Monthly Reports</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Analyze your spending and income for a selected month.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input w-48"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input w-32"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {formatMonthYear(displayDateString)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={md.income} subtitle="This month" icon={Wallet} />
        <StatCard title="Total Expenses" value={md.expense} subtitle="This month" icon={Wallet} />
        <StatCard title="Balance" value={md.balance} subtitle="Income - Expenses" icon={Wallet} />
        <StatCard title="Savings" value={savings} subtitle="Income - Expenses" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Monthly Spending</h2>
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <span className="w-3 h-3 rounded-full bg-success-600 dark:bg-success-400" />
              <span>Income</span>
              <span className="mx-2">|</span>
              <span className="w-3 h-3 rounded-full bg-danger-600 dark:bg-danger-400" />
              <span>Expenses</span>
            </div>
            <MonthlyChart data={[
              { month: MONTH_NAMES[selectedMonth], income: md.income, expense: md.expense },
            ]} />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">vs Previous Month</div>
                <div className={`font-medium ${md.income >= prev.income ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}>
                  {md.income >= prev.income ? "+" : ""}{((md.income - prev.income) / (prev.income || 1) * 100).toFixed(1)}% income
                </div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">vs Previous Month</div>
                <div className={`font-medium ${md.expense <= prev.expense ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}>
                  {md.expense <= prev.expense ? "-" : ""}{Math.abs(((md.expense - prev.expense) / (prev.expense || 1) * 100).toFixed(1))}% expenses
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Category Spending</h2>
            <ExpensePieChart data={expenseCategories} />
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Category Income</h2>
            {incomeCategories.length > 0 ? (
              <div className="space-y-3">
                {incomeCategories.map((c) => (
                  <div key={c.category} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.category === "salary" ? "#22c55e" : "#3b82f6" }} />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{c.category}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No income recorded this month.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportsPage;
