type Variant = "text" | "card" | "circle";

const VARIANT_CLASSES: Record<Variant, string> = {
  text: "h-4 w-full rounded-md",
  card: "h-32 w-full rounded-xl",
  // Avatar-shaped placeholder — rounded-full allowed here (avatar surface).
  circle: "aspect-square w-10 rounded-full",
};

interface SkeletonProps {
  variant?: Variant;
  /** Override size via Tailwind utility classes (e.g. "w-32 h-6"). */
  className?: string;
}

export function Skeleton({ variant = "text", className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
