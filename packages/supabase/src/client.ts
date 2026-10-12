import { accountAuth } from "./account";

/**
 * Website and mobile screens still call `supabase.auth`.
 * Those calls use the Cloudflare account service.
 * Table queries do not go through this object.
 */
export const supabase = {
  auth: accountAuth,
};

export function createSupabaseClient(_url?: string, _anonKey?: string) {
  return supabase;
}
