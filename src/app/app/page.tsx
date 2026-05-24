import { ATHLETES } from "@/lib/athletes/data";
import AppHomeClient from "./app-client";

export const metadata = {
  title: "Topdraft — All athletes",
  description: "Browse every athlete on Topdraft. Tap any one to start trading.",
};

export default function AppHomePage() {
  const athletes = Object.values(ATHLETES);
  return <AppHomeClient athletes={athletes} />;
}
