import { useState } from "react";
import { Alert, Linking, Share, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { deleteAccount, exportAccount, parentHasPin, updateParentPassword, updateParentPin } from "@funberry/supabase";
import { brand } from "@funberry/config";
import { Button, Card, Field, Header, Notice, Screen } from "../../components/ui";
import { DELETE_PHRASE } from "../../lib/account";
import { messageOf } from "../../lib/api";
import { links } from "../../lib/env";
import { useSession } from "../../lib/session";
import { passwordError, pinError } from "../../lib/validation";
import { space, type } from "../../lib/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { parent, signOut, refresh } = useSession();
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePassword() {
    const problem = passwordError(password);
    setError(problem);
    setNotice(null);
    if (problem) return;
    setBusy(true);
    try {
      await updateParentPassword(password);
      setNotice("Password changed. Sign in again on every device.");
      await signOut();
    } catch (err) {
      setError(messageOf(err, "Could not change the password."));
    } finally {
      setBusy(false);
    }
  }

  async function changePin() {
    const problem = pinError(pin);
    const current = parentHasPin(parent) ? pinError(currentPin) : null;
    setError(problem ?? current);
    setNotice(null);
    if (problem || current) return;
    setBusy(true);
    try {
      await updateParentPin(pin, parentHasPin(parent) ? currentPin : undefined);
      setPin("");
      setCurrentPin("");
      setNotice("Parent PIN updated.");
      await refresh();
    } catch (err) {
      setError(messageOf(err, "Could not update the PIN."));
    } finally {
      setBusy(false);
    }
  }

  async function shareExport() {
    setError(null);
    setBusy(true);
    try {
      const data = await exportAccount();
      await Share.share({ title: "FunBerry Kids account export", message: JSON.stringify(data, null, 2) });
    } catch (err) {
      if (err instanceof Error && /cancel|dismiss/i.test(err.message)) return;
      setError(messageOf(err, "Could not export the account."));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    if (confirm !== DELETE_PHRASE) {
      setError(`Type ${DELETE_PHRASE} to confirm.`);
      return;
    }
    if (!deletePassword) {
      setError("Enter the account password.");
      return;
    }
    Alert.alert("Delete this account?", "Children, stars and progress are removed. This cannot be undone.", [
      { text: "Keep account", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            setBusy(true);
            try {
              await deleteAccount(confirm, deletePassword);
              await signOut();
            } catch (err) {
              setError(messageOf(err, "Could not delete the account."));
              setBusy(false);
            }
          })();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Header title="Settings" subtitle={parent?.email} onBack={() => router.back()} />
      {notice ? <Notice tone="leaf" text={notice} /> : null}
      {error ? <Notice role="alert" tone="berry" text={error} /> : null}

      <Card>
        <Text style={type.heading}>Parent PIN</Text>
        <Text style={type.small}>Checked on FunBerry's server. The PIN is stored as a hash, never shown again.</Text>
        {parentHasPin(parent) ? (
          <Field label="Current PIN" value={currentPin} onChangeText={(value) => setCurrentPin(value.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" secureTextEntry maxLength={4} />
        ) : null}
        <Field label="New 4-digit PIN" value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" secureTextEntry maxLength={4} />
        <Button label={parentHasPin(parent) ? "Change PIN" : "Set PIN"} onPress={() => void changePin()} busy={busy} />
      </Card>

      <Card>
        <Text style={type.heading}>Password</Text>
        <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
        <Button label="Change password" onPress={() => void changePassword()} busy={busy} />
      </Card>

      <Card>
        <Text style={type.heading}>Your data</Text>
        <Text style={type.small}>The export is your account, children and progress. It does not include the password or PIN.</Text>
        <Button variant="secondary" label="Export account" onPress={() => void shareExport()} busy={busy} />
        <Field label={`Type ${DELETE_PHRASE}`} value={confirm} onChangeText={setConfirm} autoCapitalize="characters" autoCorrect={false} />
        <Field label="Account password" value={deletePassword} onChangeText={setDeletePassword} secureTextEntry />
        <Button variant="danger" label="Delete account" onPress={confirmDelete} disabled={busy} />
      </Card>

      <Card>
        <Text style={type.heading}>Legal</Text>
        <Button variant="ghost" label="Privacy" onPress={() => void Linking.openURL(links.privacy)} />
        <Button variant="ghost" label="Terms" onPress={() => void Linking.openURL(links.terms)} />
        <Button variant="ghost" label="Refunds" onPress={() => void Linking.openURL(links.refunds)} />
        <Button variant="ghost" label={`Email ${brand.supportEmail}`} onPress={() => void Linking.openURL(links.support)} />
      </Card>

      <Button variant="danger" label="Sign out" onPress={() => void signOut()} />
      <Text style={[type.small, styles.note]}>Version 1.1.0 · FunBerry Kids</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { textAlign: "center", marginTop: space.sm } });
