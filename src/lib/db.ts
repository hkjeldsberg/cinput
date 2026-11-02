import "server-only";
import { createClient } from "@supabase/supabase-js";

function make() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key, {
    db: { schema: "cinput" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let client: ReturnType<typeof make> | undefined;

/** Service-role client scoped to the `cinput` schema. Server only. */
export function db() {
  return (client ??= make());
}

/** Unwrap a Supabase result or throw. Row shapes are typed by the caller. */
export function must<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}
