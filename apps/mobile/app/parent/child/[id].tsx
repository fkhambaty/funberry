import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getChildProgress, getWeeklySummary, type Progress, type WeeklySummary } from "@funberry/supabase";
import { Card, Header, Notice, Screen, StarChip } from "../../../components/ui";
import { findGame } from "../../../lib/catalog";
import { useSession } from "../../../lib/session";
import { colors, space, type } from "../../../lib/theme";

export default function ChildProgressScreen() {
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { childList } = useSession();
  const child = childList.find((entry) => entry.id === id) ?? null;
  const [rows, setRows] = useState<Progress[] | null>(null);
  const [week, setWeek] = useState<WeeklySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [progress, summary] = await Promise.all([getChildProgress(id), getWeeklySummary(id)]);
      setRows(progress);
      setWeek(summary);
    } catch {
      setError("Progress could not be loaded.");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        void load().finally(() => setRefreshing(false));
      }}
    >
      <Header
        title={child ? child.name : "Child"}
        subtitle={child ? `Age ${child.age}` : undefined}
        onBack={() => router.back()}
        right={child ? <StarChip stars={child.total_stars} /> : null}
      />
      {!child ? <Notice text="This child is no longer on the account." /> : null}
      {error ? <Notice role="alert" tone="berry" text={error} /> : null}
      {week ? (
        <Card tone="sky">
          <Text style={type.heading}>This week</Text>
          <Text style={type.body}>
            {week.rounds} rounds · {week.distinct_games} games · {week.stars_credited} new stars
          </Text>
          <Text style={styles.meta}>
            {week.period_start} to {week.period_end}
          </Text>
        </Card>
      ) : null}
      {(rows ?? []).map((row) => {
        const game = findGame(row.game_id);
        return (
          <View key={row.id} style={styles.row}>
            <View style={styles.copy}>
              <Text style={type.heading}>{game?.title ?? "Game"}</Text>
              <Text style={styles.meta}>Best score {row.score} · {row.attempts} plays</Text>
            </View>
            <Text style={styles.stars}>{"⭐".repeat(row.stars_earned || 0) || "—"}</Text>
          </View>
        );
      })}
      {rows && rows.length === 0 ? <Notice text="No finished rounds yet." /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.sm,
  },
  copy: { flex: 1 },
  meta: { color: colors.ink[500], fontWeight: "700", marginTop: 2 },
  stars: { fontSize: 16 },
});
