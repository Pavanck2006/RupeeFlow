/**
 * Form label component.
 */

const Label = ({ className, children, ...props }) => {
  return (
    <label className={cn("block text-sm font-medium text-neutral-700 mb-1.5 dark:text-neutral-300", className)} {...props}>
      {children}
    </label>
  );
};

export default Label;
