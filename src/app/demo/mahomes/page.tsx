import { redirect } from "next/navigation";

// Old demo URL — redirects to the canonical athlete page so existing links
// (screenshots, social posts, group chats) don't 404.
export default function DemoMahomesRedirect() {
  redirect("/athlete/mahomes");
}
