import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(root, "../..");

function files(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".expo" || name === "android" || name === "ios") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, out);
    else if (name !== "check-static.mjs" && /\.(ts|tsx|js|mjs|json)$/.test(name)) out.push(path);
  }
  return out;
}

const forbidden = [
  [/supabase\.co/i, "retired Supabase host"],
  [/revenuecat/i, "RevenueCat"],
  [/react-native-purchases/, "in-app purchase SDK"],
  [/EXPO_PUBLIC_SUPABASE/, "Supabase public env"],
  [/offline mode/i, "offline-mode claim"],
  [/\bstripe\b/i, "Stripe"],
  [/rzp_/, "Razorpay key"],
  [/YOUR_EAS_PROJECT_ID/, "placeholder EAS project id"],
  [/AsyncStorage/, "unencrypted session storage"],
  [/eyJhbGci/, "embedded JWT"],
  [/\/pricing\b/, "pricing page link"],
  [/\/dashboard\b/, "parent dashboard link"],
  [/Open plans/i, "plans call to action"],
  [/priceInr/, "displayed rupee price"],
];

const problems = [];
for (const path of files(root)) {
  const text = readFileSync(path, "utf8");
  const label = relative(root, path);
  for (const [pattern, name] of forbidden) {
    if (pattern.test(text)) problems.push(`${label} mentions ${name}`);
  }
}

const eas = readFileSync(join(root, "eas.json"), "utf8");
if (!eas.includes("https://funberry-api.fkhambaty.workers.dev")) problems.push("eas.json is missing the Worker URL");
if (!eas.includes("https://www.funberrykids.in")) problems.push("eas.json is missing the website origin");

const app = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
if ((app.expo.android.permissions ?? []).length !== 0) problems.push("Android permissions must stay empty");
if (!app.expo.android.blockedPermissions?.includes("android.permission.CAMERA")) {
  problems.push("camera permission is not blocked");
}

const phrase = readFileSync(join(repo, "cloudflare/worker/src/accountData.js"), "utf8").match(
  /export const DELETE_PHRASE = "([^"]+)"/,
);
const settings = readFileSync(join(root, "lib/account.ts"), "utf8");
if (!phrase || !settings.includes(`"${phrase[1]}"`)) problems.push("delete phrase does not match the Worker");

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("mobile static claims check passed");
