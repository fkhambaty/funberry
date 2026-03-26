import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getZoneById, colors } from "@funberry/config";

const colorBg: Record<string, { bg: string; border: string }> = {
  berry: { bg: "#fff0f3", border: "#ffc6d6" },
  leaf: { bg: "#edfcf2", border: "#aceec2" },
  sky: { bg: "#eff8ff", border: "#bee4ff" },
  sunshine: { bg: "#fffbeb", border: "#ffe588" },
};

export default function ZoneDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const zone = getZoneById(id ?? "");

  if (!zone) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Zone not found</Text>
      </SafeAreaView>
    );
  }

  const c = colorBg[zone.colorKey];

  // Placeholder games for the zone
  const placeholderGames = [
    { id: "1", title: `${zone.name} Quiz`, type: "picture_quiz", emoji: "❓" },
    { id: "2", title: `${zone.name} Sort`, type: "drag_sort", emoji: "🎯" },
    { id: "3", title: `${zone.name} Match`, type: "memory_match", emoji: "🃏" },
    { id: "4", title: `${zone.name} Sequence`, type: "sequence_builder", emoji: "📋" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* Zone header */}
        <View style={[styles.header, { backgroundColor: c.bg, borderColor: c.border }]}>
          <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <Text style={styles.zoneTheme}>{zone.evsTheme}</Text>
          <Text style={styles.zoneDesc}>{zone.description}</Text>
        </View>

        {/* Games list */}
        <Text style={styles.gamesTitle}>Games</Text>
        <View style={styles.gamesList}>
          {placeholderGames.map((game, index) => (
            <Pressable
              key={game.id}
              style={styles.gameCard}
              onPress={() =>
                router.push(`/game/${zone.id}-${game.id}` as never)
              }
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameType}>
                  {game.type.replace(/_/g, " ")}
                </Text>
              </View>
              <View style={styles.starsRow}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.starCount}>0/3</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eff8ff" },
  content: { padding: 20, paddingBottom: 60 },
  backButton: { marginBottom: 12 },
  backText: { fontSize: 16, fontWeight: "700", color: "#379df9" },
  header: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  zoneEmoji: { fontSize: 56, marginBottom: 8 },
  zoneName: { fontSize: 26, fontWeight: "800", color: "#1c498c" },
  zoneTheme: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  zoneDesc: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  gamesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1c498c",
    marginBottom: 12,
  },
  gamesList: { gap: 12 },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 14,
  },
  gameEmoji: { fontSize: 32 },
  gameInfo: { flex: 1 },
  gameTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
  gameType: { fontSize: 12, color: "#9ca3af", marginTop: 2, textTransform: "capitalize" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  starIcon: { fontSize: 14 },
  starCount: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  errorText: {
    fontSize: 18,
    color: "#b91c1c",
    textAlign: "center",
    marginTop: 40,
  },
});
