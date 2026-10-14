import { useRouter } from "expo-router";
import { Button, Card, Header, Notice, Screen } from "../../components/ui";

/** Old emails linked here. Links are retired; this route never reads a token from the URL. */
export default function RetiredCallbackScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Header title="Confirmation links are retired" />
      <Card>
        <Notice text="FunBerry Kids now confirms email with a 6-digit code. Sign in, and if the account still needs confirming we email a fresh code." />
        <Button label="Go to sign in" onPress={() => router.replace("/auth/login")} />
      </Card>
    </Screen>
  );
}
