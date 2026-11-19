/**
 * Select input component.
 */

import { cn } from "../../utils/cn";

const Select = ({ className, ...props }) => {
  return (
    <select
      className={cn(
        "block w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer appearance-none pr-10 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    />
  );
};

export default Select;
