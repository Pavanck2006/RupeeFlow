/**
 * Utility functions for RupeeFlow frontend.
 * Frontend-only utilities used until the backend is integrated.
 */

import { format, parseISO, isSameMonth, isSameYear, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { CURRENCY } from "../data/categories";

/**
 * Format an amount as Indian Rupee currency.
 * Example: 125000 -> ₹1,25,000.00
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a plain number with Indian grouping (no currency symbol).
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat(CURRENCY.locale).format(num);
};

/**
 * Format a date string (YYYY-MM-DD) to a readable format.
 */
export const formatDate = (dateString, formatStr = "dd MMM yyyy") => {
  return format(parseISO(dateString), formatStr);
};

/**
 * Format a date string to short month-year (e.g. Sep 2024).
 */
export const formatMonthYear = (dateString) => {
  return format(parseISO(dateString), "MMM yyyy");
};

/**
 * Get the first day of the month as YYYY-MM-DD.
 */
export const getMonthStart = (date) => {
  return format(startOfMonth(date), "yyyy-MM-dd");
};

/**
 * Get the last day of the month as YYYY-MM-DD.
 */
export const getMonthEnd = (date) => {
  return format(endOfMonth(date), "yyyy-MM-dd");
};

/**
 * Check if a transaction date falls within the given month/year.
 */
export const isTransactionInMonth = (dateString, year, month) => {
  const d = parseISO(dateString);
  return d.getMonth() === month && d.getFullYear() === year;
};

/**
 * Get category color by category id.
 */
export const getCategoryColor = (categoryId) => {
  const incomeColors = {
    salary: "#22c55e",
    freelance: "#3b82f6",
    business: "#8b5cf6",
    investment: "#f59e0b",
    "other-income": "#64748b",
  };
  const expenseColors = {
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
  };
  return incomeColors[categoryId] || expenseColors[categoryId] || "#94a3b8";
};

/**
 * Get category icon name by category id.
 */
export const getCategoryIcon = (categoryId) => {
  const incomeIcons = {
    salary: "Wallet",
    freelance: "Briefcase",
    business: "Building2",
    investment: "TrendingUp",
    "other-income": "PlusCircle",
  };
  const expenseIcons = {
    food: "Utensils",
    shopping: "ShoppingBag",
    transport: "Car",
    rent: "Home",
    bills: "FileText",
    healthcare: "HeartPulse",
    education: "GraduationCap",
    entertainment: "Film",
    travel: "Plane",
    "other-expenses": "MoreHorizontal",
  };
  return incomeIcons[categoryId] || expenseIcons[categoryId] || "Tag";
};

/**
 * Capitalize first letter.
 */
export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert type label to readable title.
 */
export const typeLabel = (type) => {
  return type === "income" ? "Income" : "Expense";
};
