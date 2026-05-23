import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Use in Route Handlers, Server Actions, and Server Components.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    env.get().NEXT_PUBLIC_SUPABASE_URL,
    env.get().NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: CookieOptions }[]) => {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses RLS. Server-only. Never expose to client.
 * Use sparingly: webhooks, admin scripts, places that need cross-user writes.
 */
export function getServiceSupabase() {
  return createClient(env.get().NEXT_PUBLIC_SUPABASE_URL, env.get().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
