/**
 * Daily tracking page - RupeeFlow.
 * Shows transactions grouped by a selected date with daily income, expenses and balance change.
 */

import { useState } from "react";
import { Calendar, Wallet, Banknote, TrendingDown } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { formatDate, formatCurrency } from "@/utils/formatters";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Input from "@/components/common/Input";

const DailyTrackingPage = () => {
  const { transactions, dailyData } = useTransactions();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const dayTransactions = dailyData(
    new Date(selectedDate).getFullYear(),
    new Date(selectedDate).getMonth(),
    new Date(selectedDate).getDate()
  );

  const dailyIncome = dayTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const dailyExpense = dayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const dailyChange = dailyIncome - dailyExpense;

  const sorted = [...dayTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Daily Tracking</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            View income, expenses and balance change for any date.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily Income</p>
              <p className="text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(dailyIncome)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily Expenses</p>
              <p className="text-xl font-bold text-danger-600 dark:text-danger-400">{formatCurrency(dailyExpense)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Balance Change</p>
              <p className={`text-xl font-bold ${dailyChange >= 0 ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}>
                {dailyChange >= 0 ? "+" : ""}{formatCurrency(dailyChange)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Transactions on {formatDate(selectedDate, "dd MMMM yyyy")}
          </h2>
          {sorted.length === 0 && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">No transactions on this date</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Title</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Category</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Payment</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Amount</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Type</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((txn) => (
                  <tr key={txn.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="table-cell">{txn.title}</td>
                    <td className="table-cell">
                      <Badge variant={txn.type === "income" ? "income" : "expense"}>{txn.category}</Badge>
                    </td>
                    <td className="table-cell text-sm text-neutral-600 dark:text-neutral-400">{txn.paymentMethod}</td>
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
                    No transactions recorded for {formatDate(selectedDate, "dd MMMM yyyy")}.
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

export default DailyTrackingPage;
