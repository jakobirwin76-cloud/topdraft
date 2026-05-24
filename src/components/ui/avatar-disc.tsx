type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

// Two violet tokens give enough variety while staying brand-coherent.
// Order matters — indexing is deterministic via name hash.
const PALETTE = ["bg-accent", "bg-accent-2"] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  const first = parts[0]!.charAt(0);
  const last = parts[parts.length - 1]!.charAt(0);
  return `${first}${last}`.toUpperCase();
}

function paletteIndex(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % PALETTE.length;
}

interface AvatarDiscProps {
  name: string;
  size?: Size;
  className?: string;
}

export function AvatarDisc({ name, size = "md", className = "" }: AvatarDiscProps) {
  const bg = PALETTE[paletteIndex(name)];
  return (
    <span
      aria-label={name}
      className={`inline-flex items-center justify-center rounded-full font-display font-bold text-white select-none ${bg} ${SIZE_CLASSES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
