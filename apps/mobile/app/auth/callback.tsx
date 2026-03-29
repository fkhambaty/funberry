import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { trySendWelcomeEmailAfterAuth } from "@funberry/supabase";
import { supabase } from "../../lib/supabase";

function parseTokensFromUrl(url: string): { access_token: string; refresh_token: string } | null {
  const hash = url.includes("#") ? url.split("#")[1] : "";
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

async function finishFromUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  const tokens = parseTokensFromUrl(url);
  if (!tokens) return "Invalid link — open the button from your confirmation email again.";
  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
  if (error) return error.message;
  await trySendWelcomeEmailAfterAuth(supabase);
  await supabase.auth.signOut();
  return null;
}

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const initial = await Linking.getInitialURL();
      const err = await finishFromUrl(initial);
      if (cancelled) return;
      if (err) {
        setStatus(err);
        return;
      }
      if (initial && parseTokensFromUrl(initial)) {
        router.replace("/auth/login?verified=1" as never);
        return;
      }
      setStatus("Open this screen from the link in your email.");
    })();

    const sub = Linking.addEventListener("url", async (event) => {
      const err = await finishFromUrl(event.url);
      if (cancelled) return;
      if (err) {
        setStatus(err);
        return;
      }
      router.replace("/auth/login?verified=1" as never);
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color="#2180ee" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#eff8ff",
  },
  text: { marginTop: 16, textAlign: "center", color: "#374151", fontSize: 16 },
});
