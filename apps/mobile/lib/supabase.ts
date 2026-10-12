/**
 * Mobile session storage. The account service is the same Cloudflare worker
 * the website uses. SecureStore keeps the token across app restarts.
 */
import * as SecureStore from "expo-secure-store";
import { setSessionStore, supabase } from "@funberry/supabase";

setSessionStore({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

export { supabase };
export type { Database } from "@funberry/supabase";
