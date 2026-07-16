"use client";

import { useState } from "react";
import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";
import type { AnyQuestion } from "@/lib/types";
import { isClosed } from "@/lib/types";
import { QUIZ_TOPICS } from "@/lib/quiz";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";
const DECK_SIZE = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(topic: string | null): AnyQuestion[] {
  const all: AnyQuestion[] = [...questions, ...openQuestions];
  const pool = topic ? all.filter((q) => q.topic === topic) : all;
  return shuffle(pool).slice(0, DECK_SIZE);
}

function answerOf(q: AnyQuestion): string {
  return isClosed(q) ? q.options[q.correctIndex] : q.modelAnswer;
}

const monoLabel = { fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--muted)" };

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<AnyQuestion[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [total, setTotal] = useState(0);

  function start(topic: string | null) {
    const d = buildDeck(topic);
    setDeck(d);
    setTotal(d.length);
    setKnown(0);
    setRepeats(0);
    setFlipped(false);
  }

  // ── Setup screen ──
  if (deck === null) {
    return (
      <main className="min-h-screen max-w-xl mx-auto px-6 py-16">
        <Link href="/practice" className="inline-flex items-center gap-2 mb-8"
          style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ← Тестове
        </Link>
        <h1 className="mb-2" style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
          Флашкарти
        </h1>
        <p className="mb-10" style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Бързо повторение: виж въпроса, отговори си наум, обърни картата.
          Картите, които не знаеш, се връщат в тестето, докато ги научиш.
        </p>
        <div className="space-y-3">
          <button onClick={() => start(null)}
            className="w-full text-left glass p-5 relative transition-colors hover:bg-[rgba(236,230,216,0.04)]"
            style={{ border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer" }}>
            <span className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: "var(--red)" }} />
            <div style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "1.05rem" }}>Всички теми</div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 2 }}>{DECK_SIZE} случайни карти от цялата програма</div>
          </button>
          {QUIZ_TOPICS.map((t) => (
            <button key={t.id} onClick={() => start(t.id)}
              className="w-full text-left glass p-5 relative transition-colors hover:bg-[rgba(236,230,216,0.04)]"
              style={{ border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer" }}>
              <span className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: "var(--paper)" }} />
              <div style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "1.05rem" }}>{t.label}</div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ── Done screen ──
  if (deck.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center" style={{ maxWidth: 420 }}>
          <div className="stamp mx-auto mb-8" style={{ display: "inline-block" }}>Тесте завършено</div>
          <h1 className="mb-3" style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "1.8rem" }}>
            Научи {known} {known === 1 ? "карта" : "карти"}
          </h1>
          <p className="mb-8" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {repeats > 0
              ? `${repeats} ${repeats === 1 ? "карта се върна" : "карти се върнаха"} в тестето, преди да ги научиш.`
              : "Всички карти от първия опит — отлично."}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setDeck(null)}
              className="w-full py-3.5 transition-opacity hover:opacity-90"
              style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, borderRadius: 5, border: "none", cursor: "pointer" }}>
              Ново тесте
            </button>
            <Link href="/practice" className="w-full py-3.5 text-center"
              style={{ border: "1px solid var(--border)", color: "var(--muted)", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 5, textDecoration: "none" }}>
              Към тестовете
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Card screen ──
  const card = deck[0];
  const isCl = isClosed(card);

  function markKnown() {
    setKnown((k) => k + 1);
    setDeck((d) => (d ? d.slice(1) : d));
    setFlipped(false);
  }

  function markUnknown() {
    setRepeats((r) => r + 1);
    setDeck((d) => (d ? [...d.slice(1), d[0]] : d));
    setFlipped(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* header row */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.08em" }}>
            ОСТАВАТ {String(deck.length).padStart(2, "0")} · НАУЧЕНИ {String(known).padStart(2, "0")}
          </span>
          <button onClick={() => setDeck(null)} title="Изход"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 4, padding: "3px 11px", fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            ИЗХОД
          </button>
        </div>
        <div className="mb-8 overflow-hidden" style={{ height: 3, borderRadius: 2, background: "var(--track-bg)" }}>
          <div style={{ width: `${(known / total) * 100}%`, height: "100%", background: "var(--red)", transition: "width 0.4s ease" }} />
        </div>

        {/* the card */}
        <button
          onClick={() => setFlipped((f) => !f)}
          className="w-full text-left glass p-7 mb-4 transition-transform"
          style={{
            border: `1px solid ${flipped ? "var(--green)" : "var(--border)"}`,
            borderRadius: 4,
            minHeight: 220,
            cursor: "pointer",
            transform: flipped ? "rotate(0.4deg)" : "rotate(-0.4deg)",
          }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <span style={monoLabel}>{flipped ? "Отговор" : "Въпрос"}</span>
            <span style={{ ...monoLabel, color: flipped ? "var(--green)" : "var(--muted)" }}>
              {flipped ? "обърни обратно" : "докосни за отговор"}
            </span>
          </div>
          {!flipped ? (
            <p className="font-medium leading-relaxed whitespace-pre-line" style={{ color: "var(--text)", fontSize: "1.02rem" }}>
              {card.question}
            </p>
          ) : (
            <>
              <p className="leading-relaxed whitespace-pre-line" style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "1.05rem" }}>
                {answerOf(card)}
              </p>
              <p className="mt-4 leading-relaxed" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {card.explanation}
              </p>
            </>
          )}
        </button>

        {/* actions */}
        {flipped ? (
          <div className="flex gap-3">
            <button onClick={markUnknown}
              className="flex-1 py-4 transition-colors"
              style={{ background: "transparent", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)", fontWeight: 600, borderRadius: 5, cursor: "pointer" }}>
              Не я знам
            </button>
            <button onClick={markKnown}
              className="flex-1 py-4 transition-opacity hover:opacity-90"
              style={{ background: "var(--green)", border: "none", color: "var(--paper)", fontWeight: 600, borderRadius: 5, cursor: "pointer" }}>
              Знам я
            </button>
          </div>
        ) : (
          <button onClick={() => setFlipped(true)}
            className="w-full py-4 transition-opacity hover:opacity-90"
            style={{ background: "var(--red)", border: "none", color: "var(--paper)", fontWeight: 600, borderRadius: 5, cursor: "pointer" }}>
            Покажи отговора
          </button>
        )}
      </div>
    </main>
  );
}
