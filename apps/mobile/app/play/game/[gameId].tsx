import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEncouragementMessage } from "@funberry/game-engine/src/core/scoring";
import type { GameResult } from "@funberry/game-engine/src/types";
import { saveProgress } from "@funberry/supabase";
import { NativeRound } from "../../../components/games/NativeRound";
import { WebGame } from "../../../components/games/WebGame";
import { Button, Notice, Screen } from "../../../components/ui";
import { accessFor, deliveryFor, findGame } from "../../../lib/catalog";
import { messageOf } from "../../../lib/api";
import { isPaid } from "../../../lib/plan";
import { useActiveChild, useSession } from "../../../lib/session";
import { space, type } from "../../../lib/theme";

export default function GameScreen() {
  const router = useRouter();
  const { gameId = "" } = useLocalSearchParams<{ gameId: string }>();
  const game = findGame(gameId);
  const child = useActiveChild();
  const { parent, refresh } = useSession();
  const [result, setResult] = useState<GameResult | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const savedRound = useRef(-1);

  if (!game || !child) {
    return (
      <Screen kid>
        <Notice text={child ? "That game is not on this device." : "Pick who is playing first."} />
        <Button label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const access = accessFor(game, isPaid(parent), child.total_stars);
  if (!access.allowed) {
    const text =
      access.reason === "stars"
        ? `This world opens after ${access.starsNeeded} more stars.`
        : access.reason === "premium"
          ? "This game is not open on the current plan. Free games stay here."
          : "That game is not available.";
    return (
      <Screen kid>
        <Notice tone="sunshine" text={text} />
        <Button kid label="Back to games" onPress={() => router.back()} />
      </Screen>
    );
  }

  async function finish(next: GameResult) {
    if (savedRound.current === round) return;
    savedRound.current = round;
    setResult(next);
    try {
      const saved = await saveProgress(child!.id, game!.id, next.starsEarned, next.score, next.timeSpent);
      setSaveNote(saved.stars_credited > 0 ? `${saved.stars_credited} new stars saved.` : "Saved. This was already your best.");
      await refresh();
    } catch (error) {
      savedRound.current = -1;
      setSaveNote(messageOf(error, "Stars could not be saved. You can play the round again."));
    }
  }

  if (result) {
    return (
      <Screen kid contentStyle={styles.result}>
        <Text style={styles.stars}>{"⭐".repeat(Math.max(1, result.starsEarned))}</Text>
        <Text style={type.heading}>{getEncouragementMessage(result.starsEarned)}</Text>
        {saveNote ? <Notice tone={saveNote.includes("could not") ? "berry" : "leaf"} text={saveNote} /> : null}
        <Button
          kid
          label="Play again"
          onPress={() => {
            savedRound.current = -1;
            setResult(null);
            setSaveNote(null);
            setRound((value) => value + 1);
          }}
        />
        <Button kid variant="ghost" label="Back to games" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (deliveryFor(game.type) === "web") {
    return (
      <View style={styles.fill}>
        <WebGame gameId={game.id} childId={child.id} onExit={() => router.back()} onSaved={() => void refresh()} />
      </View>
    );
  }

  return (
    <Screen kid>
      <Button variant="ghost" label="Leave game" onPress={() => router.back()} />
      <NativeRound key={round} game={game} onComplete={(next) => void finish(next)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  result: { flexGrow: 1, justifyContent: "center", alignItems: "center", gap: space.lg },
  stars: { fontSize: 48 },
});
