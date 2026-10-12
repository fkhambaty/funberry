import type { SupabaseClient } from "@supabase/supabase-js";
import { accountAuth } from "./account";
import type { Database } from "./types";

/**
 * Website and mobile screens still call `supabase.auth`.
 * Those calls now use the Cloudflare account service.
 * Table queries do not go through this object.
 */
export const supabase = {
  auth: accountAuth,
} as unknown as SupabaseClient<Database>;

export function createSupabaseClient(_url: string, _anonKey: string) {
  return supabase;
}
