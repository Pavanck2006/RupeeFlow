/**
 * Transaction context for RupeeFlow.
 * Centralizes all transaction state, CRUD operations, and derived
 * financial calculations. Uses the API service layer (mock/localStorage
 * by default, ready for Express backend integration).
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { transactionService } from "../services/api";
import { useAuth } from "./AuthContext";

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll();
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction) => {
    try {
      const created = await transactionService.create(transaction);
      setTransactions((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err.message || "Failed to add transaction");
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const updated = await transactionService.update(id, updates);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      return updated;
    } catch (err) {
      setError(err.message || "Failed to update transaction");
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionService.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete transaction");
      throw err;
    }
  };

  const clearError = () => setError(null);

  /* ------------------------------------------------------------------ */
  /* Derived calculations                                               */
  /* ------------------------------------------------------------------ */

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;
  const savings = totalIncome - totalExpense;

  const transactionsByMonth = (year, month) =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

  const monthlyIncome = (year, month) =>
    transactionsByMonth(year, month)
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const monthlyExpense = (year, month) =>
    transactionsByMonth(year, month)
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const monthlyData = (year, month) => ({
    income: monthlyIncome(year, month),
    expense: monthlyExpense(year, month),
    balance: monthlyIncome(year, month) - monthlyExpense(year, month),
  });

  const categoryWiseExpense = (year, month) => {
    const map = {};
    transactionsByMonth(year, month)
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount || 0);
      });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  };

  const categoryWiseIncome = (year, month) => {
    const map = {};
    transactionsByMonth(year, month)
      .filter((t) => t.type === "income")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount || 0);
      });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  };

  const dailyData = (year, month, day) =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const yearlyData = (year) => {
    const months = [];
    for (let m = 0; m < 12; m += 1) {
      months.push({
        month: m,
        income: monthlyIncome(year, m),
        expense: monthlyExpense(year, m),
        balance: monthlyIncome(year, m) - monthlyExpense(year, m),
      });
    }
    return months;
  };

  const value = {
    transactions,
    loading,
    error,
    clearError,
    totalIncome,
    totalExpense,
    balance,
    savings,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    monthlyData,
    categoryWiseExpense,
    categoryWiseIncome,
    dailyData,
    yearlyData,
    transactionsByMonth,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};
