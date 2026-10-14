import { useState } from "react";
import { useRouter } from "expo-router";
import { requestPasswordReset, resetPasswordWithCode } from "@funberry/supabase";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { messageOf } from "../../lib/api";
import { codeError, emailError, passwordError } from "../../lib/validation";

export default function ForgotScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    const problem = emailError(email);
    setErrors({ email: problem });
    setFailure(null);
    if (problem) return;
    setBusy(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setStep("reset");
    } catch (error) {
      setFailure(messageOf(error, "Could not send the reset code."));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    const next = { code: codeError(code), password: passwordError(password) };
    setErrors(next);
    setFailure(null);
    if (next.code || next.password) return;
    setBusy(true);
    try {
      await resetPasswordWithCode(email.trim().toLowerCase(), code, password);
      router.replace({ pathname: "/auth/login", params: { notice: "reset" } });
    } catch (error) {
      setFailure(messageOf(error, "Could not change the password."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title="Reset password" onBack={() => router.back()} />
      <Card>
        {step === "email" ? (
          <>
            <Field
              label="Account email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />
            {failure ? <Notice role="alert" tone="berry" text={failure} /> : null}
            <Button label="Email me a code" onPress={() => void sendCode()} busy={busy} />
          </>
        ) : (
          <>
            <Notice text={`If ${email.trim()} has an account, a 6-digit code is on its way. It works for 15 minutes.`} />
            <Field
              label="6-digit code"
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              error={errors.code}
            />
            <Field
              label="New password (6 or more characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={errors.password}
            />
            <Notice text="Changing the password signs this account out on every device." />
            {failure ? <Notice role="alert" tone="berry" text={failure} /> : null}
            <Button label="Change password" onPress={() => void reset()} busy={busy} />
            <Button variant="ghost" label="Use a different email" onPress={() => setStep("email")} />
          </>
        )}
      </Card>
    </Screen>
  );
}
