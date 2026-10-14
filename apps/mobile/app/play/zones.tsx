import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getChildBestProgress } from "@funberry/supabase";
import { Header, Screen, StarChip } from "../../components/ui";
import { playZones, zoneProgress } from "../../lib/catalog";
import { useActiveChild, useSession } from "../../lib/session";
import { colors, radius, space, tap, toneColors, type } from "../../lib/theme";

export default function ZonesScreen() {
  const router = useRouter();
  const child = useActiveChild();
  const { childList, refresh } = useSession();
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!child) return;
    let live = true;
    void getChildBestProgress(child.id).then((rows) => {
      if (live) setBest(rows);
    });
    return () => {
      live = false;
    };
  }, [child]);

  const playing = child ?? childList.find((entry) => entry.id) ?? null;

  return (
    <Screen kid>
      <Header
        title={playing ? `${playing.name}'s worlds` : "Worlds"}
        onBack={() => router.replace("/play")}
        backLabel="Switch player"
        right={
          <View style={styles.tools}>
            {playing ? <StarChip stars={playing.total_stars} /> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Rewards" onPress={() => router.push("/play/rewards")} style={styles.tool}>
              <Text style={styles.toolText}>🎁</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Grown-ups" onPress={() => router.push("/play/gate")} style={styles.tool}>
              <Text style={styles.toolText}>🔒</Text>
            </Pressable>
          </View>
        }
      />
      <View style={styles.grid}>
        {playZones.map((zone) => {
          const tone = toneColors(zone.colorKey);
          const progress = zoneProgress(zone.id, best);
          return (
            <Pressable
              key={zone.id}
              accessibilityRole="button"
              accessibilityLabel={`${zone.name}. ${progress.earned} of ${progress.possible} stars.`}
              onPress={() => router.push({ pathname: "/play/zone/[zoneId]", params: { zoneId: zone.id } })}
              style={({ pressed }) => [styles.zone, { backgroundColor: tone.soft, borderColor: tone.border, opacity: pressed ? 0.85 : 1 }]}
            >
              {zone.badge ? <Text style={styles.badge}>{zone.badge}</Text> : null}
              <Text style={styles.emoji}>{zone.emoji}</Text>
              <Text style={styles.name}>{zone.name}</Text>
              <Text style={styles.meta}>{progress.games} games</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Refresh stars" onPress={() => void refresh()} style={styles.refresh}>
        <Text style={type.small}>Stars save when a round finishes.</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tools: { flexDirection: "row", alignItems: "center", gap: space.sm },
  tool: {
    width: tap.min,
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.sky[200],
  },
  toolText: { fontSize: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  zone: {
    width: "47%",
    minHeight: 148,
    borderRadius: radius.lg,
    borderWidth: 3,
    padding: space.md,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.sky[700],
    color: colors.white,
    overflow: "hidden",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "900",
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 16, fontWeight: "900", color: colors.ink[900], textAlign: "center" },
  meta: { fontSize: 13, fontWeight: "700", color: colors.ink[500] },
  refresh: { minHeight: tap.min, alignItems: "center", justifyContent: "center" },
});
