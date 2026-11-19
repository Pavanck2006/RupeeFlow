/**
 * Categories page - RupeeFlow.
 * Lists default income and expense categories and allows adding custom categories.
 */

import { useState } from "react";
import { Plus, Wallet, ShoppingBag, PlusCircle } from "lucide-react";
import { categoryService } from "@/services/api";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/data/categories";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

const CategoriesPage = () => {
  const { show: showToast } = useToast();
  const [customIncome, setCustomIncome] = useState([]);
  const [customExpense, setCustomExpense] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "expense", color: "#64748b" });

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCustomIncome(data.income.filter((c) => !INCOME_CATEGORIES.some((d) => d.id === c.id)));
      setCustomExpense(data.expense.filter((c) => !EXPENSE_CATEGORIES.some((d) => d.id === c.id)));
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to load categories", type: "error" });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) {
      showToast({ title: "Validation error", message: "Category name is required", type: "error" });
      return;
    }
    try {
      const created = await categoryService.create({
        name: form.name,
        type: form.type,
        color: form.color,
        icon: "Tag",
      });
      if (form.type === "income") {
        setCustomIncome([...customIncome, created]);
      } else {
        setCustomExpense([...customExpense, created]);
      }
      setOpen(false);
      setForm({ name: "", type: "expense", color: "#64748b" });
      showToast({ title: "Category added", message: `${form.name} category created`, type: "success" });
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to add category", type: "error" });
    }
  };

  const renderDefault = (list, type) => (
    <Card className="p-4">
      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
        {type === "income" ? "Income Categories" : "Expense Categories"}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: c.color + "20" }}>
              <span className="text-[10px] font-bold" style={{ color: c.color }}>•</span>
            </div>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{c.name}</span>
          </div>
        ))}
        {type === "income" ? customIncome.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: (c.color || "#64748b") + "20" }}>
              <span className="text-[10px] font-bold" style={{ color: c.color || "#64748b" }}>•</span>
            </div>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{c.name}</span>
          </div>
        )) : customExpense.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: (c.color || "#64748b") + "20" }}>
              <span className="text-[10px] font-bold" style={{ color: c.color || "#64748b" }}>•</span>
            </div>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{c.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Categories</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Organize your transactions with income and expense categories.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Custom Category</Button>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">Default categories cannot be deleted</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDefault(INCOME_CATEGORIES, "income")}
        {renderDefault(EXPENSE_CATEGORIES, "expense")}
      </div>

      {/* Add category modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!open ? "true" : "false"}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl dark:bg-neutral-900 w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Add Custom Category</h2>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" aria-label="Close">
                <span className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="text-[12px] font-bold">✕</span>
                </span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gym Membership" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type *</label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Color</label>
                <div className="flex gap-2">
                  {["#64748b", "#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#14b8a6"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full border ${form.color === color ? "ring-2 ring-offset-2 ring-brand-600" : ""}`}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add Category</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
