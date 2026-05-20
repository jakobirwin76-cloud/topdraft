/**
 * RLS coverage matrix — runs against a local Supabase instance.
 * Skipped automatically when SUPABASE_LOCAL_URL is not set, so unit-test CI
 * keeps passing on machines that don't have Docker.
 *
 * To run locally:
 *   1. supabase start
 *   2. supabase db reset --local
 *   3. SUPABASE_LOCAL_URL=http://127.0.0.1:54321 \
 *      SUPABASE_LOCAL_ANON=...local_anon... \
 *      SUPABASE_LOCAL_SERVICE=...local_service... \
 *      pnpm vitest tests/security
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_LOCAL_URL;
const ANON = process.env.SUPABASE_LOCAL_ANON;
const SERVICE = process.env.SUPABASE_LOCAL_SERVICE;
const enabled = Boolean(URL && ANON && SERVICE);

const d = enabled ? describe : describe.skip;

d("RLS · profiles", () => {
  let alice: SupabaseClient;
  let bob: SupabaseClient;
  let aliceId: string;
  let bobId: string;
  let admin: SupabaseClient;

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, { auth: { persistSession: false } });
    aliceId = await ensureUser(admin, "alice@test.dev", "Alice", "1990-01-01", "CA");
    bobId = await ensureUser(admin, "bob@test.dev",   "Bob",   "1990-01-01", "CA");
    alice = await signedInClient(URL!, ANON!, "alice@test.dev");
    bob   = await signedInClient(URL!, ANON!, "bob@test.dev");
  });

  it("owner can read self", async () => {
    const { data, error } = await alice.from("profiles").select("user_id").eq("user_id", aliceId).single();
    expect(error).toBeNull();
    expect(data?.user_id).toBe(aliceId);
  });

  it("non-owner cannot read other profile rows", async () => {
    const { data } = await bob.from("profiles").select("user_id").eq("user_id", aliceId);
    expect(data ?? []).toEqual([]);
  });

  it("user cannot update virtual_balance directly (column grant denies it)", async () => {
    const { error } = await alice.from("profiles").update({ virtual_balance: 999_999 }).eq("user_id", aliceId);
    expect(error).toBeTruthy();
  });
});

d("RLS · trades", () => {
  let alice: SupabaseClient;
  let bob: SupabaseClient;

  beforeAll(async () => {
    alice = await signedInClient(URL!, ANON!, "alice@test.dev");
    bob   = await signedInClient(URL!, ANON!, "bob@test.dev");
  });

  it("user cannot insert trades directly (no insert policy)", async () => {
    const { error } = await alice.from("trades").insert({
      athlete_id: "00000000-0000-0000-0000-000000000000",
      side: "buy",
      shares: 1,
      price: 1,
      total_cost: 1,
      user_id: "00000000-0000-0000-0000-000000000000",
    });
    expect(error).toBeTruthy();
  });

  it("user cannot read another user's trades", async () => {
    const { data } = await bob.from("trades").select("id");
    expect(data ?? []).toEqual([]);
  });
});

d("RLS · chat_messages", () => {
  let alice: SupabaseClient;

  beforeAll(async () => {
    alice = await signedInClient(URL!, ANON!, "alice@test.dev");
  });

  it("authenticated read is allowed", async () => {
    const { error } = await alice.from("chat_messages").select("id").limit(1);
    expect(error).toBeNull();
  });

  it("anonymous read is denied", async () => {
    const anon = createClient(URL!, ANON!);
    const { error } = await anon.from("chat_messages").select("id");
    expect(error).toBeTruthy();
  });
});

// =============================================================================
// helpers
// =============================================================================

async function ensureUser(
  admin: SupabaseClient,
  email: string,
  displayName: string,
  dob: string,
  state: string,
): Promise<string> {
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email === email);
  if (found) return found.id;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "Strong-passw0rd!!",
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");
  await admin.from("profiles").insert({
    user_id: data.user.id,
    display_name: displayName,
    date_of_birth: dob,
    state_code: state,
  });
  return data.user.id;
}

async function signedInClient(url: string, anon: string, email: string): Promise<SupabaseClient> {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: "Strong-passw0rd!!" });
  if (error) throw error;
  return c;
}
