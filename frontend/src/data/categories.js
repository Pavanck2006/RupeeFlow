/**
 * Default categories for RupeeFlow.
 * These are frontend mock data used until the backend is integrated.
 */

export const INCOME_CATEGORIES = [
  { id: "salary", name: "Salary", color: "#22c55e", icon: "Wallet" },
  { id: "freelance", name: "Freelance", color: "#3b82f6", icon: "Briefcase" },
  { id: "business", name: "Business", color: "#8b5cf6", icon: "Building2" },
  { id: "investment", name: "Investment", color: "#f59e0b", icon: "TrendingUp" },
  { id: "other-income", name: "Other Income", color: "#64748b", icon: "PlusCircle" },
];

export const EXPENSE_CATEGORIES = [
  { id: "food", name: "Food", color: "#ef4444", icon: "Utensils" },
  { id: "shopping", name: "Shopping", color: "#ec4899", icon: "ShoppingBag" },
  { id: "transport", name: "Transport", color: "#06b6d4", icon: "Car" },
  { id: "rent", name: "Rent", color: "#8b5cf6", icon: "Home" },
  { id: "bills", name: "Bills", color: "#f59e0b", icon: "FileText" },
  { id: "healthcare", name: "Healthcare", color: "#10b981", icon: "HeartPulse" },
  { id: "education", name: "Education", color: "#3b82f6", icon: "GraduationCap" },
  { id: "entertainment", name: "Entertainment", color: "#a855f7", icon: "Film" },
  { id: "travel", name: "Travel", color: "#14b8a6", icon: "Plane" },
  { id: "other-expenses", name: "Other Expenses", color: "#64748b", icon: "MoreHorizontal" },
];

export const PAYMENT_METHODS = [
  { id: "cash", name: "Cash" },
  { id: "upi", name: "UPI" },
  { id: "debit-card", name: "Debit Card" },
  { id: "credit-card", name: "Credit Card" },
  { id: "bank-transfer", name: "Bank Transfer" },
  { id: "wallet", name: "Digital Wallet" },
];

export const CURRENCY = {
  code: "INR",
  symbol: "₹",
  locale: "en-IN",
};

export default {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  CURRENCY,
};
