"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getChildren,
  refreshParentCoachingReport,
  type ParentCoachingReport,
} from "@funberry/supabase";
import type { Child } from "@funberry/supabase";
import { useRouter } from "next/navigation";

function statusStyles(status: string) {
  switch (status) {
    case "strong":
      return { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", label: "On track" };
    case "developing":
      return { bar: "bg-sky-500", badge: "bg-sky-100 text-sky-800", label: "Building" };
    case "needs_attention":
      return { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-900", label: "Coach more" };
    default:
      return { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-600", label: "Not started" };
  }
}

export default function ProgressPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [report, setReport] = useState<ParentCoachingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getChildren();
        setChildren(data);
        if (data.length > 0) {
          setSelectedChild(data[0]!.id);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!selectedChild) return;
    let cancelled = false;
    setReportLoading(true);
    refreshParentCoachingReport(selectedChild)
      .then((r) => {
        if (!cancelled) setReport(r);
      })
      .catch(() => {
        if (!cancelled) setReport(null);
      })
      .finally(() => {
        if (!cancelled) setReportLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedChild]);

  const selected = children.find((c) => c.id === selectedChild);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <p className="text-sm font-semibold text-slate-500">Loading your growth report…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/30 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.03, x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="kid-glass-btn kid-glass-muted rounded-xl px-3 py-1.5 text-xs font-bold sm:text-sm"
          >
            ← Dashboard
          </motion.a>
          <motion.a
            href="/play"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="kid-glass-btn kid-glass-sky rounded-xl px-3 py-1.5 text-xs font-bold sm:text-sm"
          >
            Child play
          </motion.a>
        </div>

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">FunBerry · Grown-up zone</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Growth, smarts &amp; your game plan
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Play stays playful for kids; here you get the berry-powered view — themes, skills, habits, and a simple
            game plan for what to focus on next. Fun first, facts for grown-ups (not a doctor&apos;s report).
          </p>
        </header>

        {children.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <motion.button
                key={child.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedChild(child.id)}
                className={`kid-glass-btn rounded-xl px-3 py-1.5 text-xs font-bold sm:text-sm ${
                  selectedChild === child.id ? "kid-glass-violet" : "kid-glass-muted"
                }`}
              >
                {child.photo_url &&
                !child.photo_url.startsWith("data:") &&
                !child.photo_url.startsWith("http")
                  ? `${child.photo_url} `
                  : "🧒 "}
                {child.name}
              </motion.button>
            ))}
          </div>
        )}

        {reportLoading && (
          <p className="mb-4 text-center text-sm text-slate-500">Refreshing analysis from latest play data…</p>
        )}

        {report && selected && (
          <>
            <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                Learner snapshot
              </h2>
              <p className="mt-1 font-display text-xl font-bold text-slate-900">{selected.name}</p>
              <p className="text-sm text-slate-600">
                Age {selected.age} · {report.syllabusTrack}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Report generated {new Date(report.generatedAt).toLocaleString()} · {report.gamesSampleSize} play
                records analysed
              </p>
            </section>

            <section className="mb-6 rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4 sm:p-5">
              <h2 className="font-display text-lg font-bold text-indigo-950">How to read this HQ screen</h2>
              <p className="mt-2 text-sm leading-relaxed text-indigo-950/85">
                Start with <strong>Your game plan</strong> (below) for the biggest priority. Peek at{" "}
                <strong>Core capabilities</strong> for words you can share with a tutor or teacher.
                Use <strong>Learning habits</strong> to tell &quot;needs practice&quot; from &quot;hasn&apos;t tried enough
                game types yet.&quot; Syllabus strands map to school EVS themes.
              </p>
            </section>

            {report.decisionFramework && (
              <section className="mb-6 rounded-2xl border-2 border-slate-800/10 bg-slate-900 text-white p-4 shadow-lg sm:p-6">
                <h2 className="font-display text-lg font-bold text-white">Your game plan</h2>
                <p className="mt-2 text-sm font-semibold text-sky-200">{report.decisionFramework.headline}</p>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-100">
                  <p>
                    <span className="font-bold text-amber-300">Invest most in:</span> {report.decisionFramework.investMostIn}
                  </p>
                  <p>
                    <span className="font-bold text-emerald-300">Maintain &amp; celebrate:</span>{" "}
                    {report.decisionFramework.maintainAndCelebrate}
                  </p>
                  <p>
                    <span className="font-bold text-violet-300">Defer / avoid:</span> {report.decisionFramework.deferOrAvoid}
                  </p>
                </div>
                {report.decisionFramework.discussWithEducatorIf.length > 0 && (
                  <div className="mt-4 border-t border-white/15 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-200/90">
                      When to loop in school or a professional
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-200">
                      {report.decisionFramework.discussWithEducatorIf.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-slate-400">
                  {report.decisionFramework.disclaimer}
                </p>
              </section>
            )}

            {report.learningBehaviors && report.learningBehaviors.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-1 font-display text-lg font-bold text-slate-800">Learning habits (from behaviour)</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Inferred from session variety, retries, recency, and time — how your child practices, not just scores.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.learningBehaviors.map((b, i) => (
                    <motion.div
                      key={`${b.label}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-slate-200/90 bg-white/95 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-800">{b.label}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            b.signalStrength === "high"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.signalStrength === "moderate"
                                ? "bg-sky-100 text-sky-800"
                                : b.signalStrength === "low"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {b.signalStrength === "unknown" ? "n/a" : b.signalStrength}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{b.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {report.coreCapabilityInsights && report.coreCapabilityInsights.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-1 font-display text-lg font-bold text-slate-800">Core capabilities</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Higher-level developmental lenses — grouped from game mechanics and practice patterns. Use them to
                  discuss strengths and gaps without turning dinner into a test.
                </p>
                <div className="space-y-4">
                  {report.coreCapabilityInsights.map((cap, i) => (
                    <motion.div
                      key={cap.capabilityId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/90 to-white p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-violet-950 sm:text-lg">{cap.title}</h3>
                        {cap.score !== null ? (
                          <span className="font-display text-xl font-black tabular-nums text-violet-700">{cap.score}%</span>
                        ) : (
                          <span className="text-xs font-semibold text-violet-400">Building sample</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-violet-950/90">{cap.lensSummary}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-violet-800/70">Model read</p>
                      <p className="mt-1 text-sm text-violet-950/85">{cap.interpretation}</p>
                      <div className="mt-3 grid gap-2 border-t border-violet-200/60 pt-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-emerald-800">When things are going well</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">{cap.whatStrongSignals}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-amber-900">What to watch</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">{cap.whatToWatch}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-white/80 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Concrete parent moves</p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800">{cap.parentInterventions}</p>
                      </div>
                      {cap.score !== null && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100">
                          <div
                            className="h-1.5 rounded-full bg-violet-600"
                            style={{ width: `${Math.min(100, cap.score)}%` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-6">
              <h2 className="mb-3 font-display text-lg font-bold text-slate-800">Syllabus strands (EVS themes)</h2>
              <p className="mb-3 text-sm text-slate-600">
                School-aligned themes. Bars reflect stars earned in that theme relative to games touched — a curriculum
                map, not a personality label.
              </p>
              <div className="space-y-2">
                {report.strandInsights.map((s, i) => {
                  const st = statusStyles(s.status);
                  const pct = s.masteryPercent ?? 0;
                  return (
                    <motion.div
                      key={s.zoneId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="rounded-xl border border-slate-200/90 bg-white/95 p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-2xl" aria-hidden>
                            {s.emoji}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{s.strandTitle}</p>
                            <p className="text-xs text-slate-500">{s.zoneName}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.badge}`}>
                          {st.label}
                        </span>
                      </div>
                      {s.gamesPlayed > 0 && (
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full transition-all ${st.bar}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.summary}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {s.gamesPlayed}/{s.gamesInZone} games played · ⭐ {s.starsEarned} stars in strand
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <section className="mb-6">
              <h2 className="mb-3 font-display text-lg font-bold text-slate-800">Fine-grained skills (behind each game type)</h2>
              <p className="mb-3 text-sm text-slate-600">
                Technical decomposition: memory, attention, language, logic. Parents rarely need this daily — use it when
                you want to match a specific weakness to a game mechanic.
              </p>
              <div className="space-y-3">
                {report.skillInsights.map((sk, i) => (
                  <motion.div
                    key={sk.axisId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-xl border border-slate-200/90 bg-white/95 p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-800">{sk.title}</p>
                      {sk.score !== null ? (
                        <span className="font-display text-lg font-black text-violet-700 tabular-nums">
                          {sk.score}%
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">—</span>
                      )}
                    </div>
                    {sk.parentDescription ? (
                      <p className="mt-1 text-xs text-slate-600">{sk.parentDescription}</p>
                    ) : null}
                    {sk.score !== null && (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-violet-500"
                          style={{ width: `${sk.score}%` }}
                        />
                      </div>
                    )}
                    <p className="mt-2 text-sm text-slate-700">{sk.interpretation}</p>
                    {sk.supportTip ? (
                      <p className="mt-2 border-t border-slate-100 pt-2 text-xs font-medium text-emerald-800">
                        <span className="font-bold">At home:</span> {sk.supportTip}
                      </p>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-800">Strengths</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-emerald-900">
                  {report.strengths.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-amber-900">Growth focus</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-amber-950">
                  {report.growthAreas.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-6 rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4 sm:p-5">
              <h2 className="font-display text-lg font-bold text-violet-950">The big-picture scoop</h2>
              <p className="mt-2 text-sm leading-relaxed text-violet-950/90">{report.coachingNarrative}</p>
            </section>

            <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="font-display text-lg font-bold text-slate-800">Suggested next steps</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                {report.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </section>
          </>
        )}

        {!reportLoading && report && report.gamesSampleSize === 0 && (
          <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/80 p-8 text-center">
            <p className="font-display text-lg font-bold text-sky-900">No play data yet</p>
            <p className="mt-1 text-sm text-sky-800/80">
              Open <strong>Child play</strong> and complete a few games — this report fills in automatically.
            </p>
            <motion.a
              href="/play"
              className="kid-glass-btn kid-glass-sky mt-4 inline-block rounded-kid px-6 py-2.5 text-sm font-bold"
              whileHover={{ scale: 1.04 }}
            >
              Go to play
            </motion.a>
          </div>
        )}
      </div>
    </main>
  );
}
