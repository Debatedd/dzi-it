"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

interface FeedbackEntry {
  id: string;
  text: string;
  category: string;
  date: string;
}

const CATEGORIES = ["Предложение", "Грешка / бъг", "Въпрос", "Друго"];
const KEY = "dziFeedback";
const FORMSPREE = "https://formspree.io/f/mlgkoekj";

export default function FeedbackPage() {
  const [text, setText]         = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [entries, setEntries]   = useState<FeedbackEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  async function submit() {
    if (!text.trim()) return;
    const entry: FeedbackEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      category,
      date: new Date().toLocaleDateString("bg-BG"),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);

    // Изпращане към Formspree (не блокира UI при грешка)
    try {
      await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ категория: entry.category, съобщение: entry.text, дата: entry.date }),
      });
    } catch {}
  }

  const labelStyle = { display: "block", color: "var(--muted)", fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 8 };

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-2 mb-8"
        style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        ← Начало
      </Link>

      <h1 className="text-center mb-2" style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
        Обратна връзка
      </h1>
      <p className="text-center mb-10" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Споделяй идеи, сигнализирай за грешки или предлагай подобрения
      </p>

      {/* Form */}
      <div className="glass p-6 mb-10 space-y-5" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
        {/* Category */}
        <div>
          <label style={labelStyle}>Категория</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="transition-colors"
                style={
                  category === c
                    ? { background: "var(--red)", color: "var(--paper)", border: "1px solid var(--red)", borderRadius: 4, padding: "7px 14px", fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.06em", cursor: "pointer" }
                    : { background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 4, padding: "7px 14px", fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.06em", cursor: "pointer" }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div>
          <label style={labelStyle}>Съобщение</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напиши своето мнение, идея или докладвай проблем..."
            rows={5}
            className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)" }}
          />
        </div>

        {submitted ? (
          <div className="px-4 py-3 text-sm font-semibold text-center"
            style={{ background: "var(--correct-bg)", border: "1px solid var(--correct-border)", color: "var(--correct-text)", borderRadius: 4 }}>
            Благодаря! Обратната връзка е записана.
          </div>
        ) : (
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="w-full py-3.5 font-semibold transition-opacity disabled:opacity-30"
            style={{ background: "var(--red)", color: "var(--paper)", borderRadius: 5 }}
          >
            Изпрати
          </button>
        )}
      </div>

      {/* Past entries */}
      {entries.length > 0 && (
        <>
          <h2 className="mb-4" style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Твоите записи ({entries.length})
          </h2>
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="glass px-4 py-3 space-y-1.5" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: MONO, fontSize: "0.64rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, border: "1px solid var(--accent-border)", color: "var(--option-selected-text)" }}>
                    {e.category}
                  </span>
                  <span style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.7rem" }}>{e.date}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{e.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
