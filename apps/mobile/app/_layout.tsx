import { useEffect, useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

/**
 * Watches Supabase auth state and redirects based on whether the user
 * is signed in or not. This fires on every auth change (login, logout,
 * token refresh) — so navigation always reflects the real session state.
 */
function useAuthRedirect(session: Session | null, ready: boolean) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabs = segments[0] === "(tabs)";

    if (session && !inTabs) {
      // User is signed in — send to tabs
      router.replace("/(tabs)");
    } else if (!session && !inAuthGroup && segments[0] !== undefined) {
      // User is signed out and not on a public screen — send to welcome
      router.replace("/");
    }
  }, [session, ready, segments, router]);
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Restore any persisted session from SecureStore
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
    });

    // 2. Listen for future auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useAuthRedirect(session, ready);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Image source={require("../assets/icon.png")} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator size="large" color="#379df9" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#eff8ff" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#eff8ff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
});
