import { zones } from "@funberry/config";
import { allEvsGames } from "@funberry/game-engine";
import type { Child } from "./types";

export type CoachingSkillAxisRow = {
  id: string;
  title: string;
  parent_description: string;
  support_tip: string;
  sort_order: number;
};

export type CoachingContributionRow = {
  game_type: string;
  skill_axis_id: string;
  weight: number;
};

export type CoachingCoreCapabilityRow = {
  id: string;
  title: string;
  lens_summary: string;
  what_strong_signals: string;
  what_to_watch: string;
  parent_interventions: string;
  sort_order: number;
};

export type SkillAxisCapabilityMapRow = {
  skill_axis_id: string;
  capability_id: string;
  weight: number;
};

export type StrandInsight = {
  zoneId: string;
  strandTitle: string;
  zoneName: string;
  emoji: string;
  masteryPercent: number | null;
  gamesPlayed: number;
  gamesInZone: number;
  starsEarned: number;
  status: "strong" | "developing" | "needs_attention" | "not_started";
  summary: string;
};

export type SkillInsight = {
  axisId: string;
  title: string;
  score: number | null;
  interpretation: string;
  supportTip: string;
  parentDescription: string;
};

export type CoreCapabilityInsight = {
  capabilityId: string;
  title: string;
  score: number | null;
  lensSummary: string;
  whatStrongSignals: string;
  whatToWatch: string;
  parentInterventions: string;
  interpretation: string;
};

export type LearningBehaviorInsight = {
  label: string;
  detail: string;
  signalStrength: "high" | "moderate" | "low" | "unknown";
};

export type ParentDecisionFramework = {
  headline: string;
  investMostIn: string;
  maintainAndCelebrate: string;
  deferOrAvoid: string;
  discussWithEducatorIf: string[];
  disclaimer: string;
};

export type ParentCoachingReport = {
  childId: string;
  childName: string;
  childAge: number;
  generatedAt: string;
  syllabusTrack: string;
  strandInsights: StrandInsight[];
  skillInsights: SkillInsight[];
  strengths: string[];
  growthAreas: string[];
  coachingNarrative: string;
  nextSteps: string[];
  gamesSampleSize: number;
  coreCapabilityInsights: CoreCapabilityInsight[];
  learningBehaviors: LearningBehaviorInsight[];
  decisionFramework: ParentDecisionFramework;
};

export type ProgressRowLike = {
  game_id: string;
  stars_earned: number;
  attempts?: number;
  completed?: boolean;
  score?: number;
  time_spent_seconds?: number;
  completed_at?: string | null;
  created_at?: string;
  games?: { zone_id?: string; game_type?: string } | null;
};

/** Mirrors DB seed — used if Supabase reference tables are empty (pre-migration). */
export const FALLBACK_COACHING_AXES: CoachingSkillAxisRow[] = [
  { id: "memory_focus", title: "Memory & recall", parent_description: "", support_tip: "", sort_order: 1 },
  { id: "visual_attention", title: "Visual focus & detail", parent_description: "", support_tip: "", sort_order: 2 },
  { id: "sequential_thinking", title: "Order & sequencing", parent_description: "", support_tip: "", sort_order: 3 },
  { id: "language_semantics", title: "Words & meaning", parent_description: "", support_tip: "", sort_order: 4 },
  { id: "classification_logic", title: "Sorting & categories", parent_description: "", support_tip: "", sort_order: 5 },
  { id: "inference_control", title: "Inference & self-control", parent_description: "", support_tip: "", sort_order: 6 },
];

export const FALLBACK_CONTRIBUTIONS: CoachingContributionRow[] = [
  { game_type: "picture_quiz", skill_axis_id: "memory_focus", weight: 2 },
  { game_type: "picture_quiz", skill_axis_id: "language_semantics", weight: 2 },
  { game_type: "drag_sort", skill_axis_id: "classification_logic", weight: 3 },
  { game_type: "drag_sort", skill_axis_id: "sequential_thinking", weight: 1 },
  { game_type: "memory_match", skill_axis_id: "memory_focus", weight: 3 },
  { game_type: "memory_match", skill_axis_id: "visual_attention", weight: 2 },
  { game_type: "sequence_builder", skill_axis_id: "sequential_thinking", weight: 3 },
  { game_type: "sequence_builder", skill_axis_id: "classification_logic", weight: 1 },
  { game_type: "spot_difference", skill_axis_id: "visual_attention", weight: 3 },
  { game_type: "spot_difference", skill_axis_id: "memory_focus", weight: 1 },
  { game_type: "odd_one_out", skill_axis_id: "classification_logic", weight: 2 },
  { game_type: "odd_one_out", skill_axis_id: "inference_control", weight: 2 },
  { game_type: "true_false", skill_axis_id: "inference_control", weight: 2 },
  { game_type: "true_false", skill_axis_id: "language_semantics", weight: 1 },
  { game_type: "color_activity", skill_axis_id: "visual_attention", weight: 2 },
  { game_type: "color_activity", skill_axis_id: "classification_logic", weight: 2 },
  { game_type: "word_picture_link", skill_axis_id: "language_semantics", weight: 3 },
  { game_type: "word_picture_link", skill_axis_id: "memory_focus", weight: 1 },
  { game_type: "interactive_story", skill_axis_id: "language_semantics", weight: 2 },
  { game_type: "interactive_story", skill_axis_id: "inference_control", weight: 2 },
  { game_type: "interactive_story", skill_axis_id: "sequential_thinking", weight: 1 },
  { game_type: "bubble_pop", skill_axis_id: "visual_attention", weight: 2 },
  { game_type: "bubble_pop", skill_axis_id: "memory_focus", weight: 1 },
  { game_type: "star_catcher", skill_axis_id: "visual_attention", weight: 3 },
  { game_type: "star_catcher", skill_axis_id: "sequential_thinking", weight: 1 },
];

export const FALLBACK_CORE_CAPABILITIES: CoachingCoreCapabilityRow[] = [
  {
    id: "deep_focus_self_control",
    title: "Focus & self-control",
    lens_summary:
      "This bundles attentional control and parts of executive function: staying on task, filtering distractions, and pausing before answering. Games that reward accuracy train habits that later appear as classroom behaviour and homework stamina.",
    what_strong_signals:
      "Sustains attention across detail-heavy activities, recovers after mistakes, and does not need constant redirection between short tasks.",
    what_to_watch:
      "Impulsive taps, giving up after one wrong answer, or score drops only on speed-based games may mean this area needs gentle scaffolding.",
    parent_interventions:
      "Predictable routines before study; “pause and point” before tapping; shorter sessions but more often; praise effort after errors.",
    sort_order: 1,
  },
  {
    id: "memory_and_language",
    title: "Memory & language meaning",
    lens_summary:
      "Working memory and semantic understanding together: holding a rule in mind while linking words to meaning. Strong here predicts smoother reading comprehension and following multi-step instructions.",
    what_strong_signals:
      "Remembers rules, links vocabulary to images, improves on repeat visits without frustration.",
    what_to_watch:
      "Struggles matching words to pictures or forgets pairs quickly — may mirror difficulty retelling a story.",
    parent_interventions:
      "Read aloud daily; “remember three things on the tray”; narrate your actions; two-choice questions to reduce load.",
    sort_order: 2,
  },
  {
    id: "logic_order_and_categories",
    title: "Logic, order & categories",
    lens_summary:
      "Sorting by rules, same/different, and ordering steps — foundations for maths and science reasoning. Less about facts, more about flexible rule-following.",
    what_strong_signals:
      "Comfortable when the sort rule changes; completes sequencing; explains why something belongs in a group.",
    what_to_watch:
      "Stuck when rules change, or avoids sorting/ordering in favour of one favourite mechanic only.",
    parent_interventions:
      "Sort real objects naming one rule; “first / next / last” routines; “what is different?” with two drawings.",
    sort_order: 3,
  },
  {
    id: "learning_habits_and_grit",
    title: "Learning habits & persistence",
    lens_summary:
      "Inferred from variety of games, retries, and practice volume — not IQ. Measures whether a healthy practice mindset is forming.",
    what_strong_signals:
      "Many activity types, returns to harder games, steady session pattern rather than one-off spikes.",
    what_to_watch:
      "Single game type, very few sessions, or many attempts without upward star trend.",
    parent_interventions:
      "Celebrate retries; rotate three game types weekly; keep wins visible; favour intrinsic curiosity over star-based bribes.",
    sort_order: 4,
  },
];

export const FALLBACK_AXIS_CAPABILITY_MAP: SkillAxisCapabilityMapRow[] = [
  { skill_axis_id: "visual_attention", capability_id: "deep_focus_self_control", weight: 1 },
  { skill_axis_id: "inference_control", capability_id: "deep_focus_self_control", weight: 1 },
  { skill_axis_id: "memory_focus", capability_id: "memory_and_language", weight: 1 },
  { skill_axis_id: "language_semantics", capability_id: "memory_and_language", weight: 1 },
  { skill_axis_id: "classification_logic", capability_id: "logic_order_and_categories", weight: 1 },
  { skill_axis_id: "sequential_thinking", capability_id: "logic_order_and_categories", weight: 1 },
];

function buildGameLookup(): Map<string, { zoneId: string; type: string; title: string }> {
  const map = new Map<string, { zoneId: string; type: string; title: string }>();
  for (const [zoneId, list] of Object.entries(allEvsGames)) {
    for (const g of list) {
      map.set(g.id, { zoneId, type: g.type, title: g.title });
    }
  }
  return map;
}

function computeBehavioralHabitsScore(
  progressRows: ProgressRowLike[],
  gameById: Map<string, { zoneId: string; type: string; title: string }>,
): number | null {
  if (progressRows.length === 0) return null;
  const types = new Set<string>();
  for (const r of progressRows) {
    const gt = gameById.get(r.game_id)?.type ?? r.games?.game_type;
    if (gt) types.add(gt);
  }
  const breadth = Math.min(100, Math.round((types.size / 10) * 100));
  const attemptsAvg =
    progressRows.reduce((s, r) => s + Math.max(1, r.attempts ?? 1), 0) / progressRows.length;
  const persistence = Math.min(100, Math.round((Math.min(attemptsAvg, 4) / 4) * 100));
  const volume = Math.min(100, progressRows.length * 8);
  return Math.round(breadth * 0.4 + persistence * 0.35 + volume * 0.25);
}

function analyzeLearningBehaviors(
  progressRows: ProgressRowLike[],
  gameById: Map<string, { zoneId: string; type: string; title: string }>,
): LearningBehaviorInsight[] {
  const out: LearningBehaviorInsight[] = [];
  if (progressRows.length === 0) {
    out.push({
      label: "Practice volume",
      detail: "No sessions recorded yet — the profile below will populate after a few short play visits.",
      signalStrength: "unknown",
    });
    return out;
  }

  const types = new Set<string>();
  let totalTime = 0;
  let timeCount = 0;
  for (const r of progressRows) {
    const gt = gameById.get(r.game_id)?.type ?? r.games?.game_type;
    if (gt) types.add(gt);
    if (r.time_spent_seconds != null && r.time_spent_seconds > 0) {
      totalTime += r.time_spent_seconds;
      timeCount += 1;
    }
  }

  const breadthStrength: LearningBehaviorInsight["signalStrength"] =
    types.size >= 6 ? "high" : types.size >= 3 ? "moderate" : "low";
  out.push({
    label: "Variety of challenges",
    detail:
      breadthStrength === "high"
        ? `${types.size} game types appear in the log. That breadth makes the capability read more reliable — strengths and gaps are less likely to be a statistical fluke.`
        : breadthStrength === "moderate"
          ? `${types.size} game types so far. Rotate quizzes, sorting, memory, and stories so we can separate attention issues from content gaps.`
          : `Only ${types.size} game type(s) dominate the log. Narrow practice can hide weaknesses in other cognitive habits school will still require.`,
    signalStrength: breadthStrength,
  });

  const attemptsAvg =
    progressRows.reduce((s, r) => s + Math.max(1, r.attempts ?? 1), 0) / progressRows.length;
  const pers: LearningBehaviorInsight["signalStrength"] =
    attemptsAvg >= 2 ? "high" : attemptsAvg > 1.15 ? "moderate" : "low";
  out.push({
    label: "Persistence & retries",
    detail:
      pers === "high"
        ? "Higher attempt counts usually mean your child tolerates imperfection and loops back — a predictor of better long-term learning, not “being bad at games”."
        : pers === "moderate"
          ? "Some retries show up. Naming “good try, one more go” after a miss builds the same habit in homework later."
          : "Few repeats may mean first-try success or quick exits after errors — worth watching in offline tasks too.",
    signalStrength: pers,
  });

  let latest: string | null = null;
  for (const r of progressRows) {
    const ts = r.completed_at || r.created_at;
    if (ts && (!latest || ts > latest)) latest = ts;
  }
  if (latest) {
    const days = (Date.now() - new Date(latest).getTime()) / 86400000;
    const rec: LearningBehaviorInsight["signalStrength"] =
      days <= 3 ? "high" : days <= 14 ? "moderate" : "low";
    out.push({
      label: "Recency of play",
      detail:
        rec === "high"
          ? "Play is recent — this snapshot reflects current behaviour."
          : rec === "moderate"
            ? "A short gap since last play. Refresh with one or two sessions before big decisions."
            : "It has been a while — treat this report as historical until play resumes.",
      signalStrength: rec,
    });
  }

  if (timeCount > 0) {
    const avgSec = totalTime / timeCount;
    out.push({
      label: "Time on task",
      detail:
        avgSec < 45
          ? "Sessions are short — fine for young children; if accuracy drops, check for rushing."
          : avgSec < 180
            ? "Session length suggests sustained attention without obvious fatigue."
            : "Some long runs — if quality drops at the end, two shorter bursts often beat one marathon.",
      signalStrength: "moderate",
    });
  }

  return out;
}

function buildCoreCapabilityInsights(
  caps: CoachingCoreCapabilityRow[],
  axisMap: SkillAxisCapabilityMapRow[],
  skillByAxisScore: Record<string, number | null>,
  behavioralScore: number | null,
): CoreCapabilityInsight[] {
  const capList = caps.length ? caps : FALLBACK_CORE_CAPABILITIES;
  const mapList = axisMap.length ? axisMap : FALLBACK_AXIS_CAPABILITY_MAP;
  const sortedCaps = capList.slice().sort((a, b) => a.sort_order - b.sort_order);
  const out: CoreCapabilityInsight[] = [];

  for (const cap of sortedCaps) {
    if (cap.id === "learning_habits_and_grit") {
      const score = behavioralScore;
      let interpretation: string;
      if (score === null) {
        interpretation = "Not enough data yet — encourage a few varied sessions.";
      } else if (score >= 72) {
        interpretation =
          "Practice habits look constructive: variety, volume, and willingness to loop back are trending the right way.";
      } else if (score >= 45) {
        interpretation =
          "Habits are forming — small nudges toward breadth and gentle retry culture will compound over months.";
      } else {
        interpretation =
          "Coach the process (how they practice) alongside content — short wins, rotated games, explicit praise for trying again.";
      }
      out.push({
        capabilityId: cap.id,
        title: cap.title,
        score,
        lensSummary: cap.lens_summary,
        whatStrongSignals: cap.what_strong_signals,
        whatToWatch: cap.what_to_watch,
        parentInterventions: cap.parent_interventions,
        interpretation,
      });
      continue;
    }

    const links = mapList.filter((m) => m.capability_id === cap.id);
    let num = 0;
    let den = 0;
    for (const m of links) {
      const sc = skillByAxisScore[m.skill_axis_id];
      if (sc !== null && sc !== undefined) {
        num += sc * Number(m.weight);
        den += Number(m.weight);
      }
    }
    const score = den > 0 ? Math.round(num / den) : null;
    let interpretation: string;
    if (score === null) {
      interpretation =
        "Not enough overlapping play in games that load this domain — add attention, language, or logic-heavy activities.";
    } else if (score >= 72) {
      interpretation = "Signals in this developmental area look solid relative to the current play sample.";
    } else if (score >= 45) {
      interpretation = "Mid-range — offline activities below will reinforce what the games are probing.";
    } else {
      interpretation = "A high-leverage place to invest intentional parent time over the next few weeks.";
    }
    out.push({
      capabilityId: cap.id,
      title: cap.title,
      score,
      lensSummary: cap.lens_summary,
      whatStrongSignals: cap.what_strong_signals,
      whatToWatch: cap.what_to_watch,
      parentInterventions: cap.parent_interventions,
      interpretation,
    });
  }
  return out;
}

function buildDecisionFramework(
  child: Child,
  strandInsights: StrandInsight[],
  coreCapabilityInsights: CoreCapabilityInsight[],
  strengths: string[],
  growthAreas: string[],
  behaviors: LearningBehaviorInsight[],
  gamesSampleSize: number,
): ParentDecisionFramework {
  const scoredCaps = coreCapabilityInsights.filter((c) => c.score !== null) as (CoreCapabilityInsight & {
    score: number;
  })[];
  const weakestCap = scoredCaps.slice().sort((a, b) => a.score - b.score)[0];
  const strongestCap = scoredCaps.slice().sort((a, b) => b.score - a.score)[0];
  const strandNeed = strandInsights.find((s) => s.status === "needs_attention" && s.gamesPlayed > 0);

  const investMostIn = weakestCap
    ? `Prioritise “${weakestCap.title}” (modelled ~${weakestCap.score}% from play)${
        strandNeed ? ` alongside syllabus coaching in “${strandNeed.strandTitle}”` : ""
      }. Use the interventions box for that capability — they are written for home, not classroom jargon.`
    : strandNeed
      ? `Lead with syllabus thread “${strandNeed.strandTitle}” until cognitive signals populate from wider play.`
      : "Run a two-week plan: one strand per week plus three different game mechanics each week.";

  const maintainAndCelebrate = strongestCap
    ? `Keep enriching “${strongestCap.title}” — ${strengths.slice(0, 2).join(", ") || "double down on what already feels easy and fun"}.`
    : `Celebrate small wins tied to ${growthAreas[0] ?? "effort"} so motivation stays high while you scaffold harder areas.`;

  const discussWithEducatorIf: string[] = [];
  const recency = behaviors.find((b) => b.label === "Recency of play");
  if (recency?.signalStrength === "low") {
    discussWithEducatorIf.push(
      "Play has been quiet for weeks while you see similar avoidance or fatigue with schoolwork — worth a gentle check-in with the teacher.",
    );
  }
  const breadth = behaviors.find((b) => b.label === "Variety of challenges");
  if (breadth?.signalStrength === "low" && gamesSampleSize >= 6) {
    discussWithEducatorIf.push(
      "Very narrow in-app preferences after many sessions — if the same rigidity appears in class (only one subject, one activity), mention it when you meet the school.",
    );
  }
  if (weakestCap && weakestCap.score < 38 && gamesSampleSize >= 8) {
    discussWithEducatorIf.push(
      `Persistently low signal in “${weakestCap.title}” across many games — not a label, but a prompt to compare with what you see offline and at school.`,
    );
  }

  return {
    headline: `Decision frame for ${child.name}: pick one support lane, protect one strength, and avoid drill burnout.`,
    investMostIn,
    maintainAndCelebrate,
    deferOrAvoid:
      "Do not turn every session into fixing the lowest score — alternate challenge games with “confidence builders” so the child still associates learning with joy.",
    discussWithEducatorIf,
    disclaimer:
      "FunBerryKids summarises educational patterns from gameplay. It is not a medical or psychological diagnosis. For developmental concerns, consult qualified professionals and your child’s teacher.",
  };
}

function buildNarrative(
  child: Child,
  strands: StrandInsight[],
  strengths: string[],
  growthAreas: string[],
  coreCapabilityInsights: CoreCapabilityInsight[],
  learningBehaviors: LearningBehaviorInsight[],
): string {
  const played = strands.filter((s) => s.gamesPlayed > 0).length;
  const strongStrands = strands.filter((s) => s.status === "strong").map((s) => s.strandTitle);
  const weakStrands = strands.filter((s) => s.status === "needs_attention" && s.gamesPlayed > 0).map((s) => s.strandTitle);

  const parts: string[] = [];

  parts.push(
    `${child.name} (age ${child.age}) experiences FunBerry as bright, game-like worlds. Behind that is deliberate EVS-aligned content and telemetry on cognitive habits — memory, attention, language, logic, and how they actually practice. Your job on this screen is bigger than theirs in the long run: interpreting signals, choosing where to coach, and knowing when to involve school or specialists.`,
  );

  if (played === 0) {
    parts.push(
      "Once a few sessions exist, you will see syllabus strands, core capabilities derived from those sessions, and behaviour signals (variety, retries, recency). Schedule three short visits this week — quality of parenting decisions improves with sample size, not star counts alone.",
    );
    return parts.join(" ");
  }

  const lowCap = coreCapabilityInsights
    .filter((c) => c.score !== null && c.score < 48)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  const highCap = coreCapabilityInsights
    .filter((c) => c.score !== null && c.score >= 70)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];

  if (highCap) {
    parts.push(
      `Developmentally, ${child.name} is currently showing a clearer signal in “${highCap.title.toLowerCase()}” — that is a resource you can lean on while you scaffold weaker areas.`,
    );
  }
  if (lowCap) {
    parts.push(
      `The deepest coaching opportunity right now sits in “${lowCap.title.toLowerCase()}” — not as a label, but as a cluster of habits schools will keep asking for. The capability cards below translate that into what to watch at home.`,
    );
  }

  if (strongStrands.length) {
    parts.push(
      `On syllabus themes, relative strengths include: ${strongStrands.slice(0, 3).join(", ")}. Name those wins aloud; it links pride to the same content they will see in class.`,
    );
  }

  if (weakStrands.length) {
    parts.push(
      `Themes that deserve lighter, more frequent touch: ${weakStrands.slice(0, 2).join(" and ")} — short retries beat rare long cram sessions.`,
    );
  }

  const beh = learningBehaviors.find((b) => b.label === "Variety of challenges");
  if (beh?.signalStrength === "low") {
    parts.push(
      "Behaviourally, play has been narrow — before making big conclusions about “weak subjects,” widen the game types for two weeks; many apparent gaps are sampling gaps.",
    );
  }

  if (strengths.length && growthAreas.length) {
    parts.push(
      `Fine-grained mechanics still show strength in ${strengths[0]!.toLowerCase()} and headroom in ${growthAreas[0]!.toLowerCase()} — normal at this age; mixed play closes the gap faster than repeating one favourite.`,
    );
  } else if (growthAreas.length) {
    parts.push(
      `Fine-grained skills point to gentle emphasis on ${growthAreas[0]!.toLowerCase()} in daily routines as well as in-app.`,
    );
  }

  parts.push(
    "Use this page as a coaching cockpit: the child keeps the illusion of play; you keep the thread to school readiness and long-term confidence.",
  );

  return parts.join(" ");
}

function buildNextSteps(strands: StrandInsight[], skills: SkillInsight[]): string[] {
  const steps: string[] = [];
  const needStrand = strands.find((s) => s.status === "needs_attention" && s.gamesPlayed > 0);
  if (needStrand) {
    steps.push(`Schedule two 8-minute sessions in “${needStrand.zoneName}” (${needStrand.strandTitle}) this week.`);
  }
  const lowSkill = skills.filter((s) => s.score !== null && s.score < 50).sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (lowSkill) {
    steps.push(`Pair on-screen play with one offline activity that loads “${lowSkill.title}”: ${lowSkill.supportTip || "see tip under that skill below."}`);
  }
  const highSkill = skills.filter((s) => s.score !== null && s.score >= 75)[0];
  if (highSkill) {
    steps.push(`Leverage strength in “${highSkill.title}” — offer slightly harder variants or explain strategies to a sibling or toy to deepen mastery.`);
  }
  if (steps.length < 2) {
    steps.push("Rotate game types (quiz + sort + story) in one sitting to diversify the skill sample.");
  }
  if (steps.length < 3) {
    steps.push("Review this report after the next five play sessions to see trends, not single-day noise.");
  }
  return steps.slice(0, 5);
}

export function buildParentCoachingReport(
  child: Child,
  progressRows: ProgressRowLike[],
  axes: CoachingSkillAxisRow[],
  contributions: CoachingContributionRow[],
  coreCapabilities: CoachingCoreCapabilityRow[] = [],
  axisCapabilityMap: SkillAxisCapabilityMapRow[] = [],
): ParentCoachingReport {
  const gameById = buildGameLookup();
  const axisList = axes.length ? axes : FALLBACK_COACHING_AXES;
  const contribList = contributions.length ? contributions : FALLBACK_CONTRIBUTIONS;

  const contribByType = new Map<string, { skill_axis_id: string; weight: number }[]>();
  for (const c of contribList) {
    const list = contribByType.get(c.game_type) ?? [];
    list.push({ skill_axis_id: c.skill_axis_id, weight: Number(c.weight) });
    contribByType.set(c.game_type, list);
  }

  const strandInsights: StrandInsight[] = zones.map((z) => {
    const zoneGames = allEvsGames[z.id] ?? [];
    const ids = new Set(zoneGames.map((g) => g.id));
    const rows = progressRows.filter((p) => {
      const meta = gameById.get(p.game_id);
      const zid = meta?.zoneId ?? p.games?.zone_id;
      return zid === z.id || ids.has(p.game_id);
    });
    const played = rows.length;
    const starsEarned = rows.reduce((s, r) => s + (r.stars_earned ?? 0), 0);
    const maxStars = played * 3;
    const masteryPercent = maxStars > 0 ? Math.round((starsEarned / maxStars) * 100) : null;

    let status: StrandInsight["status"] = "not_started";
    if (played === 0) status = "not_started";
    else if (masteryPercent !== null && masteryPercent >= 72) status = "strong";
    else if (masteryPercent !== null && masteryPercent >= 40) status = "developing";
    else status = "needs_attention";

    let summary: string;
    if (status === "not_started") {
      summary = `No sessions yet in “${z.evsTheme}”.`;
    } else if (status === "strong") {
      summary = `Strong engagement in ${z.evsTheme.toLowerCase()} — connect play to real-life examples this week.`;
    } else if (status === "developing") {
      summary = `Steady progress in ${z.evsTheme.toLowerCase()} — add one short stretch activity between play sessions.`;
    } else {
      summary = `Extra coaching focus in ${z.evsTheme.toLowerCase()} — brief daily play beats occasional long sessions.`;
    }

    return {
      zoneId: z.id,
      strandTitle: z.evsTheme,
      zoneName: z.name,
      emoji: z.emoji,
      masteryPercent,
      gamesPlayed: played,
      gamesInZone: zoneGames.length,
      starsEarned,
      status,
      summary,
    };
  });

  const axisNum: Record<string, number> = {};
  const axisDen: Record<string, number> = {};

  for (const row of progressRows) {
    const meta = gameById.get(row.game_id);
    const gt = meta?.type ?? row.games?.game_type;
    if (!gt) continue;
    const contribs = contribByType.get(gt);
    if (!contribs?.length) continue;
    const norm = Math.min(1, Math.max(0, (row.stars_earned ?? 0) / 3));
    for (const { skill_axis_id, weight } of contribs) {
      axisNum[skill_axis_id] = (axisNum[skill_axis_id] ?? 0) + norm * weight;
      axisDen[skill_axis_id] = (axisDen[skill_axis_id] ?? 0) + weight;
    }
  }

  const skillInsights: SkillInsight[] = axisList
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ax) => {
      const den = axisDen[ax.id] ?? 0;
      const score = den > 0 ? Math.round(((axisNum[ax.id] ?? 0) / den) * 100) : null;
      let interpretation: string;
      if (score === null) {
        interpretation =
          "Not enough varied play yet — mix quizzes, sorting, memory, and stories for a fuller picture.";
      } else if (score >= 75) {
        interpretation = "Confident performance on activities that load this skill.";
      } else if (score >= 45) {
        interpretation = "Skill is emerging — regular short practice will consolidate it.";
      } else {
        interpretation = "This area will respond well to focused, playful coaching.";
      }
      return {
        axisId: ax.id,
        title: ax.title,
        score,
        interpretation,
        supportTip: ax.support_tip || "",
        parentDescription: ax.parent_description || "",
      };
    });

  const scored = skillInsights.filter((s): s is SkillInsight & { score: number } => s.score !== null);
  const strengthTitles = scored
    .filter((s) => s.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.title);
  const growthTitles = scored
    .filter((s) => s.score < 55)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((s) => s.title);

  const strengths =
    strengthTitles.length > 0 ? strengthTitles : ["Consistency — keep sessions short and regular."];
  const growthAreas =
    growthTitles.length > 0 ? growthTitles : ["Broader game mix — try each activity type at least once."];

  const skillByAxisScore: Record<string, number | null> = Object.fromEntries(
    skillInsights.map((s) => [s.axisId, s.score]),
  );
  const behavioralScore = computeBehavioralHabitsScore(progressRows, gameById);
  const learningBehaviors = analyzeLearningBehaviors(progressRows, gameById);
  const coreCapabilityInsights = buildCoreCapabilityInsights(
    coreCapabilities,
    axisCapabilityMap,
    skillByAxisScore,
    behavioralScore,
  );
  const decisionFramework = buildDecisionFramework(
    child,
    strandInsights,
    coreCapabilityInsights,
    strengths,
    growthAreas,
    learningBehaviors,
    progressRows.length,
  );
  const coachingNarrative = buildNarrative(
    child,
    strandInsights,
    strengths,
    growthAreas,
    coreCapabilityInsights,
    learningBehaviors,
  );
  let nextSteps = buildNextSteps(strandInsights, skillInsights);
  const lowCap = coreCapabilityInsights
    .filter((c) => c.capabilityId !== "learning_habits_and_grit" && c.score !== null && c.score < 52)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (lowCap && nextSteps.length < 5) {
    nextSteps = [
      ...nextSteps,
      `Read the “${lowCap.title}” capability card with your co-parent or tutor — pick one intervention sentence to use daily for two weeks.`,
    ];
  }

  return {
    childId: child.id,
    childName: child.name,
    childAge: child.age,
    generatedAt: new Date().toISOString(),
    syllabusTrack: "EVS — syllabus-aligned themes (ICSE-style) delivered through play",
    strandInsights,
    skillInsights,
    strengths,
    growthAreas,
    coachingNarrative,
    nextSteps: nextSteps.slice(0, 6),
    gamesSampleSize: progressRows.length,
    coreCapabilityInsights,
    learningBehaviors,
    decisionFramework,
  };
}
