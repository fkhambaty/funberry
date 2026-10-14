import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";
import {
  embedUrl,
  encodeNativeInit,
  isAllowedEmbedUrl,
  parseEmbedMessage,
  type EmbedErrorCode,
} from "@funberry/game-engine/src/embed/bridge";
import { requestPlayTicket } from "../../lib/api";
import { WEB_ORIGIN } from "../../lib/env";
import { colors, space, type } from "../../lib/theme";
import { Button } from "../ui";

const ERROR_COPY: Record<EmbedErrorCode | "busy" | "signed_out", string> = {
  ticket_invalid: "This game needs to be opened again.",
  ticket_used: "This round is already saved.",
  locked: "This game is still locked.",
  unknown_game: "We could not find this game.",
  load_failed: "This game could not load.",
  network: "FunBerry could not be reached. Check the internet and try again.",
  busy: "Too many games are open. Close one and try again.",
  signed_out: "Please sign in again.",
};

type Phase =
  | { kind: "loading" }
  | { kind: "playing"; ticket: string }
  | { kind: "saved"; stars: number | null }
  | { kind: "error"; message: string };

/**
 * One allowlisted web game. The page receives a single-use play ticket, never the
 * parent session, and the Worker checks the game is unlocked before saving stars.
 */
export function WebGame({
  gameId,
  childId,
  onExit,
  onSaved,
}: {
  gameId: string;
  childId: string;
  onExit: () => void;
  onSaved: () => void;
}) {
  const web = useRef<WebView>(null);
  const issued = useRef(false);
  const ticketRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const page = embedUrl(WEB_ORIGIN, gameId);

  function sendTicket() {
    const ticket = ticketRef.current;
    if (!ticket || !readyRef.current) return;
    const script = `window.dispatchEvent(new MessageEvent("message",{data:${JSON.stringify(encodeNativeInit(gameId, ticket))}})); true;`;
    web.current?.injectJavaScript(script);
  }

  async function issue() {
    const result = await requestPlayTicket(childId, gameId);
    if (!result.ok) {
      setPhase({ kind: "error", message: ERROR_COPY[result.reason === "unknown" ? "unknown_game" : result.reason] });
      return;
    }
    ticketRef.current = result.ticket;
    setPhase({ kind: "playing", ticket: result.ticket });
    sendTicket();
  }

  function onMessage(event: WebViewMessageEvent) {
    const message = parseEmbedMessage(event.nativeEvent.data, gameId);
    if (!message) return;
    if (message.type === "ready") {
      readyRef.current = true;
      sendTicket();
    } else if (message.type === "error") {
      setPhase({ kind: "error", message: ERROR_COPY[message.code] });
    } else if (message.type === "exit") {
      onExit();
    } else if (message.type === "complete") {
      if (message.saved) onSaved();
      setPhase({ kind: "saved", stars: message.saved?.stars_credited ?? null });
    }
  }

  function allow(request: WebViewNavigation) {
    return request.url === "about:blank" || isAllowedEmbedUrl(request.url, WEB_ORIGIN, gameId);
  }

  if (!page) {
    return <Text style={type.body}>This game link is not available.</Text>;
  }

  if (phase.kind === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>{phase.message}</Text>
        <Button
          label="Try again"
          onPress={() => {
            issued.current = false;
            ticketRef.current = null;
            readyRef.current = false;
            setPhase({ kind: "loading" });
            setAttempt((value) => value + 1);
          }}
        />
        <Button variant="ghost" label="Back to games" onPress={onExit} />
      </View>
    );
  }

  if (phase.kind === "saved") {
    return (
      <View style={styles.center}>
        <Text style={type.hero}>⭐</Text>
        <Text style={type.heading}>{phase.stars && phase.stars > 0 ? `${phase.stars} new stars saved` : "Round saved"}</Text>
        <Button kid label="Back to games" onPress={onExit} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <WebView
        key={attempt}
        ref={web}
        source={{ uri: page }}
        originWhitelist={[WEB_ORIGIN]}
        onLoadStart={() => {
          if (issued.current) return;
          issued.current = true;
          void issue();
        }}
        onShouldStartLoadWithRequest={allow}
        onNavigationStateChange={(state) => {
          if (!allow(state)) web.current?.stopLoading();
        }}
        onMessage={onMessage}
        onError={() => setPhase({ kind: "error", message: ERROR_COPY.network })}
        javaScriptEnabled
        domStorageEnabled={false}
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={false}
        allowsBackForwardNavigationGestures={false}
        style={styles.fill}
      />
      {phase.kind === "loading" ? (
        <View style={styles.loading} accessibilityLabel="Getting the game ready">
          <ActivityIndicator size="large" color={colors.sky[500]} />
          <Text style={type.body}>Getting the game ready…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.lg, padding: space.xl },
  message: { fontSize: 20, fontWeight: "800", color: colors.ink[900], textAlign: "center" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: space.md,
    backgroundColor: colors.sky[50],
  },
});
