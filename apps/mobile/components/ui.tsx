import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, space, surfaces, tap, toneColors, type Tone, type as typo } from "../lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT: Record<ButtonVariant, { bg: string; fg: string; border: string; shadow: string }> = {
  primary: { bg: colors.berry[500], fg: colors.white, border: colors.berry[600], shadow: colors.berry[700] },
  secondary: { bg: colors.sky[700], fg: colors.white, border: colors.sky[800], shadow: colors.sky[900] },
  ghost: { bg: colors.white, fg: colors.sky[800], border: colors.sky[200], shadow: colors.sky[100] },
  danger: { bg: colors.white, fg: colors.berry[700], border: colors.berry[300], shadow: colors.berry[100] },
};

/** Tactile press button. `kid` raises the target from 48 to 64 points. */
export function Button({
  label,
  onPress,
  variant = "primary",
  kid = false,
  disabled = false,
  busy = false,
  icon,
  accessibilityHint,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  kid?: boolean;
  disabled?: boolean;
  busy?: boolean;
  icon?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANT[variant];
  const inactive = disabled || busy;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: kid ? tap.kid : tap.min,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderBottomColor: v.shadow,
          opacity: inactive ? 0.55 : 1,
          transform: [{ translateY: pressed && !inactive ? 2 : 0 }],
          borderBottomWidth: pressed && !inactive ? 2 : 4,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.buttonText, { color: v.fg, fontSize: kid ? 21 : 19 }]}>
          {icon ? `${icon}  ` : ""}
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Screen({
  children,
  kid = false,
  scroll = true,
  refreshing,
  onRefresh,
  contentStyle,
}: {
  children: ReactNode;
  kid?: boolean;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const background = kid ? surfaces.kid : surfaces.parent;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={["top", "left", "right", "bottom"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      ) : null}
      <View style={styles.headerText}>
        <Text accessibilityRole="header" style={typo.title}>
          {title}
        </Text>
        {subtitle ? <Text style={[typo.small, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({ children, tone, style }: { children: ReactNode; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const t = tone ? toneColors(tone) : null;
  return (
    <View style={[styles.card, t && { backgroundColor: t.soft, borderColor: t.border }, style]}>{children}</View>
  );
}

export function Notice({ text, tone = "sky", role }: { text: string; tone?: Tone; role?: "alert" }) {
  const t = toneColors(tone);
  return (
    <View
      accessibilityRole={role}
      accessibilityLiveRegion={role === "alert" ? "assertive" : "polite"}
      style={[styles.notice, { backgroundColor: t.soft, borderColor: t.border }]}
    >
      <Text style={[typo.body, { color: t.deep }]}>{text}</Text>
    </View>
  );
}

export function Field({
  label,
  error,
  ...input
}: TextInputProps & { label: string; error?: string | null }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.gray[400]}
        style={[styles.input, error ? { borderColor: colors.berry[500] } : null]}
        {...input}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Loading({ label = "Loading…", kid = false }: { label?: string; kid?: boolean }) {
  return (
    <View style={[styles.center, { backgroundColor: kid ? surfaces.kid : surfaces.parent }]} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.sky[500]} />
      <Text style={[typo.body, styles.loadingText]}>{label}</Text>
    </View>
  );
}

export function StarChip({ stars, label }: { stars: number; label?: string }) {
  return (
    <View
      style={styles.starChip}
      accessible
      accessibilityLabel={label ?? `${stars} star${stars === 1 ? "" : "s"}`}
    >
      <Text style={styles.starText}>⭐ {stars}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl },
  loadingText: { marginTop: space.md },
  button: {
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: space.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: tap.min,
  },
  buttonText: { fontWeight: "800", textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: space.md },
  headerText: { flex: 1 },
  subtitle: { marginTop: 2 },
  back: {
    width: tap.min,
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.sky[200],
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 30, lineHeight: 32, fontWeight: "800", color: colors.sky[800] },
  card: {
    backgroundColor: surfaces.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.ink[100],
    padding: space.lg,
    gap: space.md,
  },
  notice: { borderRadius: radius.md, borderWidth: 2, padding: space.md },
  field: { gap: space.xs },
  label: { fontSize: 15, fontWeight: "800", color: colors.ink[700] },
  input: {
    minHeight: tap.min,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ink[100],
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    fontSize: 17,
    color: colors.ink[900],
  },
  fieldError: { color: colors.berry[700], fontWeight: "700", fontSize: 14 },
  starChip: {
    minHeight: tap.min,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.sunshine[100],
    borderWidth: 2,
    borderColor: colors.sunshine[300],
    alignItems: "center",
    justifyContent: "center",
  },
  starText: { fontSize: 18, fontWeight: "900", color: colors.sunshine[800] },
});
