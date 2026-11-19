/**
 * Stat card for dashboard summary numbers.
 */

import { formatCurrency } from "@/utils/formatters";

const StatCard = ({ title, value, subtitle, trend, icon: Icon }) => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(value)}</p>
          {subtitle && <p className="text-xs text-neutral-400 dark:text-neutral-500">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <p className={`mt-2 text-xs font-medium ${trend >= 0 ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}>
          {trend >= 0 ? "+" : ""}{trend}%
        </p>
      )}
    </div>
  );
};

export default StatCard;
