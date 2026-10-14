import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Loading } from "../components/ui";
import { redirectFor } from "../lib/routing";
import { SessionProvider, useSession } from "../lib/session";
import { colors } from "../lib/theme";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const { status, mode } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const target = redirectFor(status, mode, segments);

  useEffect(() => {
    if (status !== "loading") void SplashScreen.hideAsync().catch(() => undefined);
  }, [status]);

  useEffect(() => {
    if (target) router.replace(target as never);
  }, [target, router]);

  if (status === "loading") return <Loading label="Opening FunBerry Kids…" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
        animation: "slide_from_right",
        gestureEnabled: mode.kind === "parent",
      }}
    >
      <Stack.Screen name="play/gate" options={{ presentation: "modal", gestureEnabled: true }} />
      <Stack.Screen name="play/game/[gameId]" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Navigator />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
