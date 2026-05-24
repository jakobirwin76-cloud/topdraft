"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { countUp } from "@/lib/motion/tokens";

type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

interface AthletePriceProps {
  /** The current price in dollars. */
  value: number;
  /** Optional change ratio (e.g. 0.05 = +5%). Drives color: + → win, − → loss. */
  delta?: number;
  size?: Size;
  className?: string;
}

export function AthletePrice({ value, delta, size = "md", className = "" }: AthletePriceProps) {
  const mv = useMotionValue(value);
  const formatted = useTransform(mv, (v) => `$${v.toFixed(2)}`);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: countUp.duration,
      ease: countUp.ease,
    });
    return () => controls.stop();
  }, [value, mv]);

  const colorClass =
    delta === undefined || delta === 0
      ? "text-text"
      : delta > 0
      ? "text-win"
      : "text-loss";

  return (
    <motion.span className={`font-data tabular-nums ${SIZE_CLASSES[size]} ${colorClass} ${className}`}>
      {formatted}
    </motion.span>
  );
}
