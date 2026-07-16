"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";
import type { AnyQuestion, QuizAnswer } from "@/lib/types";
import { isClosed } from "@/lib/types";
import { weakQuestionIds, overallAccuracy } from "@/lib/history";

const LABELS = ["А", "Б", "В", "Г"];
const ADAPTIVE_TOTAL = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// "Weak spots": questions this device answered wrong before, worst first.
function buildWeakQuiz(): AnyQuestion[] {
  const byId = new Map<string, AnyQuestion>();
  for (const q of questions) byId.set(q.id, q);
  for (const q of openQuestions) byId.set(q.id, q);
  return weakQuestionIds()
    .map((id) => byId.get(id))
    .filter((q): q is AnyQuestion => Boolean(q))
    .slice(0, 12);
}

// Adaptive pool: closed + auto-gradable short answers (open responses are
// always marked correct, which would skew the difficulty signal).
function buildAdaptivePool(topic: string | null): AnyQuestion[] {
  const closed = topic ? questions.filter((q) => q.topic === topic) : questions;
  const open = (topic ? openQuestions.filter((q) => q.topic === topic) : openQuestions)
    .filter((q) => q.type === "short_answer" && q.acceptedAnswers.length > 0);
  return [...closed, ...open];
}

// Start level from rolling accuracy so returning users skip the warm-up.
function initialDifficulty(): 1 | 2 | 3 {
  const acc = overallAccuracy();
  if (acc === null) return 1;
  if (acc >= 0.8) return 3;
  if (acc >= 0.5) return 2;
  return 1;
}

function buildQuiz(topic: string | null, mode: string): AnyQuestion[] {
  if (mode === "weak") return buildWeakQuiz();
  const closedPool = topic ? questions.filter((q) => q.topic === topic) : questions;
  const openPool   = topic ? openQuestions.filter((q) => q.topic === topic) : openQuestions;
  let closedCount: number, openCount: number;
  switch (mode) {
    case "6":  closedCount = 4;  openCount = 2;  break;
    case "12": closedCount = 8;  openCount = 4;  break;
    default:   closedCount = 15; openCount = 10; break;
  }
  return [...shuffle(closedPool).slice(0, closedCount), ...shuffle(openPool).slice(0, openCount)];
}

type QState = "answering" | "answered";

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get("topic") ?? null;
  const mode  = searchParams.get("mode") ?? "dzi";
  const adaptive = mode === "adaptive";

  const adaptivePoolRef = useRef<AnyQuestion[]>([]);
  const diffRef = useRef<number>(0);
  const usedRef = useRef<Set<string>>(new Set());

  // Built on the client only (shuffle + localStorage would mismatch the SSR pass).
  const [pool, setPool] = useState<AnyQuestion[] | null>(null);
  const [targetLen, setTargetLen] = useState(0);

  useEffect(() => {
    if (!adaptive) {
      const p = buildQuiz(topic, mode);
      setPool(p);
      setTargetLen(p.length);
      return;
    }
    const ap = buildAdaptivePool(topic);
    adaptivePoolRef.current = ap;
    if (ap.length === 0) {
      setPool([]);
      return;
    }
    diffRef.current = initialDifficulty();
    const startCandidates = ap.filter((q) => q.difficulty === diffRef.current);
    const first = shuffle(startCandidates.length ? startCandidates : ap)[0];
    usedRef.current.add(first.id);
    setPool([first]);
    setTargetLen(Math.min(ADAPTIVE_TOTAL, ap.length));
  }, []);

  const [index, setIndex]     = useState(0);
  const [qState, setQState]   = useState<QState>("answering");
  const [selIdx, setSelIdx]   = useState<number | null>(null);
  const [text, setText]       = useState("");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  // Pick the next adaptive question: step difficulty up on a correct answer,
  // down on a wrong one, then draw the nearest-difficulty unused question.
  function pickNextAdaptive(correct: boolean): AnyQuestion | null {
    diffRef.current = Math.max(1, Math.min(3, diffRef.current + (correct ? 1 : -1)));
    const remaining = adaptivePoolRef.current.filter((q) => !usedRef.current.has(q.id));
    if (remaining.length === 0) return null;
    let best: AnyQuestion[] = [];
    let bestDist = Infinity;
    for (const q of remaining) {
      const dist = Math.abs(q.difficulty - diffRef.current);
      if (dist < bestDist) { best = [q]; bestDist = dist; }
      else if (dist === bestDist) best.push(q);
    }
    const next = best[Math.floor(Math.random() * best.length)];
    usedRef.current.add(next.id);
    return next;
  }

  if (pool === null) {
    return <main className="min-h-screen" style={{ background: "var(--bg)" }} />;
  }

  if (pool.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>
            {mode === "weak"
              ? "Нямаш още отбелязани грешки на това устройство. Реши няколко теста и се върни."
              : "Няма въпроси за тази категория."}
          </p>
          <button onClick={() => router.push("/practice")} style={{ color: "var(--accent-link)", cursor: "pointer", background: "transparent", border: "none" }}>← Към тестовете</button>
        </div>
      </main>
    );
  }

  const current  = pool[index];
  const progress = ((index + 1) / targetLen) * 100;
  const isCl     = isClosed(current);
  const isShort  = !isCl && current.type === "short_answer";
  const isOpen   = !isCl && current.type === "open_response";

  function recordAnswer(correct: boolean, extra?: Partial<QuizAnswer>) {
    const newAnswers: QuizAnswer[] = [...answers, { questionId: current.id, correct, ...extra }];
    setAnswers(newAnswers);
    setQState("answered");
    if (adaptive && newAnswers.length < targetLen) {
      const nq = pickNextAdaptive(correct);
      if (nq) setPool((p) => (p ? [...p, nq] : p));
    } else if (newAnswers.length >= targetLen) {
      sessionStorage.setItem("quizResults", JSON.stringify({ answers: newAnswers, questions: pool }));
    }
  }

  function next() {
    if (index + 1 >= targetLen) {
      router.push("/results");
    } else {
      setIndex((i) => i + 1);
      setQState("answering");
      setSelIdx(null);
      setText("");
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--bg)" }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Progress bar row */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: "var(--font-ibm-mono), monospace", color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.08em" }}>
            {String(index + 1).padStart(2, "0")} / {String(targetLen).padStart(2, "0")}
            {mode === "weak" && <span style={{ marginLeft: 10, color: "var(--red)" }}>· СЛАБИ МЕСТА</span>}
            {adaptive && <span style={{ marginLeft: 10, color: "var(--red)" }}>· АДАПТИВЕН</span>}
          </span>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-ibm-mono), monospace", color: "var(--muted)", fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {isCl ? "Затворен" : isShort ? "Кратък отговор" : "Открит отговор"}
            </span>
            <button
              onClick={() => router.push("/practice")}
              title="Изход от теста"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                borderRadius: 4,
                padding: "3px 11px",
                fontFamily: "var(--font-ibm-mono), monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              ИЗХОД
            </button>
          </div>
        </div>
        <div
          className="rounded-full mb-8 overflow-hidden"
          style={{ height: 3, background: "var(--track-bg)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--progress-gradient)" }}
          />
        </div>

        {/* Question card */}
        <div
          className="glass rounded p-7 mb-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <p
            className="font-medium leading-relaxed whitespace-pre-line"
            style={{ color: "var(--text)", fontSize: "1.02rem" }}
          >
            {current.question}
          </p>
        </div>

        {/* ── Closed ── */}
        {isCl && (
          <>
            <div className="space-y-2.5 mb-5">
              {current.options.map((opt, i) => {
                const isSelected = selIdx === i;

                let bg = "rgba(255,255,255,0.04)";
                let border = "var(--border)";
                let color = "var(--muted)";

                if (isSelected) {
                  bg = "var(--option-selected-bg)"; border = "var(--option-selected-border)"; color = "var(--option-selected-text)";
                }

                return (
                  <button
                    key={i}
                    onClick={() => setSelIdx(i)}
                    className="w-full text-left px-4 py-3.5 rounded text-sm font-medium transition-all"
                    style={{ background: bg, border: `1px solid ${border}`, color, cursor: "pointer" }}
                  >
                    <span
                      className="inline-flex items-center justify-center mr-3 rounded-lg text-xs font-bold"
                      style={{ width: 26, height: 26, background: "var(--label-bg)", verticalAlign: "middle" }}
                    >
                      {LABELS[i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (selIdx === null) return;
                const correct = selIdx === current.correctIndex;
                const newAnswers: QuizAnswer[] = [...answers, { questionId: current.id, correct, selectedIndex: selIdx }];
                setAnswers(newAnswers);
                if (newAnswers.length >= targetLen) {
                  sessionStorage.setItem("quizResults", JSON.stringify({ answers: newAnswers, questions: pool }));
                  router.push("/results");
                } else {
                  if (adaptive) {
                    const nq = pickNextAdaptive(correct);
                    if (nq) setPool((p) => (p ? [...p, nq] : p));
                  }
                  setIndex((i) => i + 1);
                  setQState("answering");
                  setSelIdx(null);
                  setText("");
                }
              }}
              disabled={selIdx === null}
              className="w-full py-4 rounded font-bold text-white transition-all disabled:opacity-30"
              style={{ background: "var(--btn-gradient-wide)", boxShadow: selIdx !== null ? "var(--accent-glow)" : "none" }}
            >
              {index + 1 >= targetLen ? "Виж резултатите →" : "Следващ въпрос →"}
            </button>
          </>
        )}

        {/* ── Short answer ── */}
        {isShort && (
          <>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && qState === "answering" && text.trim()) {
                  const correct = current.acceptedAnswers.some(
                    (a) => a.trim().toLowerCase() === text.trim().toLowerCase()
                  );
                  recordAnswer(correct, { textAnswer: text });
                }
              }}
              disabled={qState !== "answering"}
              placeholder="Напиши отговора си..."
              className="w-full rounded px-4 py-3.5 text-sm mb-5 focus:outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />

            {qState === "answering" ? (
              <button
                onClick={() => {
                  if (!text.trim()) return;
                  const correct = current.acceptedAnswers.some(
                    (a) => a.trim().toLowerCase() === text.trim().toLowerCase()
                  );
                  recordAnswer(correct, { textAnswer: text });
                }}
                disabled={!text.trim()}
                className="w-full py-4 rounded font-bold text-white transition-all disabled:opacity-30"
                style={{ background: "var(--btn-gradient)", boxShadow: text.trim() ? "var(--accent-glow)" : "none" }}
              >
                Провери
              </button>
            ) : (
              <button onClick={next} className="w-full py-4 rounded font-bold text-white" style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)" }}>
                {index + 1 >= targetLen ? "Виж резултатите →" : "Следващ въпрос →"}
              </button>
            )}
          </>
        )}

        {/* ── Open response ── */}
        {isOpen && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={qState !== "answering"}
              placeholder="Напиши отговора си тук..."
              rows={5}
              className="w-full rounded px-4 py-3.5 text-sm mb-4 focus:outline-none resize-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />

            {qState === "answering" ? (
              <button
                onClick={() => { if (text.trim()) recordAnswer(true, { textAnswer: text }); }}
                disabled={!text.trim()}
                className="w-full py-4 rounded font-bold text-white transition-all disabled:opacity-30"
                style={{ background: "var(--btn-gradient)", boxShadow: text.trim() ? "var(--accent-glow)" : "none" }}
              >
                Напред
              </button>
            ) : (
              <button onClick={next} className="w-full py-4 rounded font-bold text-white" style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)" }}>
                {index + 1 >= targetLen ? "Виж резултатите →" : "Следващ въпрос →"}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function SoloQuizPage() {
  return (
    <Suspense>
      <QuizContent />
    </Suspense>
  );
}
