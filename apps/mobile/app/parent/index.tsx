import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { parentHasPin } from "@funberry/supabase";
import { BerryMark } from "../../components/BerryMark";
import { Button, Card, Header, Notice, Screen, StarChip } from "../../components/ui";
import { planSummary } from "../../lib/plan";
import { useSession } from "../../lib/session";
import { space, type } from "../../lib/theme";

export default function ParentDashboard() {
  const router = useRouter();
  const { parent, childList, refresh, unreachable } = useSession();
  const [refreshing, setRefreshing] = useState(false);
  const plan = planSummary(parent);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function pull() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void pull()}>
      <Header
        title={parent?.name ? `Hi, ${parent.name}` : "Parent home"}
        subtitle={parent?.email}
        right={<Button variant="ghost" label="Settings" onPress={() => router.push("/parent/settings")} />}
      />
      {unreachable ? (
        <Notice role="alert" tone="sunshine" text="FunBerry could not reach the account service. Pull down to try again." />
      ) : null}

      <Card tone="sky">
        <View style={styles.row}>
          <BerryMark size={56} />
          <View style={styles.flex}>
            <Text style={type.heading}>Ready to play?</Text>
            <Text style={type.small}>Children pick their name, then a world. The parent PIN brings you back here.</Text>
          </View>
        </View>
        <Button
          kid
          icon="🎮"
          label="Start playing"
          disabled={childList.length === 0}
          onPress={() => router.push("/play")}
          testID="start-playing"
        />
        {childList.length === 0 ? <Text style={type.small}>Add a child first.</Text> : null}
      </Card>

      {parent && !parentHasPin(parent) ? (
        <Notice
          tone="sunshine"
          text="Set a 4-digit parent PIN in Settings. Without it, leaving play asks a grown-up maths question instead."
        />
      ) : null}

      <View style={styles.sectionHead}>
        <Text accessibilityRole="header" style={type.heading}>
          Children
        </Text>
        <Button variant="secondary" label="Add a child" onPress={() => router.push("/parent/child-form")} />
      </View>
      {childList.map((child) => (
        <Card key={child.id}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={type.heading}>{child.name}</Text>
              <Text style={type.small}>Age {child.age}</Text>
            </View>
            <StarChip stars={child.total_stars} label={`${child.name} has ${child.total_stars} stars`} />
          </View>
          <View style={styles.row}>
            <Button
              style={styles.flex}
              variant="ghost"
              label="Progress"
              onPress={() => router.push({ pathname: "/parent/child/[id]", params: { id: child.id } })}
            />
            <Button
              style={styles.flex}
              variant="ghost"
              label="Edit"
              onPress={() => router.push({ pathname: "/parent/child-form", params: { id: child.id } })}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text accessibilityRole="header" style={type.heading}>
          Plan: {plan.label}
        </Text>
        <Text style={type.body}>{plan.lines[0]}</Text>
        <Button variant="ghost" label="Plan details" onPress={() => router.push("/parent/plan")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  flex: { flex: 1 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md },
});
