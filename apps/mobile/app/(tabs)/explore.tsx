import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const ZONES = [
  { id: "about-me", name: "My Home", emoji: "👋", theme: "About Me", free: true, stars: 0, bg: "#fff0f3", border: "#ffc6d6" },
  { id: "others-in-my-world", name: "Village Square", emoji: "👨‍👩‍👧‍👦", theme: "Others in My World", free: false, stars: 5, bg: "#eff8ff", border: "#bee4ff" },
  { id: "food", name: "The Farm", emoji: "🍎", theme: "My Needs – Food", free: false, stars: 10, bg: "#fff0f3", border: "#ffc6d6" },
  { id: "water", name: "The River", emoji: "💧", theme: "My Needs – Water", free: false, stars: 15, bg: "#eff8ff", border: "#bee4ff" },
  { id: "shelter", name: "Builder's Yard", emoji: "🏠", theme: "My Need – Shelter", free: false, stars: 20, bg: "#fffbeb", border: "#ffe588" },
  { id: "clothing", name: "The Wardrobe", emoji: "👕", theme: "My Need – Clothing", free: false, stars: 25, bg: "#fff0f3", border: "#ffc6d6" },
  { id: "air", name: "Sky Park", emoji: "🌬️", theme: "My Need – Air", free: false, stars: 30, bg: "#eff8ff", border: "#bee4ff" },
  { id: "health-safety", name: "Health Center", emoji: "🏥", theme: "Keeping Clean & Safe", free: false, stars: 35, bg: "#edfcf2", border: "#aceec2" },
  { id: "neighbourhood", name: "Town Walk", emoji: "🏘️", theme: "Places Nearby", free: false, stars: 40, bg: "#fffbeb", border: "#ffe588" },
  { id: "plants", name: "Magic Garden", emoji: "🌱", theme: "Plants", free: true, stars: 0, bg: "#edfcf2", border: "#aceec2" },
  { id: "animals", name: "Animal Park", emoji: "🐾", theme: "Animals", free: true, stars: 0, bg: "#fffbeb", border: "#ffe588" },
  { id: "transport", name: "The Station", emoji: "🚂", theme: "Transport", free: false, stars: 50, bg: "#eff8ff", border: "#bee4ff" },
  { id: "communication", name: "Post Office", emoji: "📬", theme: "Communication", free: false, stars: 55, bg: "#fff0f3", border: "#ffc6d6" },
  { id: "sun-moon-stars", name: "Star Tower", emoji: "⭐", theme: "Sun, Moon & Stars", free: false, stars: 60, bg: "#fffbeb", border: "#ffe588" },
  { id: "time-space-direction", name: "Clock Tower", emoji: "🕐", theme: "Time & Direction", free: false, stars: 65, bg: "#edfcf2", border: "#aceec2" },
];

export default function ExploreTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🗺️ Adventure Village</Text>
        <Text style={styles.subtitle}>Explore zones and play learning games!</Text>

        <View style={styles.grid}>
          {ZONES.map((zone, index) => {
            const isLeft = index % 2 === 0;
            return (
              <Pressable
                key={zone.id}
                style={[
                  styles.card,
                  { backgroundColor: zone.free ? zone.bg : "#f3f4f6", borderColor: zone.free ? zone.border : "#e5e7eb", alignSelf: isLeft ? "flex-start" : "flex-end" },
                ]}
                onPress={() => zone.free && router.push(("/zone/" + zone.id) as never)}
                disabled={!zone.free}
              >
                {!zone.free && <Text style={styles.lock}>🔒</Text>}
                <Text style={styles.emoji}>{zone.emoji}</Text>
                <Text style={[styles.name, !zone.free && { color: "#9ca3af" }]}>{zone.name}</Text>
                <Text style={styles.theme} numberOfLines={1}>{zone.theme}</Text>
                {zone.free ? (
                  <View style={styles.freeBadge}><Text style={styles.freeText}>FREE</Text></View>
                ) : (
                  <Text style={styles.unlockText}>⭐ {zone.stars} to unlock</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eff8ff" },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: "800", color: "#1c498c", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#6b7280", textAlign: "center", marginTop: 4, marginBottom: 24 },
  grid: { gap: 8 },
  card: { width: CARD_WIDTH, padding: 16, borderRadius: 20, borderWidth: 2, alignItems: "center", position: "relative" },
  lock: { position: "absolute", top: 8, right: 8, fontSize: 14 },
  emoji: { fontSize: 36, marginBottom: 6 },
  name: { fontSize: 15, fontWeight: "700", color: "#374151", textAlign: "center" },
  theme: { fontSize: 11, color: "#9ca3af", marginTop: 2, textAlign: "center" },
  freeBadge: { marginTop: 8, backgroundColor: "#d4f7de", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  freeText: { fontSize: 10, fontWeight: "800", color: "#0a713b" },
  unlockText: { marginTop: 8, fontSize: 11, fontWeight: "600", color: "#9ca3af" },
});
