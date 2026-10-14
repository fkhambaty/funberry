import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { buildGameResult } from "@funberry/game-engine/src/core/scoring";
import type {
  DragSortData,
  GameConfig,
  GameResult,
  InteractiveStoryData,
  MemoryMatchData,
  OddOneOutData,
  PictureQuizData,
  SequenceBuilderData,
  TrueFalseData,
  WordPictureLinkData,
} from "@funberry/game-engine/src/types";
import { colors, space, type } from "../../lib/theme";
import { AnswerButton, RoundFrame } from "./RoundFrame";

type Finish = (result: GameResult) => void;

function useClock() {
  const started = useRef(Date.now());
  return () => Math.max(0, Math.round((Date.now() - started.current) / 1000));
}

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

export function NativeRound({ game, onComplete }: { game: GameConfig; onComplete: Finish }) {
  switch (game.type) {
    case "picture_quiz":
      return game.data.type === "picture_quiz" ? <PictureQuiz data={game.data} title={game.title} onComplete={onComplete} /> : null;
    case "true_false":
      return game.data.type === "true_false" ? <TrueFalse data={game.data} title={game.title} onComplete={onComplete} /> : null;
    case "odd_one_out":
      return game.data.type === "odd_one_out" ? <OddOneOut data={game.data} title={game.title} onComplete={onComplete} /> : null;
    case "memory_match":
      return game.data.type === "memory_match" ? <MemoryMatch data={game.data} title={game.title} onComplete={onComplete} /> : null;
    case "sequence_builder":
      return game.data.type === "sequence_builder" ? (
        <SequenceBuilder data={game.data} title={game.title} onComplete={onComplete} />
      ) : null;
    case "drag_sort":
      return game.data.type === "drag_sort" ? <TapSort data={game.data} title={game.title} onComplete={onComplete} /> : null;
    case "word_picture_link":
      return game.data.type === "word_picture_link" ? (
        <WordLink data={game.data} title={game.title} onComplete={onComplete} />
      ) : null;
    case "interactive_story":
      return game.data.type === "interactive_story" ? (
        <Story data={game.data} title={game.title} onComplete={onComplete} />
      ) : null;
    default:
      return null;
  }
}

function PictureQuiz({ data, title, onComplete }: { data: PictureQuizData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const question = data.questions[index];
  if (!question) return null;
  const last = index === data.questions.length - 1;
  return (
    <RoundFrame title={title} step={index + (picked ? 1 : 0)} total={data.questions.length} prompt={question.question}>
      {question.options.map((option) => (
        <AnswerButton
          key={option.id}
          icon={option.emoji}
          label={option.label}
          disabled={picked !== null}
          tone={picked === null ? undefined : option.id === question.correctId ? "good" : option.id === picked ? "bad" : undefined}
          onPress={() => {
            setPicked(option.id);
            if (option.id === question.correctId) setScore((value) => value + 1);
          }}
        />
      ))}
      {picked ? (
        <>
          <Text style={styles.note}>{question.explanation}</Text>
          <AnswerButton
            label={last ? "Finish" : "Next"}
            onPress={() => {
              if (last) onComplete(buildGameResult(score, data.questions.length, elapsed()));
              else {
                setPicked(null);
                setIndex((value) => value + 1);
              }
            }}
          />
        </>
      ) : null}
    </RoundFrame>
  );
}

function TrueFalse({ data, title, onComplete }: { data: TrueFalseData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const question = data.questions[index];
  if (!question) return null;
  const last = index === data.questions.length - 1;
  function choose(value: boolean) {
    if (picked !== null) return;
    setPicked(value);
    if (value === question.isTrue) setScore((current) => current + 1);
  }
  return (
    <RoundFrame title={title} step={index + (picked !== null ? 1 : 0)} total={data.questions.length} prompt={question.statement}>
      <Text style={styles.icon}>{question.emoji}</Text>
      <AnswerButton label="True" disabled={picked !== null} tone={picked === null ? undefined : question.isTrue ? "good" : picked === true ? "bad" : undefined} onPress={() => choose(true)} />
      <AnswerButton label="False" disabled={picked !== null} tone={picked === null ? undefined : !question.isTrue ? "good" : picked === false ? "bad" : undefined} onPress={() => choose(false)} />
      {picked !== null ? (
        <>
          <Text style={styles.note}>{question.explanation}</Text>
          <AnswerButton
            label={last ? "Finish" : "Next"}
            onPress={() => {
              if (last) onComplete(buildGameResult(score, data.questions.length, elapsed()));
              else {
                setPicked(null);
                setIndex((value) => value + 1);
              }
            }}
          />
        </>
      ) : null}
    </RoundFrame>
  );
}

function OddOneOut({ data, title, onComplete }: { data: OddOneOutData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const round = data.rounds[index];
  if (!round) return null;
  const last = index === data.rounds.length - 1;
  return (
    <RoundFrame title={title} step={index + (picked ? 1 : 0)} total={data.rounds.length} prompt={data.instruction || "Which one does not belong?"}>
      {round.items.map((item) => (
        <AnswerButton
          key={item.id}
          icon={item.emoji}
          label={item.label}
          disabled={picked !== null}
          tone={picked === null ? undefined : item.id === round.oddId ? "good" : item.id === picked ? "bad" : undefined}
          onPress={() => {
            setPicked(item.id);
            if (item.id === round.oddId) setScore((value) => value + 1);
          }}
        />
      ))}
      {picked ? (
        <>
          <Text style={styles.note}>{round.explanation}</Text>
          <AnswerButton
            label={last ? "Finish" : "Next"}
            onPress={() => {
              if (last) onComplete(buildGameResult(score, data.rounds.length, elapsed()));
              else {
                setPicked(null);
                setIndex((value) => value + 1);
              }
            }}
          />
        </>
      ) : null}
    </RoundFrame>
  );
}

function MemoryMatch({ data, title, onComplete }: { data: MemoryMatchData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const cards = useMemo(
    () =>
      shuffle(
        data.pairs.flatMap((pair) => [
          { key: `${pair.id}-a`, pairId: pair.id, emoji: pair.emoji, label: pair.front },
          { key: `${pair.id}-b`, pairId: pair.id, emoji: pair.emoji, label: pair.front },
        ]),
      ),
    [data.pairs],
  );
  const [up, setUp] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    if (up.length !== 2) return;
    const [first, second] = cards.filter((card) => up.includes(card.key));
    lock.current = true;
    const timer = setTimeout(() => {
      if (first && second && first.pairId === second.pairId) setMatched((current) => [...current, first.pairId]);
      else setMisses((current) => current + 1);
      setUp([]);
      lock.current = false;
    }, 700);
    return () => clearTimeout(timer);
  }, [cards, up]);

  const done = matched.length === data.pairs.length && data.pairs.length > 0;
  return (
    <RoundFrame title={title} step={matched.length} total={data.pairs.length} prompt={data.instruction || "Find the pairs."}>
      <View style={styles.grid}>
        {cards.map((card) => {
          const shown = up.includes(card.key) || matched.includes(card.pairId);
          return (
            <AnswerButton
              key={card.key}
              icon={shown ? card.emoji : "❔"}
              label={shown ? card.label : "Hidden card"}
              selected={shown}
              disabled={shown || lock.current || done}
              onPress={() => setUp((current) => (current.length >= 2 ? current : [...current, card.key]))}
            />
          );
        })}
      </View>
      {done ? (
        <AnswerButton
          label="Finish"
          onPress={() => onComplete(buildGameResult(data.pairs.length, data.pairs.length + misses, elapsed()))}
        />
      ) : null}
    </RoundFrame>
  );
}

function SequenceBuilder({ data, title, onComplete }: { data: SequenceBuilderData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const ordered = useMemo(() => [...data.steps].sort((a, b) => a.order - b.order), [data.steps]);
  const [bank] = useState(() => shuffle(ordered));
  const [placed, setPlaced] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const next = ordered[placed.length];
  const done = placed.length === ordered.length && ordered.length > 0;
  return (
    <RoundFrame title={title} step={placed.length} total={ordered.length} prompt={data.instruction || "Tap the steps in order."}>
      <Text style={styles.note}>{placed.length === 0 ? "Start with the first step." : `${placed.length} in place.`}</Text>
      {bank.map((step) =>
        placed.includes(step.id) ? null : (
          <AnswerButton
            key={step.id}
            icon={step.emoji}
            label={step.label}
            disabled={done}
            onPress={() => {
              if (step.id === next?.id) setPlaced((current) => [...current, step.id]);
              else setMisses((current) => current + 1);
            }}
          />
        ),
      )}
      {done ? (
        <AnswerButton
          label="Finish"
          onPress={() => onComplete(buildGameResult(Math.max(0, ordered.length - misses), ordered.length, elapsed()))}
        />
      ) : null}
    </RoundFrame>
  );
}

function TapSort({ data, title, onComplete }: { data: DragSortData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const [left, setLeft] = useState(data.items.map((item) => item.id));
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const item = data.items.find((entry) => entry.id === chosen);
  return (
    <RoundFrame title={title} step={data.items.length - left.length} total={data.items.length} prompt={data.instruction || "Tap an item, then where it belongs."}>
      {data.items.map((entry) =>
        left.includes(entry.id) ? (
          <AnswerButton
            key={entry.id}
            icon={entry.emoji}
            label={entry.label}
            selected={chosen === entry.id}
            onPress={() => setChosen(entry.id)}
          />
        ) : null,
      )}
      {item ? (
        <View style={styles.bank}>
          <Text style={type.small}>Where does {item.label} belong?</Text>
          {data.categories.map((category) => (
            <AnswerButton
              key={category.id}
              icon={category.emoji}
              label={category.label}
              onPress={() => {
                const correct = item.category === category.id;
                if (correct) setScore((current) => current + 1);
                else setMisses((current) => current + 1);
                const remaining = left.filter((id) => id !== item.id);
                setLeft(remaining);
                setChosen(null);
                if (remaining.length === 0) {
                  onComplete(buildGameResult(correct ? score + 1 : score, data.items.length + (correct ? misses : misses + 1), elapsed()));
                }
              }}
            />
          ))}
        </View>
      ) : null}
    </RoundFrame>
  );
}

function WordLink({ data, title, onComplete }: { data: WordPictureLinkData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const pictures = useMemo(() => shuffle(data.pairs), [data.pairs]);
  const [left, setLeft] = useState(data.pairs.map((pair) => pair.id));
  const [chosen, setChosen] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  return (
    <RoundFrame title={title} step={data.pairs.length - left.length} total={data.pairs.length} prompt={data.matchHint || data.instruction || "Tap a word, then its picture."}>
      {data.pairs.map((pair) =>
        left.includes(pair.id) ? (
          <AnswerButton
            key={pair.id}
            label={pair.wordDisplay || pair.word}
            selected={chosen === pair.id}
            onPress={() => setChosen(pair.id)}
          />
        ) : null,
      )}
      {chosen ? (
        <View style={styles.bank}>
          {pictures.map((pair) =>
            left.includes(pair.id) ? (
              <AnswerButton
                key={pair.id}
                icon={pair.emoji}
                label={pair.word}
                onPress={() => {
                  if (pair.id !== chosen) {
                    setMisses((current) => current + 1);
                    setChosen(null);
                    return;
                  }
                  const remaining = left.filter((id) => id !== pair.id);
                  setLeft(remaining);
                  setChosen(null);
                  if (remaining.length === 0) {
                    onComplete(buildGameResult(data.pairs.length, data.pairs.length + misses, elapsed()));
                  }
                }}
              />
            ) : null,
          )}
        </View>
      ) : null}
    </RoundFrame>
  );
}

function Story({ data, title, onComplete }: { data: InteractiveStoryData; title: string; onComplete: Finish }) {
  const elapsed = useClock();
  const [pageId, setPageId] = useState(data.pages[0]?.id ?? "");
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const page = data.pages.find((entry) => entry.id === pageId);
  if (!page) return null;
  function finish(nextAsked: number, nextCorrect: number) {
    const maxScore = Math.max(1, nextAsked);
    onComplete(buildGameResult(nextAsked === 0 ? 1 : nextCorrect, maxScore, elapsed()));
  }
  function go(nextPageId: string | null, wasChoice: boolean, choiceCorrect: boolean) {
    const nextAsked = asked + (wasChoice ? 1 : 0);
    const nextCorrect = correct + (choiceCorrect ? 1 : 0);
    setAsked(nextAsked);
    setCorrect(nextCorrect);
    const next = nextPageId ? data.pages.find((entry) => entry.id === nextPageId) : undefined;
    if (!next) finish(nextAsked, nextCorrect);
    else setPageId(next.id);
  }
  const index = data.pages.findIndex((entry) => entry.id === page.id);
  return (
    <RoundFrame title={title} step={index + 1} total={data.pages.length} prompt={page.text}>
      <Text style={styles.icon}>{page.emoji}</Text>
      {page.choices && page.choices.length > 0 ? (
        page.choices.map((choice) => (
          <AnswerButton
            key={choice.id}
            label={choice.label}
            onPress={() => go(choice.nextPageId, true, choice.correct)}
          />
        ))
      ) : (
        <AnswerButton
          label={index === data.pages.length - 1 ? "Finish" : "Next"}
          onPress={() => go(data.pages[index + 1]?.id ?? null, false, false)}
        />
      )}
    </RoundFrame>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 16, fontWeight: "700", color: colors.ink[700] },
  icon: { fontSize: 42, textAlign: "center" },
  grid: { gap: space.sm },
  bank: { gap: space.sm, marginTop: space.sm },
});
