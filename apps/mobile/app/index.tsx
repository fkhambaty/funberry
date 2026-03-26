import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Text style={styles.logoEmoji}>🍓</Text>
        <Text style={styles.title}>FunBerry</Text>
        <Text style={styles.tagline}>Learn through play — fun games for curious little minds!</Text>
      </View>

      <View style={styles.buttonSection}>
        <Pressable
          style={[styles.button, { backgroundColor: "#ff2d6a" }]}
          onPress={() => router.push("/auth/login" as never)}
        >
          <Text style={styles.buttonText}>Parent Login</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: "#18b05a" }]}
          onPress={() => router.push("/auth/signup" as never)}
        >
          <Text style={styles.buttonText}>Get Started Free</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#eff8ff",
  },
  logoSection: { alignItems: "center", marginBottom: 64 },
  logoEmoji: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 42, fontWeight: "800", color: "#1c498c", letterSpacing: -1 },
  tagline: { fontSize: 16, color: "#6b7280", marginTop: 8, textAlign: "center", lineHeight: 24 },
  buttonSection: { width: "100%", gap: 16 },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonText: { color: "white", fontSize: 20, fontWeight: "700" },
});
