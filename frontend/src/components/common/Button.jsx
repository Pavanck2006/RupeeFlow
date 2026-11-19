/**
 * Reusable Button component.
 * Supports variants: primary, secondary, outline, danger, ghost.
 * Sizes: sm, md, lg.
 */

import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Button = forwardRef(({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-brand-600 text-white focus:ring-brand-500 hover:bg-brand-700 active:scale-[0.98]",
    secondary: "bg-neutral-200 text-neutral-900 focus:ring-neutral-300 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 active:scale-[0.98]",
    outline: "border border-neutral-300 bg-transparent text-neutral-700 focus:ring-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 active:scale-[0.98]",
    danger: "bg-red-600 text-white focus:ring-red-500 hover:bg-red-700 active:scale-[0.98]",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button ref={ref} disabled={disabled} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
