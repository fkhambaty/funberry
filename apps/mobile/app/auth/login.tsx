import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { AccountError } from "@funberry/supabase";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { messageOf } from "../../lib/api";
import { useSession } from "../../lib/session";
import { space, type } from "../../lib/theme";
import { loginError, passwordError } from "../../lib/validation";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ notice?: string }>();
  const { signIn } = useSession();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ login?: string | null; password?: string | null }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next = { login: loginError(login), password: password ? null : passwordError("") };
    setErrors(next);
    setFailure(null);
    if (next.login || next.password) return;
    setBusy(true);
    try {
      await signIn(login, password);
    } catch (error) {
      const account = error as AccountError;
      if (account?.needsVerification) {
        router.push({ pathname: "/auth/verify", params: { email: account.email ?? login.trim() } });
        return;
      }
      setFailure(messageOf(error, "Could not sign in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title="Grown-up sign in" subtitle="Use the account you made on FunBerry Kids." onBack={() => router.back()} />
      {params.notice === "reset" ? <Notice tone="leaf" text="Password changed. Sign in with the new password." /> : null}
      <Card>
        <Field
          label="Email or username"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          error={errors.login}
          testID="login-email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          error={errors.password}
          onSubmitEditing={() => void submit()}
          testID="login-password"
        />
        {failure ? <Notice role="alert" tone="berry" text={failure} /> : null}
        <Button label="Sign in" onPress={() => void submit()} busy={busy} testID="login-submit" />
      </Card>
      <Button variant="ghost" label="Forgot password?" onPress={() => router.push("/auth/forgot")} />
      <Button variant="ghost" label="Create a free account" onPress={() => router.replace("/auth/signup")} />
      <Text style={[type.small, styles.note]}>Your sign-in stays on this device in the secure keychain.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { textAlign: "center", marginTop: space.sm } });
