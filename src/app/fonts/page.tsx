import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Font test · Topdraft",
  description: "Pick the headline font.",
};

interface FontEntry {
  family: string;
  category: string;
  description: string;
  weight: number;
  current?: boolean;
}

const FONTS: ReadonlyArray<FontEntry> = [
  // Expressive Grotesque (Gen Z 2026)
  {
    family: "Bricolage Grotesque",
    category: "Expressive Grotesque",
    description: "The 2026 Gen Z pick — variable opsz+wght. Currently shipped.",
    weight: 700,
    current: true,
  },
  {
    family: "Unbounded",
    category: "Expressive Grotesque",
    description: "Chunky, geometric, loud personality. Most Gen Z of the set.",
    weight: 700,
  },
  {
    family: "Funnel Sans",
    category: "Expressive Grotesque",
    description: "New 2024 geometric sans. Modern, slightly playful.",
    weight: 700,
  },
  {
    family: "Familjen Grotesk",
    category: "Expressive Grotesque",
    description: "Warmer grotesque, slight humanist curves.",
    weight: 700,
  },

  // Clean Institutional
  {
    family: "Inter Tight",
    category: "Clean Institutional",
    description: "Tighter Inter — the premium SaaS default. Restrained.",
    weight: 800,
  },
  {
    family: "Geist",
    category: "Clean Institutional",
    description: "Vercel's font. Clean, technical, monospace-adjacent.",
    weight: 700,
  },
  {
    family: "Manrope",
    category: "Clean Institutional",
    description: "Geometric modern sans. Notion-adjacent.",
    weight: 800,
  },
  {
    family: "Plus Jakarta Sans",
    category: "Clean Institutional",
    description: "Friendly modern sans. Linear-adjacent.",
    weight: 800,
  },
  {
    family: "Onest",
    category: "Clean Institutional",
    description: "Newer (2023+). Slightly playful, geometric.",
    weight: 700,
  },
  {
    family: "Hanken Grotesk",
    category: "Clean Institutional",
    description: "Workhorse grotesque. Inter alternative.",
    weight: 800,
  },

  // Editorial Serif
  {
    family: "Instrument Serif",
    category: "Editorial Serif",
    description: "WSJ-money editorial serif. Single weight (400).",
    weight: 400,
  },
  {
    family: "Fraunces",
    category: "Editorial Serif",
    description: "Variable expressive serif. Sharp + chunky.",
    weight: 800,
  },

  // Chunky / Brutalist
  {
    family: "Archivo Black",
    category: "Chunky / Brutalist",
    description: "Heavy chunky sans. Single weight, super dense.",
    weight: 900,
  },
  {
    family: "Bowlby One",
    category: "Chunky / Brutalist",
    description: "Y2K-coded chunky retro. Loud, distinctive.",
    weight: 400,
  },
  {
    family: "Big Shoulders Display",
    category: "Chunky / Brutalist",
    description: "Sports-broadcast tall display. Stadium energy.",
    weight: 800,
  },
  {
    family: "Anton",
    category: "Chunky / Brutalist",
    description: "Bebas Neue alternative — condensed display.",
    weight: 400,
  },

  // Tech / Modern
  {
    family: "Space Grotesk",
    category: "Tech / Modern",
    description: "Techy geometric. Polymarket-adjacent.",
    weight: 700,
  },
  {
    family: "DM Sans",
    category: "Tech / Modern",
    description: "Clean modern sans by Google.",
    weight: 800,
  },
  {
    family: "Outfit",
    category: "Tech / Modern",
    description: "Geometric warm sans. Friendly tech.",
    weight: 800,
  },
  {
    family: "Syne",
    category: "Tech / Modern",
    description: "Modern chunky-display feel. Slightly editorial.",
    weight: 800,
  },
];

// Build a single Google Fonts URL that loads all of the above.
const FONT_URL = buildFontUrl(FONTS);

export default function FontTestPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONT_URL} />
      <main className="min-h-screen text-text px-5 md:px-12 py-12 md:py-16 max-w-3xl mx-auto">
        <nav className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-mute hover:text-text transition-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to landing
          </Link>
        </nav>

        <header className="mb-16">
          <div className="font-medium text-xs uppercase tracking-[0.05em] text-text-mute mb-3">
            Font test · pick one
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-[1.1] mb-4">
            20 headline fonts. Same line. Same accent.
          </h1>
          <p className="text-base text-text-mute leading-relaxed">
            Scroll. Find one that lands. Tell me the name (the small mono label under each
            preview), and I'll swap it into the live site globally.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          {FONTS.map((f) => (
            <FontPreview key={f.family} font={f} />
          ))}
        </div>

        <footer className="mt-24 pt-10 border-t border-border text-xs text-text-dim font-medium uppercase tracking-[0.05em]">
          All fonts loaded from Google Fonts. Free for commercial use.
        </footer>
      </main>
    </>
  );
}

function FontPreview({ font }: { font: FontEntry }) {
  return (
    <div className="border border-border rounded-xl bg-surface/50 p-6 md:p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-xs uppercase tracking-[0.05em] text-text-mute">
          {font.category}
        </span>
        {font.current && (
          <span className="text-[10px] uppercase tracking-widest text-accent border border-accent/40 px-2 py-0.5 rounded">
            Current
          </span>
        )}
      </div>

      <h2
        className="text-[44px] md:text-[68px] leading-[1.08] tracking-[-0.04em] mb-5"
        style={{ fontFamily: `"${font.family}", sans-serif`, fontWeight: font.weight }}
      >
        Stop being right
        <br />
        <span className="text-accent">for free.</span>
      </h2>

      <div className="flex flex-col gap-1">
        <code className="font-data text-sm text-text">{font.family}</code>
        <p className="text-sm text-text-mute leading-relaxed">{font.description}</p>
      </div>
    </div>
  );
}

function buildFontUrl(fonts: ReadonlyArray<FontEntry>): string {
  // Group weights per family so the URL stays compact.
  const weightsByFamily = new Map<string, Set<number>>();
  for (const f of fonts) {
    if (!weightsByFamily.has(f.family)) weightsByFamily.set(f.family, new Set());
    weightsByFamily.get(f.family)!.add(f.weight);
  }
  const families = Array.from(weightsByFamily.entries()).map(([family, weights]) => {
    const fam = family.replace(/ /g, "+");
    const sorted = Array.from(weights).sort((a, b) => a - b);
    // Some single-weight fonts (Archivo Black, Bowlby One, Anton, Instrument Serif)
    // don't accept the wght axis param — drop the suffix in that case.
    if (sorted.length === 1 && [400, 900].includes(sorted[0])) {
      const singleWeightFonts = new Set([
        "Archivo Black", "Bowlby One", "Anton", "Instrument Serif",
      ]);
      if (singleWeightFonts.has(family)) return `family=${fam}`;
    }
    return `family=${fam}:wght@${sorted.join(";")}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
