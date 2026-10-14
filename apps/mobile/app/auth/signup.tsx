import { useState } from "react";
import { useRouter } from "expo-router";
import { signUp } from "@funberry/supabase";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { messageOf } from "../../lib/api";
import { emailError, passwordError, pinError } from "../../lib/validation";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next = {
      name: name.trim() ? null : "Enter your name.",
      email: emailError(email),
      password: passwordError(password),
      pin: pin ? pinError(pin) : null,
    };
    setErrors(next);
    setFailure(null);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    try {
      const address = email.trim().toLowerCase();
      await signUp(address, password, name.trim(), pin || undefined);
      router.replace({ pathname: "/auth/verify", params: { email: address } });
    } catch (error) {
      setFailure(messageOf(error, "Could not create the account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title="Create an account" subtitle="For a parent or guardian." onBack={() => router.back()} />
      <Card>
        <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" error={errors.name} />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email}
          testID="signup-email"
        />
        <Field
          label="Password (6 or more characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.password}
        />
        <Field
          label="Parent PIN (optional, 4 digits)"
          value={pin}
          onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          error={errors.pin}
        />
        <Notice text="We email a 6-digit code to confirm the address. The PIN keeps children out of the parent screens." />
        {failure ? <Notice role="alert" tone="berry" text={failure} /> : null}
        <Button label="Create account" onPress={() => void submit()} busy={busy} testID="signup-submit" />
      </Card>
      <Button variant="ghost" label="I already have an account" onPress={() => router.replace("/auth/login")} />
    </Screen>
  );
}
