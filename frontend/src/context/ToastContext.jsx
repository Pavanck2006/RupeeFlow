/**
 * Toast context for RupeeFlow.
 * Provides toast notifications across the app.
 * Frontend-only.
 */

import { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
  error: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
  warning: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  info: "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-400",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(
    ({ title, message, type = "info", duration = 4000 }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { toasts, show, remove };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-card min-w-[320px] animate-fade-in",
                COLORS[toast.type]
              )}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-medium">{toast.title}</div>
              {toast.message && <div className="text-xs opacity-80 mt-0.5">{toast.message}</div>}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
