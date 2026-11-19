/**
 * API service layer for RupeeFlow.
 *
 * Connects to the Express backend API. When VITE_MOCK_MODE is true,
 * falls back to localStorage mock data for offline development.
 *
 * Backend response format: { success: true, data: ... }
 * This layer unwraps it so components receive just the data payload.
 */

import axios from "axios";
import MOCK_TRANSACTIONS from "../data/mockTransactions";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, CURRENCY } from "../data/categories";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "false" ? false : import.meta.env.VITE_MOCK_MODE === "true";

// Default to real API when env not explicitly set to true
const USE_MOCK = MOCK_MODE === true;

const STORAGE_KEYS = {
  transactions: "rupeeflow_transactions",
  categories: "rupeeflow_categories",
  budgets: "rupeeflow_budgets",
  settings: "rupeeflow_settings",
  token: "rupeeflow_token",
  user: "rupeeflow_user",
};

/* ------------------------------------------------------------------ */
/* Axios instance                                                     */
/* ------------------------------------------------------------------ */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = getStorage(STORAGE_KEYS.token, null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap backend { success, data } and handle 401
api.interceptors.response.use(
  (response) => {
    // Backend wraps as { success: true, data: ... }
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired. Please log in again."));
    }
    const responseError = error.response?.data?.error;
    if (responseError) {
      error.message = responseError;
    }
    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------ */
/* LocalStorage helpers                                               */
/* ------------------------------------------------------------------ */

const getStorage = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
};

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export const authService = {
  register: async (userData) => {
    if (USE_MOCK) {
      // Mock: store user in localStorage
      const user = { ...userData, id: "user_" + Math.random().toString(36).substr(2, 9) };
      setStorage(STORAGE_KEYS.user, user);
      setStorage(STORAGE_KEYS.token, "mock_token_" + user.id);
      return { user, token: "mock_token_" + user.id };
    }
    const result = await api.post("/auth/register", userData);
    setStorage(STORAGE_KEYS.token, result.token);
    setStorage(STORAGE_KEYS.user, result.user);
    return result;
  },

  login: async (credentials) => {
    if (USE_MOCK) {
      const user = { id: "user_mock", name: "Demo User", email: credentials.email, currency: "INR", theme: "light", dateFormat: "dd MMM yyyy" };
      setStorage(STORAGE_KEYS.user, user);
      setStorage(STORAGE_KEYS.token, "mock_token_user_mock");
      return { user, token: "mock_token_user_mock" };
    }
    const result = await api.post("/auth/login", credentials);
    setStorage(STORAGE_KEYS.token, result.token);
    setStorage(STORAGE_KEYS.user, result.user);
    return result;
  },

  logout: async () => {
    if (!USE_MOCK) {
      try {
        await api.post("/auth/logout");
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  getMe: async () => {
    if (USE_MOCK) return getStorage(STORAGE_KEYS.user, null);
    const { data } = await api.get("/auth/me");
    return data;
  },

  updateDetails: async (details) => {
    if (USE_MOCK) {
      const user = getStorage(STORAGE_KEYS.user, {});
      const updated = { ...user, ...details };
      setStorage(STORAGE_KEYS.user, updated);
      return updated;
    }
    const { data } = await api.put("/auth/updatedetails", details);
    setStorage(STORAGE_KEYS.user, data.user);
    return data;
  },

  updatePassword: async (passwords) => {
    if (USE_MOCK) return { success: true };
    const { data } = await api.put("/auth/updatepassword", passwords);
    return data;
  },

  getToken: () => getStorage(STORAGE_KEYS.token, null),
  getUser: () => getStorage(STORAGE_KEYS.user, null),
  isAuthenticated: () => !!getStorage(STORAGE_KEYS.token, null),
};

/* ------------------------------------------------------------------ */
/* Transactions                                                       */
/* ------------------------------------------------------------------ */

export const transactionService = {
  getAll: async () => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.transactions, null);
      return stored ? [...stored] : [...MOCK_TRANSACTIONS];
    }
    return api.get("/transactions");
  },

  create: async (transaction) => {
    if (USE_MOCK) {
      const newTransaction = {
        ...transaction,
        id: "txn_" + Math.random().toString(36).substr(2, 12),
        createdAt: new Date().toISOString(),
      };
      const stored = getStorage(STORAGE_KEYS.transactions, [...MOCK_TRANSACTIONS]);
      const updated = [newTransaction, ...stored];
      setStorage(STORAGE_KEYS.transactions, updated);
      return newTransaction;
    }
    return api.post("/transactions", transaction);
  },

  update: async (id, updates) => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.transactions, [...MOCK_TRANSACTIONS]);
      const index = stored.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Transaction not found");
      stored[index] = { ...stored[index], ...updates };
      setStorage(STORAGE_KEYS.transactions, stored);
      return stored[index];
    }
    return api.put(`/transactions/${id}`, updates);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.transactions, [...MOCK_TRANSACTIONS]);
      const filtered = stored.filter((t) => t.id !== id);
      setStorage(STORAGE_KEYS.transactions, filtered);
      return { id };
    }
    await api.delete(`/transactions/${id}`);
    return { id };
  },
};

/* ------------------------------------------------------------------ */
/* Categories                                                         */
/* ------------------------------------------------------------------ */

export const categoryService = {
  getAll: async () => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.categories, null);
      return stored
        ? stored
        : {
            income: INCOME_CATEGORIES,
            expense: EXPENSE_CATEGORIES,
          };
    }
    return api.get("/categories");
  },

  create: async (category) => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.categories, {
        income: INCOME_CATEGORIES,
        expense: EXPENSE_CATEGORIES,
      });
      const list = category.type === "income" ? stored.income : stored.expense;
      const newCategory = { ...category, id: "cat_" + Math.random().toString(36).substr(2, 9) };
      list.push(newCategory);
      setStorage(STORAGE_KEYS.categories, stored);
      return newCategory;
    }
    return api.post("/categories", category);
  },
};

/* ------------------------------------------------------------------ */
/* Payment methods                                                    */
/* ------------------------------------------------------------------ */

export const paymentMethodService = {
  getAll: async () => {
    if (USE_MOCK) return PAYMENT_METHODS;
    return api.get("/payment-methods");
  },
};

/* ------------------------------------------------------------------ */
/* Budgets                                                            */
/* ------------------------------------------------------------------ */

export const budgetService = {
  getAll: async () => {
    if (USE_MOCK) return getStorage(STORAGE_KEYS.budgets, []);
    return api.get("/budgets");
  },

  create: async (budget) => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.budgets, []);
      const newBudget = { ...budget, id: "budget_" + Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
      const updated = [...stored, newBudget];
      setStorage(STORAGE_KEYS.budgets, updated);
      return newBudget;
    }
    return api.post("/budgets", budget);
  },

  update: async (id, updates) => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.budgets, []);
      const index = stored.findIndex((b) => b.id === id);
      if (index === -1) throw new Error("Budget not found");
      stored[index] = { ...stored[index], ...updates };
      setStorage(STORAGE_KEYS.budgets, stored);
      return stored[index];
    }
    return api.put(`/budgets/${id}`, updates);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      const stored = getStorage(STORAGE_KEYS.budgets, []);
      const filtered = stored.filter((b) => b.id !== id);
      setStorage(STORAGE_KEYS.budgets, filtered);
      return { id };
    }
    await api.delete(`/budgets/${id}`);
    return { id };
  },
};

/* ------------------------------------------------------------------ */
/* Settings                                                           */
/* ------------------------------------------------------------------ */

export const settingsService = {
  get: async () => {
    if (USE_MOCK) {
      return getStorage(STORAGE_KEYS.settings, {
        currency: CURRENCY,
        theme: "light",
        dateFormat: "dd MMM yyyy",
        exportEnabled: true,
      });
    }
    return api.get("/users/me");
  },

  update: async (settings) => {
    if (USE_MOCK) {
      setStorage(STORAGE_KEYS.settings, settings);
      return settings;
    }
    return api.put("/users/settings", settings);
  },

  export: async () => {
    if (!USE_MOCK) {
      const response = await api.get("/users/export", {
        responseType: "blob",
      });
      return response;
    }
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Reports                                                            */
/* ------------------------------------------------------------------ */

export const reportService = {
  getDaily: async (date) => {
    if (USE_MOCK) return null;
    return api.get("/reports/daily", { params: { date } });
  },

  getMonthly: async (year, month) => {
    if (USE_MOCK) return null;
    return api.get("/reports/monthly", { params: { year, month } });
  },

  getYearly: async (year) => {
    if (USE_MOCK) return null;
    return api.get("/reports/yearly", { params: { year } });
  },
};
