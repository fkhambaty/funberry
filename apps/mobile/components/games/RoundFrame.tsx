import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space, tap, type } from "../../lib/theme";

/** Shared chrome for a native round: progress, the question, and 64px answers. */
export function RoundFrame({
  title,
  step,
  total,
  prompt,
  children,
}: {
  title: string;
  step: number;
  total: number;
  prompt: string;
  children: ReactNode;
}) {
  const progress = total > 0 ? Math.min(1, step / total) : 0;
  return (
    <View style={styles.frame}>
      <Text style={type.heading}>{title}</Text>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: step }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.answers}>{children}</View>
    </View>
  );
}

export function AnswerButton({
  label,
  icon,
  selected,
  tone,
  disabled,
  onPress,
}: {
  label: string;
  icon?: string;
  selected?: boolean;
  tone?: "good" | "bad";
  disabled?: boolean;
  onPress: () => void;
}) {
  const background =
    tone === "good" ? colors.leaf[100] : tone === "bad" ? colors.berry[100] : selected ? colors.sky[100] : colors.white;
  const border = tone === "good" ? colors.leaf[500] : tone === "bad" ? colors.berry[500] : colors.sky[300];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.answer, { backgroundColor: background, borderColor: border, opacity: pressed ? 0.85 : 1 }]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.answerText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: { gap: space.md },
  track: { height: 14, borderRadius: radius.pill, backgroundColor: colors.sky[100], overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.leaf[500] },
  prompt: { fontSize: 22, fontWeight: "800", color: colors.ink[900], lineHeight: 30 },
  answers: { gap: space.md },
  answer: {
    minHeight: tap.kid,
    borderRadius: radius.lg,
    borderWidth: 3,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  icon: { fontSize: 28 },
  answerText: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.ink[900] },
});
