"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { submitResult } from "../../actions";

const LABELS = ["А", "Б", "В", "Г"];

interface ClosedQ { id: string; question: string; options: string[]; }
interface OpenQ { id: string; question: string; }

export default function PlayQuiz({
  code,
  title,
  seconds,
  closed,
  open,
}: {
  code: string;
  title: string;
  seconds: number;
  closed: ClosedQ[];
  open: OpenQ[];
}) {
  const [phase, setPhase] = useState<"name" | "playing" | "done">("name");
  const [name, setName] = useState("");
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [closedAns, setClosedAns] = useState<Record<string, number>>({});
  const [openAns, setOpenAns] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  const total = closed.length + open.length;
  const answeredCount =
    Object.keys(closedAns).length + Object.values(openAns).filter((v) => v.trim()).length;

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const res = await submitResult(code, name, { closed: closedAns, open: openAns });
    if ("error" in res) {
      setError(res.error);
      submittingRef.current = false;
      return;
    }
    setResult(res);
    setPhase("done");
  }, [code, name, closedAns, openAns]);

  // Countdown timer while playing; auto-submit at zero.
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      submit();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, submit]);

  const mm = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, timeLeft) % 60).padStart(2, "0");

  // ── Name entry ──
  if (phase === "name") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ color: "var(--text)" }}>
        <div className="glass rounded-2xl p-7 w-full max-w-sm" style={{ border: "1px solid var(--border)" }}>
          <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>Тест</p>
          <h1 className="font-extrabold text-xl mb-1">{title}</h1>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
            {total} въпроса · {Math.round(seconds / 60)} мин
          </p>
          <label className="flex flex-col gap-1 text-sm mb-4">
            <span style={{ color: "var(--muted)" }}>Твоето име</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus
              className="rounded-xl px-4 py-2.5 focus:outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </label>
          <button
            onClick={() => name.trim() && setPhase("playing")}
            disabled={!name.trim()}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)", cursor: "pointer" }}
          >
            Започни теста
          </button>
          <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
            Времето тръгва щом натиснеш.
          </p>
        </div>
      </main>
    );
  }

  // ── Result ──
  if (phase === "done" && result) {
    const pct = result.maxScore ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ color: "var(--text)" }}>
        <div className="glass rounded-2xl p-8 w-full max-w-sm" style={{ border: "1px solid var(--border)" }}>
          <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>Готово, {name}!</p>
          <div className="font-extrabold mb-2" style={{ fontSize: "3rem", color: pct >= 70 ? "var(--green)" : pct >= 40 ? "#fbbf24" : "var(--red)" }}>
            {pct}%
          </div>
          <p className="mb-6" style={{ color: "var(--muted)" }}>
            {result.score} от {result.maxScore} верни
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Резултатът е изпратен на учителя.</p>
          <Link href="/" className="inline-block mt-5 text-sm" style={{ color: "var(--accent)" }}>
            Към началото
          </Link>
        </div>
      </main>
    );
  }

  // ── Playing ──
  const lowTime = timeLeft <= 30;
  return (
    <main className="min-h-screen px-4 py-20" style={{ color: "var(--text)" }}>
      {/* Sticky timer bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <span className="text-sm font-medium truncate" style={{ color: "var(--muted)", maxWidth: "50%" }}>{title}</span>
        <span className="font-mono font-bold" style={{ fontSize: "1.1rem", color: lowTime ? "var(--red)" : "var(--accent-2-text)" }}>
          ⏱ {mm}:{ss}
        </span>
      </div>

      <div className="max-w-xl mx-auto flex flex-col gap-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)" }}>
            {error}
          </div>
        )}

        {closed.map((q, qi) => (
          <div key={q.id} className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
            <p className="font-medium mb-3 whitespace-pre-line">
              <span style={{ color: "var(--muted)" }}>{qi + 1}. </span>{q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const on = closedAns[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setClosedAns((a) => ({ ...a, [q.id]: i }))}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      background: on ? "var(--option-selected-bg)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${on ? "var(--option-selected-border)" : "var(--border)"}`,
                      color: on ? "var(--option-selected-text)" : "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <span className="inline-flex items-center justify-center mr-2 rounded-lg text-xs font-bold"
                      style={{ width: 24, height: 24, background: "var(--label-bg)" }}>{LABELS[i]}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {open.map((q, qi) => (
          <div key={q.id} className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
            <p className="font-medium mb-3 whitespace-pre-line">
              <span style={{ color: "var(--muted)" }}>{closed.length + qi + 1}. </span>{q.question}
            </p>
            <input
              type="text"
              value={openAns[q.id] ?? ""}
              onChange={(e) => setOpenAns((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Твоят отговор..."
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
        ))}

        <button
          onClick={submit}
          className="rounded-2xl px-4 py-4 font-bold text-white"
          style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)", cursor: "pointer" }}
        >
          Предай теста ({answeredCount}/{total} отговорени)
        </button>
      </div>
    </main>
  );
}
