/**
 * Utility to merge Tailwind CSS classes.
 * Replaces conflicting classes with the last one wins.
 */

import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
