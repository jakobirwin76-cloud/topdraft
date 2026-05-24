import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Marks the input visually invalid. Pair with aria-invalid for screen readers. */
  error?: boolean;
}

const BASE =
  "w-full bg-bg border rounded-lg px-4 py-3 text-text placeholder:text-text-dim transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

const OK = "border-border focus:border-accent focus:ring-accent/20";
const ERR = "border-loss focus:border-loss focus:ring-loss/20";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = "", ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={`${BASE} ${error ? ERR : OK} ${className}`}
      {...props}
    />
  ),
);
Input.displayName = "Input";
