import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { resendSignupConfirmation, verifyEmailOtp } from "@funberry/supabase";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { messageOf } from "../../lib/api";
import { codeError } from "../../lib/validation";

const RESEND_SECONDS = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const { email = "" } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function submit() {
    const problem = codeError(code);
    setError(problem);
    setInfo(null);
    if (problem || !email) return;
    setBusy(true);
    try {
      await verifyEmailOtp(email, code);
    } catch (err) {
      setError(messageOf(err, "That code did not work."));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await resendSignupConfirmation(email);
      setInfo("If that account still needs confirming, a new code is on its way.");
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(messageOf(err, "Could not send a new code."));
    }
  }

  return (
    <Screen>
      <Header title="Check your email" subtitle={email ? `We sent a 6-digit code to ${email}.` : undefined} onBack={() => router.back()} />
      <Card>
        <Field
          label="6-digit code"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={6}
          error={error}
          onSubmitEditing={() => void submit()}
          testID="verify-code"
        />
        <Notice text="The code works for 15 minutes and allows 5 tries." />
        {info ? <Notice tone="leaf" text={info} /> : null}
        <Button label="Confirm email" onPress={() => void submit()} busy={busy} disabled={!email} />
        <Button
          variant="ghost"
          label={wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
          disabled={wait > 0 || !email}
          onPress={() => void resend()}
        />
      </Card>
    </Screen>
  );
}
