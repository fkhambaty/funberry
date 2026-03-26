import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RewardsTab() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🏆 My Rewards</Text>
        <Text style={styles.subtitle}>
          Earn stickers, badges, and costumes by playing games!
        </Text>

        {/* Placeholder sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stickers</Text>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyText}>
              Play games to earn your first sticker!
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎖️</Text>
            <Text style={styles.emptyText}>
              Complete a zone to earn a badge!
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Costumes</Text>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>👑</Text>
            <Text style={styles.emptyText}>
              Collect stars to unlock cool costumes!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eff8ff" },
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1c498c",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c498c",
    marginBottom: 10,
  },
  emptyBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#9ca3af", textAlign: "center" },
});
