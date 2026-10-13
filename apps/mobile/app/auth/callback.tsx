import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState(
    "FunBerry now confirms accounts with a 6-digit code. Return to sign up and enter the code from your email."
  );

  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (!url) setStatus("Open Sign Up to request a fresh 6-digit confirmation code.");
    });
    const sub = Linking.addEventListener("url", () => {
      setStatus("This old confirmation link is no longer used. Enter the 6-digit email code on Sign Up.");
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>📧</Text>
      <Text style={styles.text}>{status}</Text>
      <Pressable style={styles.button} onPress={() => router.replace("/auth/signup" as never)}>
        <Text style={styles.buttonText}>Go to Sign Up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#eff8ff",
  },
  icon: { fontSize: 52, marginBottom: 16 },
  text: { textAlign: "center", color: "#374151", fontSize: 16, lineHeight: 24 },
  button: {
    minHeight: 48,
    marginTop: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#2180ee",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "white", fontSize: 17, fontWeight: "700" },
});
