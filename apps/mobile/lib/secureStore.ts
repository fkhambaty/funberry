import * as SecureStore from "expo-secure-store";
import { setSessionStore } from "@funberry/supabase";

/** Keychain / Keystore only, never synced to another device or included in backups. */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStore = {
  getItem: (key: string) => SecureStore.getItemAsync(key, OPTIONS),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value, OPTIONS),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key, OPTIONS),
};

let installed = false;

/** The account client keeps the Worker bearer token in this store instead of memory. */
export function installSecureSessionStore() {
  if (installed) return;
  setSessionStore(secureStore);
  installed = true;
}
