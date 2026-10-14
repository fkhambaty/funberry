import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addChild, deleteChild, getChildren, updateChild } from "@funberry/supabase";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { messageOf } from "../../lib/api";
import { useSession } from "../../lib/session";
import { colors, radius, space, tap } from "../../lib/theme";
import { CHILD_AGES, childAgeError, childNameError } from "../../lib/validation";

export default function ChildFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { childList, setChildList } = useSession();
  const existing = id ? childList.find((child) => child.id === id) ?? null : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [age, setAge] = useState<number>(existing?.age ?? 6);
  const [errors, setErrors] = useState<{ name?: string | null; age?: string | null }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    setChildList(await getChildren());
  }

  async function save() {
    const next = { name: childNameError(name), age: childAgeError(age) };
    setErrors(next);
    setFailure(null);
    if (next.name || next.age) return;
    setBusy(true);
    try {
      if (existing) await updateChild(existing.id, name.trim(), age);
      else await addChild(name.trim(), age, null);
      await reload();
      router.back();
    } catch (error) {
      setFailure(messageOf(error, "Could not save this child."));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    if (!existing) return;
    Alert.alert(
      `Remove ${existing.name}?`,
      "This deletes their stars and progress on every device. It cannot be undone.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                await deleteChild(existing.id);
                await reload();
                router.back();
              } catch (error) {
                setFailure(messageOf(error, "Could not remove this child."));
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <Header title={existing ? `Edit ${existing.name}` : "Add a child"} onBack={() => router.back()} />
      {id && !existing ? <Notice tone="sunshine" text="This child is no longer on the account." /> : null}
      <Card>
        <Field label="First name or nickname" value={name} onChangeText={setName} maxLength={40} error={errors.name} />
        <Text style={styles.label}>Age</Text>
        <View style={styles.ages} accessibilityRole="radiogroup">
          {CHILD_AGES.map((value) => {
            const selected = value === age;
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Age ${value}`}
                onPress={() => setAge(value)}
                style={[styles.age, selected && styles.ageSelected]}
              >
                <Text style={[styles.ageText, selected && styles.ageTextSelected]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.age ? <Notice tone="berry" text={errors.age} /> : null}
        <Notice text="Only a first name or nickname is needed. No photo is collected in the app." />
        {failure ? <Notice role="alert" tone="berry" text={failure} /> : null}
        <Button label={existing ? "Save changes" : "Add child"} onPress={() => void save()} busy={busy} />
      </Card>
      {existing ? <Button variant="danger" label={`Remove ${existing.name}`} onPress={confirmDelete} disabled={busy} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "800", color: colors.ink[700] },
  ages: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  age: {
    width: tap.min + 8,
    height: tap.min + 8,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.sky[200],
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  ageSelected: { backgroundColor: colors.sky[700], borderColor: colors.sky[800] },
  ageText: { fontSize: 20, fontWeight: "800", color: colors.sky[800] },
  ageTextSelected: { color: colors.white },
});
