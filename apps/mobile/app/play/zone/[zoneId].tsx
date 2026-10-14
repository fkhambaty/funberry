import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCurriculumSectionsForZone } from "@funberry/game-engine/src/games/evs";
import { Header, Notice, Screen } from "../../../components/ui";
import { accessFor, findZone, GAME_LABELS, zoneGames } from "../../../lib/catalog";
import { isPaid } from "../../../lib/plan";
import { useActiveChild, useSession } from "../../../lib/session";
import { colors, radius, space, tap, type } from "../../../lib/theme";

export default function ZoneScreen() {
  const router = useRouter();
  const { zoneId = "" } = useLocalSearchParams<{ zoneId: string }>();
  const zone = findZone(zoneId);
  const games = zoneGames(zoneId);
  const sections = getCurriculumSectionsForZone(zoneId);
  const child = useActiveChild();
  const { parent } = useSession();
  const paid = isPaid(parent);
  const stars = child?.total_stars ?? 0;

  if (!zone) {
    return (
      <Screen kid>
        <Header title="World" onBack={() => router.back()} />
        <Notice text="That world is not on this device." />
      </Screen>
    );
  }

  const folderIds = new Set(sections.flatMap((section) => section.entries.map((entry) => entry.game.id)));
  const loose = games.filter((game) => !folderIds.has(game.id));

  function open(gameId: string) {
    router.push({ pathname: "/play/game/[gameId]", params: { gameId } });
  }

  function rows(list: typeof games) {
    return list.map((game) => {
      const access = accessFor(game, paid, stars);
      const meta = GAME_LABELS[game.type];
      const lock =
        access.reason === "premium"
          ? "Locked"
          : access.reason === "stars"
            ? `${access.starsNeeded} more stars`
            : null;
      return (
        <Pressable
          key={game.id}
          accessibilityRole="button"
          accessibilityLabel={lock ? `${game.title}, locked, ${lock}` : game.title}
          onPress={() => open(game.id)}
          style={({ pressed }) => [styles.game, pressed && { opacity: 0.85 }, !access.allowed && styles.locked]}
        >
          <Text style={styles.emoji}>{lock ? "🔒" : meta.icon}</Text>
          <View style={styles.copy}>
            <Text style={type.heading}>{game.title}</Text>
            <Text style={type.small}>{lock ? `Locked · ${lock}` : meta.label}</Text>
          </View>
        </Pressable>
      );
    });
  }

  return (
    <Screen kid>
      <Header title={`${zone.emoji} ${zone.name}`} subtitle={zone.description} onBack={() => router.back()} />
      {sections.map((section) => (
        <View key={section.metadata.id} style={styles.folder}>
          <Text style={type.heading}>
            {section.metadata.emoji} {section.metadata.title}
          </Text>
          {rows(section.entries.map((entry) => entry.game))}
        </View>
      ))}
      {loose.length > 0 ? rows(loose) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  folder: { gap: space.md },
  game: {
    minHeight: tap.kid,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.sky[200],
    padding: space.md,
  },
  locked: { borderColor: colors.ink[100] },
  emoji: { fontSize: 28 },
  copy: { flex: 1 },
});
