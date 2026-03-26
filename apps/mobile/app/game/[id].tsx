import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GamePlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "0%" }]} />
            </View>
          </View>
          <View style={styles.starDisplay}>
            <Text style={styles.starDisplayText}>⭐ 0</Text>
          </View>
        </View>

        {/* Game area - placeholder */}
        <View style={styles.gameArea}>
          <Text style={styles.gameEmoji}>🎮</Text>
          <Text style={styles.gameTitle}>Game: {id}</Text>
          <Text style={styles.gameHint}>
            Game content will be loaded here based on the game template and
            configuration.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 18, fontWeight: "700", color: "#6b7280" },
  progressWrap: { flex: 1 },
  progressTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    backgroundColor: "#379df9",
    borderRadius: 4,
  },
  starDisplay: {
    backgroundColor: "#fffbeb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  starDisplayText: { fontSize: 14, fontWeight: "700", color: "#7a340d" },
  gameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  gameEmoji: { fontSize: 64, marginBottom: 16 },
  gameTitle: { fontSize: 22, fontWeight: "700", color: "#1c498c" },
  gameHint: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
