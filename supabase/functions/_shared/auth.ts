// Caller identity for user-invoked edge functions.
// Resolves the Supabase user from the request's Authorization header; null when absent or invalid.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function getCallerUserId(req: Request): Promise<string | null> {
  const authorization = req.headers.get("Authorization");
  if (!authorization) return null;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authorization } } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user.id;
}
