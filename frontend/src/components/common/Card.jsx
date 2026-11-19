/**
 * Reusable Card component.
 */

import { cn } from "../../utils/cn";

const Card = ({ className, children, ...props }) => {
  return (
    <div className={cn("rounded-xl border border-neutral-200 bg-white p-6 shadow-card transition-all hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
