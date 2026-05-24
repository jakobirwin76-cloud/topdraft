import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + cursor-pointer. Use for clickable cards. */
  interactive?: boolean;
}

const BASE = "bg-surface border border-border rounded-xl transition-colors duration-150";

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`${BASE} ${interactive ? "hover:bg-surface-2 cursor-pointer" : ""} ${className}`}
      {...props}
    />
  ),
);
Card.displayName = "Card";
