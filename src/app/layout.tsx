import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Topdraft — your sports IQ is worth money",
  description:
    "Skill-based fantasy sports trading. Build a virtual portfolio of athletes, trade on every play, climb the leaderboard.",
  manifest: "/manifest.webmanifest",
  applicationName: "Topdraft",
  appleWebApp: { capable: true, title: "Topdraft", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#060a0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
