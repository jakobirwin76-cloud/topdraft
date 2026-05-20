/**
 * Motion tokens — see CLAUDE.md.
 * Organic springs only. Never linear easing.
 * Restrained on trade UI; cinematic on Quest + share cards.
 */

export const spring = {
  /** Default for most state changes (cards, sheets, buttons). */
  default: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 } as const,
  /** Tap feedback. Quicker, slightly more energetic. */
  snappy: { type: "spring", stiffness: 380, damping: 30 } as const,
  /** Quest reveal + onboarding sequences. Slower, more deliberate. */
  cinematic: { type: "spring", stiffness: 140, damping: 22 } as const,
};

export const fade = {
  duration: 0.18,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/** Stagger for revealing lists of cards (Quest answers, market rows). */
export const stagger = {
  container: {
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  },
  item: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: spring.default },
  },
};

/** Press feedback (use with `whileTap`). */
export const press = { scale: 0.97 };

/** Count-up animation timing for price/balance changes. */
export const countUp = {
  duration: 0.65,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};
