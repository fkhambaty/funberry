import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function ProfileTab() {
  const router = useRouter();

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            // Navigation is handled by the auth listener in _layout.tsx
          },
        },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>👤 Parent Profile</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Plan</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          </View>
          <Pressable style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>
              ✨ Upgrade to Premium
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Children</Text>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Manage Child Profiles</Text>
            <Text style={styles.menuArrow}>→</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Progress Reports</Text>
            <Text style={styles.menuArrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>→</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Text style={styles.menuArrow}>→</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Terms of Service</Text>
            <Text style={styles.menuArrow}>→</Text>
          </Pressable>
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>FunBerry v1.0.0</Text>
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
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: { fontSize: 15, color: "#6b7280" },
  freeBadge: {
    backgroundColor: "#d4f7de",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeText: { fontSize: 12, fontWeight: "800", color: "#0a713b" },
  upgradeButton: {
    backgroundColor: "#fffbeb",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffe588",
  },
  upgradeText: { fontSize: 15, fontWeight: "700", color: "#7a340d" },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuText: { fontSize: 15, color: "#374151" },
  menuArrow: { fontSize: 16, color: "#9ca3af" },
  signOutButton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: { fontSize: 15, fontWeight: "700", color: "#b91c1c" },
  version: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 24,
  },
});
