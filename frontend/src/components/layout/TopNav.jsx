/**
 * Top navigation bar.
 * Mobile hamburger menu, search, notifications, and user profile area.
 */

import { useState } from "react";
import { Menu, Search, Bell, User, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/context/TransactionContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/utils/formatters";

const TopNav = ({ onMenuToggle, user, onLogout }) => {
  const [userOpen, setUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { show: showToast } = useToast();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.key === "Enter") {
      navigate(`/transactions?search=${encodeURIComponent(e.target.value)}`);
    }
  };

  const handleGoToSettings = () => {
    setUserOpen(false);
    navigate("/settings");
  };

  const handleGoToProfile = () => {
    setUserOpen(false);
    navigate("/settings");
  };

  const handleNotifications = () => {
    showToast({ title: "Notifications", message: "Notifications will be available soon", type: "info" });
  };

  const matchingTransactions = transactions.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 w-64"
          />
          {searchTerm && matchingTransactions.length > 0 && (
            <div className="absolute left-0 top-full w-64 mt-1 rounded-lg border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900 z-50 max-h-64 overflow-y-auto">
              {matchingTransactions.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSearchTerm("");
                    navigate("/transactions");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <span className="text-neutral-400">{t.type === "income" ? "+" : "-"}</span>
                  <span className="truncate">{t.title}</span>
                  <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">{formatCurrency(t.amount)}</span>
                </button>
              ))}
              <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
                {matchingTransactions.length} result{matchingTransactions.length === 1 ? "" : "s"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleNotifications}
          className="hidden md:flex items-center gap-2 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="hidden sm:block text-xs font-medium">Notifications</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="User profile"
            aria-expanded={userOpen}
          >
            <User className="w-6 h-6" />
            <span className="hidden sm:block text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {user?.name || "Profile"}
            </span>
          </button>
          {userOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white p-2 shadow-card dark:border-neutral-800 dark:bg-neutral-900 z-50">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                onClick={handleGoToProfile}
              >
                <User className="w-4 h-4" />
                {user?.name || "My Profile"}
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                onClick={handleGoToSettings}
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-neutral-200 my-1 dark:border-neutral-800" />
              <button
                onClick={() => {
                  setUserOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="w-4 h-4">↗</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
