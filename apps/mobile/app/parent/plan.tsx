import { useRouter } from "expo-router";
import { Header, Notice, Screen } from "../../components/ui";
import { planSummary } from "../../lib/plan";
import { useSession } from "../../lib/session";

/** Read-only. This screen does not link to checkout, pricing, or the parent dashboard. */
export default function PlanScreen() {
  const router = useRouter();
  const { parent } = useSession();
  const plan = planSummary(parent);

  return (
    <Screen>
      <Header title="Current plan" subtitle={plan.label} onBack={() => router.back()} />
      {plan.lines.map((line) => (
        <Notice key={line} tone={plan.paid ? "leaf" : "sky"} text={line} />
      ))}
    </Screen>
  );
}
