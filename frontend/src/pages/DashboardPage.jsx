/**
 * Dashboard page - RupeeFlow.
 * Shows key financial metrics, charts, recent transactions and quick actions.
 */

import { useState, useEffect } from "react";
import { ArrowRight, Plus, Wallet, TrendingUp, TrendingDown, Banknote } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTransactions } from "@/context/TransactionContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import StatCard from "@/components/dashboard/StatCard";
import MonthlyChart from "@/components/charts/MonthlyChart";
import ExpensePieChart from "@/components/charts/ExpensePieChart";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DashboardPage = () => {
  const {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    savings,
    monthlyData,
    categoryWiseExpense,
  } = useTransactions();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth();

  // Last 6 months data for chart
  const lastSixMonths = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const md = monthlyData(currentYear, d.getMonth());
    lastSixMonths.push({
      month: MONTH_NAMES[d.getMonth()],
      income: md.income,
      expense: md.expense,
    });
  }

  const currentMonthData = monthlyData(currentYear, currentMonth);
  const categoryData = categoryWiseExpense(currentYear, currentMonth);

  // Savings progress percentage (cap at 100)
  const savingsProgress = totalIncome > 0 ? Math.min((savings / totalIncome) * 100, 100) : 0;

  const recentTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  ).slice(0, 5);

  const navigateToTransactions = () => {
    navigate("/transactions");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Here is an overview of your finances for {MONTH_NAMES[currentMonth]} {currentYear}.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={balance}
          subtitle={balance >= 0 ? "Available balance" : "Amount overdrawn"}
          icon={Wallet}
        />
        <StatCard
          title="Total Income"
          value={totalIncome}
          subtitle="This month"
          icon={Banknote}
        />
        <StatCard
          title="Total Expenses"
          value={totalExpense}
          subtitle="This month"
          icon={Banknote}
        />
        <StatCard
          title="Total Savings"
          value={savings}
          subtitle="Income - Expenses"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Income vs Expenses</h2>
            </div>
            <MonthlyChart data={lastSixMonths} />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Expense by Category</h2>
              <Link to="/reports/monthly" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <ExpensePieChart data={categoryData} />
          </Card>
        </div>

        {/* Right: savings + quick actions */}
        <div className="space-y-6">
          <Card className="h-fit">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Savings Progress</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatCurrency(savings)} saved out of {formatCurrency(totalIncome)} income
              </p>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5 dark:bg-neutral-800">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${savings >= 0 ? "bg-success-600" : "bg-danger-600"}`}
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">₹0</span>
              <span className="text-neutral-500 dark:text-neutral-400">{formatCurrency(totalIncome)}</span>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={navigateToTransactions}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-200 bg-white text-left hover:bg-brand-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-brand-900/20 transition-colors"
              >
                <Plus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Add Income</span>
              </button>
              <button
                onClick={navigateToTransactions}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-200 bg-white text-left hover:bg-red-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-red-900/20 transition-colors"
              >
                <Plus className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Add Expense</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Title</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Category</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Date</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Amount</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Type</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="table-cell">{txn.title}</td>
                    <td className="table-cell">
                      <Badge variant={txn.type === "income" ? "income" : "expense"}>{txn.category}</Badge>
                    </td>
                    <td className="table-cell">{formatDate(txn.date)}</td>
                    <td className={`table-cell font-medium ${txn.type === "income" ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}>
                      {txn.type === "income" ? "+" : "-"} {formatCurrency(txn.amount)}
                    </td>
                    <td className="table-cell">
                      <Badge variant={txn.type}>{txn.type === "income" ? "Income" : "Expense"}</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="table-cell text-center py-8 text-neutral-500 dark:text-neutral-400">
                    No transactions yet. Add your first transaction to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
