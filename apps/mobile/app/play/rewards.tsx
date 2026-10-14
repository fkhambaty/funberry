import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { awardReward, getChildRewards, type Reward } from "@funberry/supabase";
import { getEarnedMilestones, getNextMilestone, starMilestones } from "@funberry/game-engine/src/core/progression";
import { Card, Header, Notice, Screen } from "../../components/ui";
import { useActiveChild } from "../../lib/session";
import { colors, space, type } from "../../lib/theme";

const ICONS: Record<string, string> = { sticker: "🌟", badge: "🏅", costume: "👑", title: "🏆" };

export default function RewardsScreen() {
  const router = useRouter();
  const child = useActiveChild();
  const [saved, setSaved] = useState<Reward[]>([]);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!child) return;
      let live = true;
      void (async () => {
        try {
          const have = await getChildRewards(child.id);
          const owned = new Set(have.map((reward) => reward.reward_id));
          for (const milestone of getEarnedMilestones(child.total_stars)) {
            if (owned.has(milestone.rewardId)) continue;
            const rewardType =
              milestone.reward === "sticker" || milestone.reward === "badge" || milestone.reward === "costume" || milestone.reward === "title"
                ? milestone.reward
                : "badge";
            await awardReward(child.id, rewardType, milestone.rewardId, milestone.name);
          }
          const fresh = await getChildRewards(child.id);
          if (live) setSaved(fresh);
        } catch {
          if (live) setError("Rewards could not be loaded.");
        }
      })();
      return () => {
        live = false;
      };
    }, [child]),
  );

  const next = child ? getNextMilestone(child.total_stars) : null;

  return (
    <Screen kid>
      <Header title="Rewards" subtitle={child ? `${child.name} has ${child.total_stars} stars` : undefined} onBack={() => router.back()} />
      {error ? <Notice role="alert" tone="berry" text={error} /> : null}
      {next ? (
        <Card tone="sunshine">
          <Text style={type.heading}>Next reward</Text>
          <Text style={type.body}>
            {next.name} at {next.stars} stars. {next.stars - (child?.total_stars ?? 0)} to go.
          </Text>
        </Card>
      ) : (
        <Notice tone="leaf" text="Every reward on the list is earned." />
      )}
      {starMilestones.map((milestone) => {
        const earned = (child?.total_stars ?? 0) >= milestone.stars;
        const stored = saved.some((reward) => reward.reward_id === milestone.rewardId);
        return (
          <Card key={milestone.rewardId} tone={earned ? "leaf" : undefined}>
            <Text style={type.heading}>
              {ICONS[milestone.reward] ?? "🎁"} {milestone.name}
            </Text>
            <Text style={styles.meta}>{earned ? (stored ? "Saved to your account" : "Earned") : `${milestone.stars} stars`}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.ink[500], fontWeight: "700", marginTop: space.xs },
});
