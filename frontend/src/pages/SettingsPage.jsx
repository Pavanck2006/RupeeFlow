/**
 * Settings page - RupeeFlow.
 * Profile, currency, theme, date format and export options.
 */

import { useState } from "react";
import { User, Moon, Sun, CreditCard, Download, Save, LogOut } from "lucide-react";
import { settingsService } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/context/TransactionContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/utils/formatters";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { transactions } = useTransactions();
  const { show: showToast } = useToast();
  const [settings, setSettings] = useState({
    currency: user?.currency || "INR",
    theme: theme,
    dateFormat: user?.dateFormat || "dd MMM yyyy",
    exportEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to load settings", type: "error" });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update({ ...settings, theme });
      localStorage.setItem("rupeeflow_theme", theme);
      showToast({ title: "Saved", message: "Settings updated successfully", type: "success" });
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      showToast({ title: "Nothing to export", message: "No transactions found", type: "warning" });
      return;
    }
    const csv = [
      ["Title", "Type", "Category", "Amount", "Date", "Payment Method", "Description", "Notes"],
      ...transactions.map((t) => [t.title, t.type, t.category, t.amount, t.date, t.paymentMethod, t.description, t.notes]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rupeeflow_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: "Exported", message: "Transactions downloaded as CSV", type: "success" });
  };

  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage your profile, currency, theme and data preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Profile Settings</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Full Name</label>
                <Input defaultValue={user?.name || ""} disabled />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                <Input defaultValue={user?.email || ""} disabled />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Currency</label>
                <Select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date Format</label>
                <Select value={settings.dateFormat} onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}>
                  <option value="dd MMM yyyy">15 Sep 2024</option>
                  <option value="MMM dd, yyyy">Sep 15, 2024</option>
                  <option value="yyyy-MM-dd">2024-09-15</option>
                </Select>
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Theme Settings</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">Appearance</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Choose light or dark mode</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTheme()}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${theme === "dark" ? "bg-brand-600 text-white border-brand-600" : "bg-neutral-200 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"}`}
                  >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <Badge variant={theme === "dark" ? "brand" : "neutral"}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Export Options</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Export your transaction history to CSV for your records.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
              <Download className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">Export Transactions</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Download CSV file</div>
              </div>
              <Button onClick={handleExport} disabled={transactions.length === 0}>
                Export
              </Button>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3">
              Total transactions: {transactions.length} &nbsp;|&nbsp; Total value: {formatCurrency(total)}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {user?.email || ""}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3">
              Your financial records are stored securely in MongoDB Atlas and are private to your account.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
