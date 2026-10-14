import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { brand } from "@funberry/config";
import { BerryMark } from "../components/BerryMark";
import { Button, Screen } from "../components/ui";
import { colors, space, type } from "../lib/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen kid contentStyle={styles.content}>
      <View style={styles.hero}>
        <BerryMark size={132} />
        <Text accessibilityRole="header" style={type.hero}>
          {brand.name}
        </Text>
        <Text style={[type.body, styles.tagline]}>{brand.tagline}</Text>
      </View>
      <View style={styles.actions}>
        <Button kid label="Grown-up sign in" onPress={() => router.push("/auth/login")} testID="welcome-login" />
        <Button
          kid
          variant="ghost"
          label="Create a free account"
          onPress={() => router.push("/auth/signup")}
          testID="welcome-signup"
        />
      </View>
      <Text style={[type.small, styles.footnote]}>
        A grown-up signs in and adds each child. Children then choose their own name to play.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: "center", gap: space.xxl },
  hero: { alignItems: "center", gap: space.md },
  tagline: { textAlign: "center", color: colors.ink[500] },
  actions: { gap: space.md },
  footnote: { textAlign: "center" },
});
