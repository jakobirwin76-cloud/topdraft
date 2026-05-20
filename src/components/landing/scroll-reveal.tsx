"use client";

import { Children, type ReactNode } from "react";
import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 },
  },
} as const;

interface Props {
  children: ReactNode;
  /** When true, each direct child reveals staggered (60ms apart). */
  stagger?: boolean;
  className?: string;
}

/**
 * Wraps server-rendered children with a single in-view reveal. Children stay
 * server-rendered because they're passed as React nodes — only the wrapper
 * runs on the client.
 */
export function ScrollReveal({ children, stagger, className }: Props) {
  if (!stagger) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={item}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
