import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { voice } from "@funberry/brand";
import { BerryMark } from "../../components/BerryMark";
import { Button, Card, Header, Screen, StarChip } from "../../components/ui";
import { useSession } from "../../lib/session";
import { colors, radius, space, tap, type } from "../../lib/theme";

export default function ChildPickerScreen() {
  const router = useRouter();
  const { childList, enterChildMode } = useSession();

  return (
    <Screen kid>
      <Header title="Who is playing?" subtitle="Tap your name." />
      {childList.length === 0 ? (
        <Card>
          <BerryMark size={72} />
          <Text style={type.body}>{voice.empty}</Text>
        </Card>
      ) : (
        childList.map((child) => (
          <Pressable
            key={child.id}
            accessibilityRole="button"
            accessibilityLabel={`${child.name}, ${child.total_stars} stars`}
            onPress={() => {
              void enterChildMode(child.id).then(() => router.replace("/play/zones"));
            }}
            style={({ pressed }) => [styles.player, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.avatar}>
              <Text style={styles.letter}>{child.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.name}>
              <Text style={type.kid}>{child.name}</Text>
              <Text style={type.small}>Age {child.age}</Text>
            </View>
            <StarChip stars={child.total_stars} />
          </Pressable>
        ))
      )}
      <Button variant="ghost" label="Grown-ups" icon="🔒" onPress={() => router.push("/play/gate")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  player: {
    minHeight: tap.kid,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.sky[200],
    padding: space.md,
  },
  avatar: {
    width: tap.kid,
    height: tap.kid,
    borderRadius: radius.pill,
    backgroundColor: colors.berry[100],
    alignItems: "center",
    justifyContent: "center",
  },
  letter: { fontSize: 28, fontWeight: "900", color: colors.berry[700] },
  name: { flex: 1 },
});
