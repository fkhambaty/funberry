import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

const LEAF = "#18b05a";
const APP_NAME = "FunBerry";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      // 1. Create auth user
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      // 2. Insert parent row
      if (data.user) {
        await supabase.from("parents").insert({
          id: data.user.id,
          email,
          name,
        } as never);
      }
      // Explicit navigation — don't rely solely on the auth state listener
      router.replace("/(tabs)");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.emoji}>🍓</Text>
        <Text style={styles.title}>Join {APP_NAME}</Text>
        <Text style={styles.subtitle}>
          Create a free account to start learning!
        </Text>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (6+ characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />

          <Pressable
            style={[styles.button, { backgroundColor: LEAF }, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account..." : "Create Free Account"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/auth/login" as never)}>
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkBold}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eff8ff" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  emoji: { fontSize: 60, textAlign: "center", marginBottom: 8 },
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
    marginBottom: 32,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: "#111827",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { color: "#b91c1c", fontSize: 14 },
  link: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  linkBold: { color: "#2180ee", fontWeight: "700" },
});
