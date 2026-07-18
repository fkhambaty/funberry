import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const FALLBACK_URL = "https://tkuakihsswzhrcrqcqel.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdWFraWhzc3d6aHJjcnFjcWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTQ2MTksImV4cCI6MjA5OTkzMDYxOX0.ULwIeYXyF79MrZR9ultc5wXbAACP1x8fbobpKBdvVug";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      return null as unknown as SupabaseClient<Database>;
    }
    throw new Error("Supabase URL and Anon Key must be set in environment variables");
  }
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) return () => ({ data: null, error: { message: "Supabase not configured" } });
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient<Database>(url, anonKey);
}
