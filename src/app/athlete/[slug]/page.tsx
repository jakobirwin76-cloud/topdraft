import { notFound } from "next/navigation";
import { ATHLETES } from "@/lib/athletes/data";
import AthletePageClient from "./athlete-client";

export default async function AthletePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = ATHLETES[slug.toLowerCase()];
  if (!athlete) notFound();
  return <AthletePageClient athlete={athlete} />;
}

export async function generateStaticParams() {
  return Object.keys(ATHLETES).map((slug) => ({ slug }));
}
