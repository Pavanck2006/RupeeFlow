/**
 * Sidebar navigation component.
 * Collapses on mobile and shows active route styling.
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  Calendar,
  BarChart3,
  PieChart,
  CreditCard,
  FolderKanban,
  Settings,
  X,
  Moon,
  Sun,
  Wallet,
  LogOut,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/transactions", icon: List, label: "Transactions" },
  { path: "/daily", icon: Calendar, label: "Daily Tracking" },
  { path: "/reports/monthly", icon: BarChart3, label: "Monthly Reports" },
  { path: "/reports/yearly", icon: PieChart, label: "Yearly Reports" },
  { path: "/budgets", icon: CreditCard, label: "Budgets" },
  { path: "/categories", icon: FolderKanban, label: "Categories" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const Sidebar = ({ isOpen, setIsOpen, user, onLogout }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transition-transform duration-300 transform -translate-x-full dark:bg-neutral-900 dark:border-neutral-800",
        isOpen ? "translate-x-0" : ""
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl dark:text-brand-400">
            <Wallet className="w-7 h-7" />
            <span className="hidden sm:block">RupeeFlow</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors rounded-lg",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {user?.email || ""}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg border border-neutral-300 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50 p-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
