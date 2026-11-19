/**
 * Transactions page - RupeeFlow.
 * Full transaction management: add, edit, delete, search, filter, sort, paginate.
 */

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Trash2, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTransactions } from "@/context/TransactionContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate, typeLabel, capitalize } from "@/utils/formatters";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from "@/data/categories";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";

const INITIAL_FORM = {
  title: "",
  amount: "",
  type: "expense",
  category: "",
  date: "",
  paymentMethod: "",
  description: "",
  notes: "",
};

const TransactionsPage = () => {
  const {
    transactions,
    loading,
    error,
    clearError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
  } = useTransactions();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_FORM });

  /* Filters */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (error) {
      showToast({ title: "Error", message: error, type: "error" });
      clearError();
    }
  }, [error, showToast, clearError]);

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const filtered = transactions.filter((txn) => {
    const matchSearch =
      txn.title.toLowerCase().includes(search.toLowerCase()) ||
      txn.description.toLowerCase().includes(search.toLowerCase()) ||
      txn.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || txn.type === typeFilter;
    const matchCategory = categoryFilter === "all" || txn.category === categoryFilter;
    const matchMethod = methodFilter === "all" || txn.paymentMethod === methodFilter;
    const d = new Date(txn.date);
    const matchDate =
      (!dateFrom || d >= new Date(dateFrom)) && (!dateTo || d <= new Date(dateTo));
    return matchSearch && matchType && matchCategory && matchMethod && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "amount-asc") return Number(a.amount) - Number(b.amount);
    if (sortBy === "amount-desc") return Number(b.amount) - Number(a.amount);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date || !form.paymentMethod) {
      showToast({ title: "Validation error", message: "Please fill all required fields", type: "error" });
      return;
    }
    const amount = Number(form.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ title: "Validation error", message: "Amount must be a positive number", type: "error" });
      return;
    }

    try {
      if (editing) {
        await updateTransaction(form.id, {
          title: form.title,
          amount,
          type: form.type,
          category: form.category,
          date: form.date,
          paymentMethod: form.paymentMethod,
          description: form.description,
          notes: form.notes,
        });
        showToast({ title: "Updated", message: "Transaction updated successfully", type: "success" });
      } else {
        await addTransaction({
          title: form.title,
          amount,
          type: form.type,
          category: form.category,
          date: form.date,
          paymentMethod: form.paymentMethod,
          description: form.description,
          notes: form.notes,
        });
        showToast({ title: "Added", message: "Transaction added successfully", type: "success" });
      }
      setOpen(false);
      setEditing(false);
      setForm({ ...INITIAL_FORM });
      setCurrentPage(1);
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to save transaction", type: "error" });
    }
  };

  const handleDelete = async (idToDelete) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(idToDelete);
      showToast({ title: "Deleted", message: "Transaction removed successfully", type: "success" });
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to delete transaction", type: "error" });
    }
  };

  const openEdit = (txn) => {
    setForm({ ...txn, amount: String(txn.amount) });
    setEditing(true);
    setOpen(true);
  };

  const categoryOptions = allCategories.map((c) => ({ value: c.id, label: c.name }));

  const typeLabelMap = { income: "Income", expense: "Expense" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Transactions</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage your income and expense records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchTransactions()} size="sm">
            <Search className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button
            onClick={() => {
              setForm({ ...INITIAL_FORM, date: new Date().toISOString().split("T")[0] });
              setEditing(false);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setCategoryFilter("all");
              setMethodFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Search</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title, description, category" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Type</label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Category</label>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Payment method</label>
            <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="all">All methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">From date</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">To date</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Sort by</label>
            <Select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="w-48">
              <option value="date-desc">Date (newest)</option>
              <option value="date-asc">Date (oldest)</option>
              <option value="amount-desc">Amount (high to low)</option>
              <option value="amount-asc">Amount (low to high)</option>
            </Select>
        </div>
      </Card>

      {/* List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Title</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Category</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Date</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Payment</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Amount</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Type</th>
                <th className="table-cell font-medium text-neutral-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((txn) => (
                  <tr key={txn.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="table-cell">{txn.title}</td>
                    <td className="table-cell">
                      <Badge variant={txn.type === "income" ? "income" : "expense"}>{capitalize(txn.category)}</Badge>
                    </td>
                    <td className="table-cell">{formatDate(txn.date)}</td>
                    <td className="table-cell text-sm text-neutral-600 dark:text-neutral-400">{capitalize(txn.paymentMethod)}</td>
                    <td className={`table-cell font-medium ${txn.type === "income" ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}>
                      {txn.type === "income" ? "+" : "-"} {formatCurrency(txn.amount)}
                    </td>
                    <td className="table-cell">
                      <Badge variant={txn.type}>{typeLabelMap[txn.type]}</Badge>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(txn)}
                          className="p-2 text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400" title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(txn.id)}
                          className="p-2 text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-neutral-500 dark:text-neutral-400">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {currentPage} of {totalPages} &nbsp;({sorted.length} transactions)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!open ? "true" : "false"}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl dark:bg-neutral-900 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editing ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" aria-label="Close">
                <span className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="text-[12px] font-bold">✕</span>
                </span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Salary, Grocery"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type *</label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value, category: "" })}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Amount (₹) *</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category *</label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date *</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Payment method *</label>
                  <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} required>
                    <option value="">Select method</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Notes</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editing ? "Save Changes" : "Add Transaction"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
