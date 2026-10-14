import { useMemo, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { parentHasPin } from "@funberry/supabase";
import { a11y } from "@funberry/config";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { checkParentPin } from "../../lib/api";
import { useSession } from "../../lib/session";
import { pinError } from "../../lib/validation";
import { type } from "../../lib/theme";

function mathsProblem() {
  const span = a11y.parentalGateMax - a11y.parentalGateMin;
  const left = a11y.parentalGateMin + Math.floor(Math.random() * (span / 2));
  const right = a11y.parentalGateMin + Math.floor(Math.random() * (span / 2));
  return { left, right, answer: left + right };
}

const PIN_COPY = {
  wrong: "That PIN is not right.",
  locked: "Too many PIN tries. Wait 15 minutes and try again.",
  no_pin: "Set a parent PIN in Settings first.",
  network: "FunBerry could not check the PIN. Try again.",
} as const;

/** Leaves child mode only after the Worker accepts the hashed PIN. */
export default function ParentGateScreen() {
  const router = useRouter();
  const { parent, leaveChildMode, mode } = useSession();
  const hasPin = parentHasPin(parent);
  const [pin, setPin] = useState("");
  const [answer, setAnswer] = useState("");
  const [problem, setProblem] = useState(mathsProblem);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sum = useMemo(() => problem.answer, [problem]);

  async function unlock() {
    await leaveChildMode();
    router.replace("/parent");
  }

  async function submitPin() {
    const problemText = pinError(pin);
    setError(problemText);
    if (problemText) return;
    setBusy(true);
    const result = await checkParentPin(pin);
    setBusy(false);
    setPin("");
    if (result === "ok") {
      await unlock();
      return;
    }
    setError(PIN_COPY[result]);
  }

  async function submitMaths() {
    if (Number(answer) !== sum) {
      setError("That answer is not right.");
      setAnswer("");
      setProblem(mathsProblem());
      return;
    }
    await unlock();
  }

  return (
    <Screen>
      <Header title="Grown-ups only" subtitle="Children stay in the game until this is answered." onBack={() => router.back()} />
      <Card>
        {hasPin ? (
          <>
            <Text style={type.body}>Enter the 4-digit parent PIN.</Text>
            <Field
              label="Parent PIN"
              value={pin}
              onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={error}
              testID="gate-pin"
            />
            <Button label="Continue" onPress={() => void submitPin()} busy={busy} testID="gate-submit" />
          </>
        ) : (
          <>
            <Notice
              tone="sunshine"
              text="No parent PIN is set yet. Answer this to leave, then set a PIN in Settings so children cannot guess their way out."
            />
            <Field
              label={`What is ${problem.left} + ${problem.right}?`}
              value={answer}
              onChangeText={(value) => setAnswer(value.replace(/\D/g, "").slice(0, 3))}
              keyboardType="number-pad"
              error={error}
            />
            <Button label="Continue" onPress={() => void submitMaths()} />
          </>
        )}
        {mode.kind === "parent" ? <Button variant="ghost" label="Back to parent home" onPress={() => router.replace("/parent")} /> : null}
      </Card>
    </Screen>
  );
}
