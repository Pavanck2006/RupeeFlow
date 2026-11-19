/**
 * Badge component for status/category labels.
 */

import { cn } from "../../utils/cn";

const Badge = ({ className, variant = "neutral", children, ...props }) => {
  const variants = {
    neutral: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    income: "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400",
    expense: "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400",
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
    warning: "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;
