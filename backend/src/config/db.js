/**
 * In-memory database for development (no MongoDB required).
 * Data persists only while the server is running.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── In-memory collections ───────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "..", "..", "data");
const dataFile = path.join(dataDirectory, "rupeeflow.json");

const emptyCollections = {
  users: [],
  transactions: [],
  budgets: [],
  categories: [],
};

const loadCollections = () => {
  try {
    if (!fs.existsSync(dataFile)) return emptyCollections;
    const stored = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return {
      users: Array.isArray(stored.users) ? stored.users : [],
      transactions: Array.isArray(stored.transactions) ? stored.transactions : [],
      budgets: Array.isArray(stored.budgets) ? stored.budgets : [],
      categories: Array.isArray(stored.categories) ? stored.categories : [],
    };
  } catch (error) {
    console.error("Failed to load local database:", error.message);
    return emptyCollections;
  }
};

const collections = loadCollections();

// ── Chainable query wrapper (mimics Mongoose query builder) ─────────────
const chainable = (items) => {
  let result = [...items];
  const q = {
    sort(spec) {
      if (typeof spec === "string") {
        const desc = spec.startsWith("-");
        const field = desc ? spec.slice(1) : spec;
        result.sort((a, b) => {
          let av = a[field], bv = b[field];
          if (av instanceof Date) av = av.getTime();
          if (bv instanceof Date) bv = bv.getTime();
          if (av < bv) return desc ? 1 : -1;
          if (av > bv) return desc ? -1 : 1;
          return 0;
        });
      } else {
        const keys = Object.keys(spec);
        result.sort((a, b) => {
          for (const k of keys) {
            const dir = spec[k] === -1 ? -1 : 1;
            let av = a[k], bv = b[k];
            if (av instanceof Date) av = av.getTime();
            if (bv instanceof Date) bv = bv.getTime();
            if (av < bv) return -dir;
            if (av > bv) return dir;
          }
          return 0;
        });
      }
      return q;
    },
    skip(n) {
      result = result.slice(n);
      return q;
    },
    limit(n) {
      result = result.slice(0, n);
      return q;
    },
    then(resolve) {
      resolve(result);
    },
    [Symbol.iterator]() {
      return result[Symbol.iterator]();
    },
  };
  return q;
};

const saveCollections = () => {
  try {
    fs.mkdirSync(dataDirectory, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(collections, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save local database:", error.message);
  }
};

// Generate a MongoDB-like ObjectId (24-char hex)
export const generateId = () => crypto.randomBytes(12).toString("hex");
export { chainable };

// ── Generic helpers ─────────────────────────────────────────────────
export const db = {
  // ─── Users ───
  users: {
    findOne(filter) {
      return collections.users.find((u) => {
        for (const key of Object.keys(filter)) {
          if (u[key] !== filter[key]) return false;
        }
        return true;
      }) || null;
    },
    findById(id) {
      return collections.users.find((u) => u._id === id) || null;
    },
    create(data) {
      const user = {
        _id: generateId(),
        ...data,
        currency: data.currency || "INR",
        theme: data.theme || "light",
        dateFormat: data.dateFormat || "dd MMM yyyy",
        role: data.role || "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      collections.users.push(user);
      saveCollections();
      return user;
    },
    findByIdAndUpdate(id, updates) {
      const user = this.findById(id);
      if (!user) return null;
      Object.assign(user, updates, { updatedAt: new Date().toISOString() });
      saveCollections();
      return user;
    },
  },

  // ─── Transactions ───
  transactions: {
    find(filter = {}) {
      return collections.transactions.filter((t) => matchFilter(t, filter));
    },
    findById(id) {
      return collections.transactions.find((t) => t._id === id) || null;
    },
    create(data) {
      const txn = {
        _id: generateId(),
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      collections.transactions.push(txn);
      saveCollections();
      return txn;
    },
    findByIdAndUpdate(id, updates) {
      const txn = this.findById(id);
      if (!txn) return null;
      Object.assign(txn, updates, { updatedAt: new Date().toISOString() });
      if (updates.date) txn.date = new Date(updates.date);
      saveCollections();
      return txn;
    },
    deleteOne(id) {
      const idx = collections.transactions.findIndex((t) => t._id === id);
      if (idx === -1) return false;
      collections.transactions.splice(idx, 1);
      saveCollections();
      return true;
    },
    countDocuments(filter = {}) {
      return this.find(filter).length;
    },
  },

  // ─── Budgets ───
  budgets: {
    find(filter = {}) {
      return collections.budgets.filter((b) => matchFilter(b, filter));
    },
    findById(id) {
      return collections.budgets.find((b) => b._id === id) || null;
    },
    create(data) {
      const budget = {
        _id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      collections.budgets.push(budget);
      saveCollections();
      return budget;
    },
    findByIdAndUpdate(id, updates) {
      const budget = this.findById(id);
      if (!budget) return null;
      Object.assign(budget, updates, { updatedAt: new Date().toISOString() });
      saveCollections();
      return budget;
    },
    deleteOne(id) {
      const idx = collections.budgets.findIndex((b) => b._id === id);
      if (idx === -1) return false;
      collections.budgets.splice(idx, 1);
      saveCollections();
      return true;
    },
  },

  // ─── Categories ───
  categories: {
    find(filter = {}) {
      return collections.categories.filter((c) => matchFilter(c, filter));
    },
    findById(id) {
      return collections.categories.find((c) => c._id === id) || null;
    },
    create(data) {
      const category = {
        _id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      collections.categories.push(category);
      saveCollections();
      return category;
    },
    insertMany(items) {
      return items.map((item) => this.create(item));
    },
    findByIdAndUpdate(id, updates) {
      const cat = this.findById(id);
      if (!cat) return null;
      Object.assign(cat, updates, { updatedAt: new Date().toISOString() });
      saveCollections();
      return cat;
    },
    deleteOne(id) {
      const idx = collections.categories.findIndex((c) => c._id === id);
      if (idx === -1) return false;
      collections.categories.splice(idx, 1);
      saveCollections();
      return true;
    },
  },
};

// ── Filter matcher (supports simple equality and $or) ───────────────
function matchFilter(doc, filter) {
  for (const key of Object.keys(filter)) {
    if (key === "$or") {
      const matched = filter.$or.some((clause) => matchFilter(doc, clause));
      if (!matched) return false;
      continue;
    }
    if (typeof filter[key] === "object" && filter[key] !== null && !Array.isArray(filter[key])) {
      // Handle $gte, $lte, $regex
      const ops = filter[key];
      const val = doc[key] instanceof Date ? doc[key] : new Date(doc[key]);
      if (ops.$gte && val < new Date(ops.$gte)) return false;
      if (ops.$lte && val > new Date(ops.$lte)) return false;
      if (ops.$regex) {
        const flags = ops.$options || "";
        const re = new RegExp(ops.$regex, flags);
        if (!re.test(String(doc[key]))) return false;
      }
      continue;
    }
    if (doc[key] !== filter[key]) return false;
  }
  return true;
}

// Seed default categories on startup
function seedDefaults() {
  if (collections.categories.length > 0) return;

  const DEFAULT_INCOME = [
    { name: "Salary", type: "income", color: "#22c55e", icon: "Wallet", isDefault: true },
    { name: "Freelance", type: "income", color: "#3b82f6", icon: "Briefcase", isDefault: true },
    { name: "Business", type: "income", color: "#8b5cf6", icon: "Building2", isDefault: true },
    { name: "Investment", type: "income", color: "#f59e0b", icon: "TrendingUp", isDefault: true },
    { name: "Other Income", type: "income", color: "#64748b", icon: "PlusCircle", isDefault: true },
  ];
  const DEFAULT_EXPENSE = [
    { name: "Food", type: "expense", color: "#ef4444", icon: "Utensils", isDefault: true },
    { name: "Shopping", type: "expense", color: "#ec4899", icon: "ShoppingBag", isDefault: true },
    { name: "Transport", type: "expense", color: "#06b6d4", icon: "Car", isDefault: true },
    { name: "Rent", type: "expense", color: "#8b5cf6", icon: "Home", isDefault: true },
    { name: "Bills", type: "expense", color: "#f59e0b", icon: "FileText", isDefault: true },
    { name: "Healthcare", type: "expense", color: "#10b981", icon: "HeartPulse", isDefault: true },
    { name: "Education", type: "expense", color: "#3b82f6", icon: "GraduationCap", isDefault: true },
    { name: "Entertainment", type: "expense", color: "#a855f7", icon: "Film", isDefault: true },
    { name: "Travel", type: "expense", color: "#14b8a6", icon: "Plane", isDefault: true },
    { name: "Other Expenses", type: "expense", color: "#64748b", icon: "MoreHorizontal", isDefault: true },
  ];
  [...DEFAULT_INCOME, ...DEFAULT_EXPENSE].forEach((cat) =>
    db.categories.create({ ...cat, user: null })
  );
}

// ── Connect (no-op for in-memory, just seeds defaults) ──────────────
const connectDB = async () => {
  seedDefaults();
  console.log("In-memory database initialized (no MongoDB needed)");
};

export default connectDB;
