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
import {
  BehaviorMeters,
  CapabilityBars,
  SkillsBarGrid,
  StrandMasteryChart,
} from "./ProgressReportVisuals";

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
      <div className="mx-auto max-w-6xl">
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
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">FunBerry · Grown-up Headquarter</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Growth, smarts &amp; your game plan
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Charts first — scroll for your game plan and next steps.
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
            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:col-span-2 sm:p-5">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                  Learner snapshot
                </h2>
                <p className="mt-1 font-display text-xl font-bold text-slate-900">{selected.name}</p>
                <p className="text-sm text-slate-600">
                  Age {selected.age} · {report.syllabusTrack}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Updated {new Date(report.generatedAt).toLocaleString()} · {report.gamesSampleSize} play rows
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Total ⭐ (profile)</p>
                <p className="mt-2 font-display text-4xl font-black tabular-nums text-amber-700">
                  {selected.total_stars ?? 0}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{
                      width: `${Math.min(100, ((selected.total_stars ?? 0) / Math.max(1, report.gamesSampleSize * 3)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[10px] font-semibold text-amber-900/80">
                  Updates when games finish (best stars + a bonus ⭐ when you replay a favourite).
                </p>
              </div>
            </section>

            <details className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-3 text-sm text-indigo-950">
              <summary className="cursor-pointer font-display font-bold text-indigo-950">
                How to read this screen
              </summary>
              <p className="mt-2 leading-relaxed">
                Use <strong>Your game plan</strong> for priorities. <strong>Habit meters</strong> show practice shape;
                <strong> theme grid</strong> maps ICSE-style EVS. Expand capability rows for at-home ideas.
              </p>
            </details>

            <div className="mb-6 space-y-6">
              <StrandMasteryChart report={report} />
              <div className="grid gap-6 lg:grid-cols-2">
                <SkillsBarGrid report={report} />
                <BehaviorMeters report={report} />
              </div>
              <CapabilityBars report={report} />
            </div>

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

            <details className="mb-6 rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4 sm:p-5">
              <summary className="cursor-pointer font-display text-lg font-bold text-violet-950">
                The big-picture scoop (text)
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-violet-950/90">{report.coachingNarrative}</p>
            </details>

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
