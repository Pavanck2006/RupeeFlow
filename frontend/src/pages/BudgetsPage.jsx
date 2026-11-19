/**
 * Budget management page - RupeeFlow.
 * Create monthly/category budgets, track spending against them and get warnings
 * when spending approaches a budget limit.
 */

import { useState } from "react";
import { Plus, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { budgetService } from "@/services/api";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/categories";
import { formatCurrency, formatMonthYear } from "@/utils/formatters";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import { useToast } from "@/context/ToastContext";

const BudgetsPage = () => {
  const { transactions } = useTransactions();
  const { show: showToast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    category: "",
    amount: "",
  });

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetService.getAll();
      setBudgets(data || []);
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to load budgets", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) {
      showToast({ title: "Validation error", message: "Category and amount are required", type: "error" });
      return;
    }
    const amount = Number(form.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ title: "Validation error", message: "Enter a valid amount", type: "error" });
      return;
    }
    try {
      await budgetService.create({
        month: form.month,
        year: form.year,
        category: form.category,
        limit: amount,
      });
      setOpen(false);
      setForm({ month: new Date().getMonth(), year: new Date().getFullYear(), category: "", amount: "" });
      await loadBudgets();
      showToast({ title: "Budget created", message: "Your budget has been set successfully", type: "success" });
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to create budget", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await budgetService.delete(id);
      await loadBudgets();
      showToast({ title: "Deleted", message: "Budget removed", type: "success" });
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to delete budget", type: "error" });
    }
  };

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  // Compute spending per budget
  const budgetsWithSpending = budgets.map((b) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === b.category &&
          new Date(t.date).getMonth() === b.month &&
          new Date(t.date).getFullYear() === b.year
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
    const status = pct >= 100 ? "exceeded" : pct >= 80 ? "warning" : "ok";
    return { ...b, spent, pct, status };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Budget Management</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Set spending limits and track your progress month by month.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Budget</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {budgetsWithSpending.length > 0 ? (
          budgetsWithSpending.map((b) => {
            const remaining = b.limit - b.spent;
            return (
              <Card key={b.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{b.category}</span>
                  <Badge variant={b.status === "exceeded" ? "danger" : b.status === "warning" ? "warning" : "income"}>
                    {b.status === "exceeded" ? "Exceeded" : b.status === "warning" ? "Approaching limit" : "On track"}
                  </Badge>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    <span>Spent</span>
                    <span>{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 dark:bg-neutral-800">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${b.status === "exceeded" ? "bg-danger-600" : b.status === "warning" ? "bg-warning-600" : "bg-success-600"}`}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-medium ${b.status === "exceeded" ? "text-danger-600 dark:text-danger-400" : b.status === "warning" ? "text-warning-600 dark:text-warning-400" : "text-success-600 dark:text-success-400"}`}>
                    {b.status === "exceeded" ? `Over by ${formatCurrency(Math.abs(remaining))}` : `₹${remaining.toLocaleString("en-IN")} remaining`}
                  </span>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400 ml-auto" title="Delete budget"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-3 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-3 dark:bg-neutral-800">
              <TrendingUp className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">No budgets yet</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Create your first budget to start tracking spending limits.</p>
          </Card>
        )}
      </div>

      {/* Create budget modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!open ? "true" : "false"}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl dark:bg-neutral-900 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Create Budget</h2>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" aria-label="Close">
                <span className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="text-[12px] font-bold">✕</span>
                </span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Month</label>
                  <Select value={String(form.month)} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                      <option key={i} value={String(i)}>{m}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Year</label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) || new Date().getFullYear() })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category *</label>
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Monthly Limit (₹) *</label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>Create Budget</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
