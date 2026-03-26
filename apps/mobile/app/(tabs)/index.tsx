import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Inlined to avoid any shared-package transformation issues in release build
const FREE_ZONES = [
  { id: "about-me", name: "My Home", emoji: "👋", bg: "#fff0f3", border: "#ffc6d6" },
  { id: "plants", name: "Magic Garden", emoji: "🌱", bg: "#edfcf2", border: "#aceec2" },
  { id: "animals", name: "Animal Park", emoji: "🐾", bg: "#fffbeb", border: "#ffe588" },
];

export default function HomeTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi there! 👋</Text>
            <Text style={styles.title}>Ready to learn?</Text>
          </View>
          <View style={styles.starBadge}>
            <Text style={styles.starText}>⭐ 0</Text>
          </View>
        </View>

        {/* Free Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Playing 🎮</Text>
          <View style={styles.zoneGrid}>
            {FREE_ZONES.map((zone) => (
              <Pressable
                key={zone.id}
                style={[styles.zoneCard, { backgroundColor: zone.bg, borderColor: zone.border }]}
                onPress={() => router.push(("/zone/" + zone.id) as never)}
              >
                <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeText}>FREE</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Explore all zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Zones</Text>
          <Pressable
            style={styles.exploreButton}
            onPress={() => router.push("/(tabs)/explore" as never)}
          >
            <Text style={styles.exploreEmoji}>🗺️</Text>
            <Text style={styles.exploreText}>Explore the Village Map</Text>
            <Text style={styles.exploreArrow}>→</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eff8ff" },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { fontSize: 16, color: "#6b7280" },
  title: { fontSize: 28, fontWeight: "800", color: "#1c498c" },
  starBadge: {
    backgroundColor: "#fffbeb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffe588",
  },
  starText: { fontSize: 16, fontWeight: "700", color: "#7a340d" },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1c498c", marginBottom: 12 },
  zoneGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  zoneCard: {
    width: "30%",
    flexGrow: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
  },
  zoneEmoji: { fontSize: 36, marginBottom: 8 },
  zoneName: { fontSize: 13, fontWeight: "700", color: "#374151", textAlign: "center" },
  freeBadge: {
    marginTop: 8,
    backgroundColor: "#d4f7de",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freeText: { fontSize: 10, fontWeight: "800", color: "#0a713b" },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#bee4ff",
    gap: 12,
  },
  exploreEmoji: { fontSize: 32 },
  exploreText: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1c498c" },
  exploreArrow: { fontSize: 20, color: "#379df9", fontWeight: "700" },
});
