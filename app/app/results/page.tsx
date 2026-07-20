"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnyQuestion, QuizAnswer } from "@/lib/types";
import { isClosed } from "@/lib/types";
import { awardPoints, addBonusPoints, REWARDS, type AwardResult } from "@/lib/gamification";
import { recordAnswers } from "@/app/profile/actions";
import { recordAnswerStats } from "@/lib/history";
import { applyQuizToDaily, DAILY_BONUS, type DailyChallenge } from "@/lib/dailyChallenge";

const TOPIC_LABELS: Record<string, string> = {
  "обработка-анализ": "Обработка и Анализ на Данни",
  "мултимедия":       "Мултимедия",
  "уеб-дизайн":       "Уеб Дизайн",
  "решаване-икт":     "Решаване на проблеми с ИКТ",
};

interface StoredResults {
  answers: QuizAnswer[];
  questions: AnyQuestion[];
}

export default function ResultsPage() {
  const [data, setData]         = useState<StoredResults | null>(null);
  const [award, setAward]       = useState<AwardResult | null>(null);
  const [daily, setDaily]       = useState<{ challenge: DailyChallenge; justCompleted: boolean } | null>(null);
  const scoredRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizResults");
    if (!raw) return;
    const parsed: StoredResults = JSON.parse(raw);
    setData(parsed);

    // Award points & record answers exactly once (guard against the dev
    // double-invoke of effects and accidental re-runs).
    if (scoredRef.current) return;
    scoredRef.current = true;
    const correct = parsed.answers.filter((a) => a.correct).length;
    setAward(awardPoints(correct));
    // Save per-question results to the account (no-op if not logged in).
    recordAnswers(parsed.answers.map((a) => ({ questionId: a.questionId, correct: a.correct })));
    // Local answer history (weak spots + adaptive difficulty).
    recordAnswerStats(parsed.answers.map((a) => ({ questionId: a.questionId, correct: a.correct })));
    // Daily challenge progress; flat bonus on the run that completes it.
    const d = applyQuizToDaily(parsed.answers, parsed.questions);
    if (d.justCompleted) addBonusPoints(DAILY_BONUS);
    setDaily({ challenge: d.challenge, justCompleted: d.justCompleted });
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>Няма запазени резултати.</p>
          <Link href="/" style={{ color: "var(--accent-link)" }}>← Към началото</Link>
        </div>
      </main>
    );
  }

  const { answers, questions } = data;
  const total   = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const pct     = Math.round((correct / total) * 100);

  const topicMap = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const ans = answers.find((a) => a.questionId === q.id);
    if (!ans) continue;
    const entry = topicMap.get(q.topic) ?? { correct: 0, total: 0 };
    entry.total++;
    if (ans.correct) entry.correct++;
    topicMap.set(q.topic, entry);
  }

  const wrong = answers
    .filter((a) => !a.correct)
    .map((a) => ({ answer: a, question: questions.find((q) => q.id === a.questionId)! }))
    .filter((x) => x.question);

  const grade =
    pct >= 88 ? "Отличен (6)"    :
    pct >= 72 ? "Много добър (5)":
    pct >= 50 ? "Добър (4)"      :
    pct >= 30 ? "Среден (3)"     : "Слаб (2)";

  const gradeColor =
    pct >= 72 ? "#4ade80" :
    pct >= 50 ? "#fbbf24" : "#f87171";

  const arc    = 2 * Math.PI * 54;
  const offset = arc - (pct / 100) * arc;

  return (
    <>
      <main className="relative z-10 max-w-xl mx-auto px-6 py-16">
        <h1
          className="font-extrabold text-center mb-10"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--text)" }}
        >
          <span className="gradient-text">Резултати</span>
        </h1>

        {/* Score ring */}
        <div
          className="glass rounded-3xl p-8 text-center mb-6 flex flex-col items-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <div style={{ position: "relative", width: 130, height: 130 }}>
            <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={65} cy={65} r={54} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
              <circle
                cx={65} cy={65} r={54} fill="none"
                stroke={gradeColor} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={arc} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div
              className="font-extrabold"
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", color: gradeColor }}
            >
              {pct}%
            </div>
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 16 }}>
            {correct} / {total} верни отговора
          </div>
          <div className="font-bold mt-1" style={{ color: gradeColor, fontSize: "1.1rem" }}>
            {grade}
          </div>
        </div>

        {/* Points earned */}
        {award && (
          <div
            className="glass rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
            style={{ border: "1px solid var(--accent-border)" }}
          >
            <div>
              <div className="font-semibold" style={{ color: "var(--text)", fontSize: "0.95rem" }}>
                +{award.earned + award.streakBonus} точки спечелени
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 2 }}>
                {award.earned} за верни отговори
                {award.streakBonus > 0 && ` · +${award.streakBonus} серия бонус`}
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: "1.4rem", color: award.newStreak >= 2 ? "var(--streak-text)" : "var(--muted)" }}>
                {award.newStreak >= 2 ? award.newStreak : "—"}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                {award.newStreak >= 2 ? "дни серия" : "серия"}
              </div>
            </div>
          </div>
        )}

        {/* Daily challenge completed */}
        {daily?.justCompleted && (
          <div
            className="glass rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
            style={{ border: "1px solid var(--correct-border)" }}
          >
            <div>
              <div className="font-semibold" style={{ color: "var(--correct-text)", fontSize: "0.95rem" }}>
                Дневно предизвикателство изпълнено
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 2 }}>
                {daily.challenge.label}
              </div>
            </div>
            <div
              style={{ fontFamily: "var(--font-ibm-mono), monospace", fontWeight: 700, fontSize: "1.2rem", color: "var(--correct-text)" }}
            >
              +{DAILY_BONUS}
            </div>
          </div>
        )}

        {/* Newly unlocked rewards */}
        {award && award.newlyUnlocked.length > 0 && (
          <div className="mb-6 space-y-3">
            {award.newlyUnlocked.map((i) => (
              <div
                key={i}
                className="glass rounded-2xl px-5 py-4"
                style={{ border: "1px solid var(--reward-border)", background: "var(--reward-bg)" }}
              >
                <div className="font-semibold mb-1" style={{ color: "var(--reward-text)" }}>
                  Отключен нов съвет
                </div>
                <div style={{ color: "var(--text)", fontSize: "0.9rem" }}>
                  {REWARDS[i].tip}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Per-topic */}
        <h2 className="font-semibold mb-4" style={{ color: "var(--text)", fontSize: "1rem" }}>
          По теми
        </h2>
        <div className="space-y-2 mb-10">
          {Array.from(topicMap.entries()).map(([topic, stats]) => {
            const tp = Math.round((stats.correct / stats.total) * 100);
            const c  = tp >= 60 ? "#34d399" : "#f87171";
            return (
              <div key={topic} className="glass rounded-2xl px-4 py-3" style={{ border: "1px solid var(--border)" }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ color: "var(--text)", fontSize: "0.85rem", fontWeight: 500 }}>
                    {TOPIC_LABELS[topic] ?? topic}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                    {stats.correct}/{stats.total}
                  </span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${tp}%`, background: c, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Wrong answers */}
        {wrong.length > 0 && (
          <>
            <h2 className="font-semibold mb-4" style={{ color: "var(--text)", fontSize: "1rem" }}>
              Грешни отговори ({wrong.length})
            </h2>
            <div className="space-y-4 mb-10">
              {wrong.map(({ answer, question }) => (
                <div key={question.id} className="glass rounded-2xl p-5 space-y-3" style={{ border: "1px solid var(--border)" }}>
                  <p className="font-medium leading-snug whitespace-pre-line text-sm" style={{ color: "var(--text)" }}>
                    {question.question}
                  </p>
                  <div className="flex gap-2 flex-wrap text-xs">
                    {isClosed(question) ? (
                      <>
                        <span className="rounded-xl px-3 py-1.5" style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)" }}>
                          Твоят: {answer.selectedIndex !== undefined ? question.options[answer.selectedIndex] : "—"}
                        </span>
                        <span className="rounded-xl px-3 py-1.5" style={{ background: "var(--correct-bg)", border: "1px solid var(--correct-border)", color: "var(--correct-text)" }}>
                          Верен: {question.options[question.correctIndex]}
                        </span>
                      </>
                    ) : (
                      <>
                        {answer.textAnswer && (
                          <span className="rounded-xl px-3 py-1.5" style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)" }}>
                            Твоят: {answer.textAnswer}
                          </span>
                        )}
                        <span className="rounded-xl px-3 py-1.5" style={{ background: "var(--correct-bg)", border: "1px solid var(--correct-border)", color: "var(--correct-text)" }}>
                          Верен: {question.modelAnswer}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    <span className="font-semibold" style={{ color: "var(--accent-2-text)" }}>Обяснение:</span>{" "}
                    {question.explanation}
                  </p>
                  {isClosed(question) && (
                    <Link href={`/question/${question.id}`} className="text-xs font-medium" style={{ color: "var(--accent-link)", textDecoration: "none" }}>
                      Виж въпроса →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Link
            href="/practice"
            className="flex-1 text-center py-3.5 rounded-2xl font-semibold text-white"
            style={{ background: "var(--hero-gradient)", boxShadow: "var(--accent-glow)", textDecoration: "none" }}
          >
            Нова практика
          </Link>
          <Link
            href="/rewards"
            className="flex-1 text-center py-3.5 rounded-2xl font-semibold glass"
            style={{ color: "var(--text)", textDecoration: "none" }}
          >
            Награди
          </Link>
        </div>
      </main>
    </>
  );
}
