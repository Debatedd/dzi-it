"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ParallaxOrbs from "@/components/ParallaxOrbs";

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

  return (
    <>
      <ParallaxOrbs />
      <main className="relative z-10 max-w-xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← Начало
        </Link>

        <h1
          className="font-extrabold text-center mb-2"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "var(--text)" }}
        >
          <span className="gradient-text">Обратна връзка</span>
        </h1>
        <p className="text-center mb-10" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Споделяй идеи, сигнализирай за грешки или предлагай подобрения
        </p>

        {/* Form */}
        <div
          className="glass rounded-2xl p-6 mb-10 space-y-4"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Category */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              Категория
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={
                    category === c
                      ? { background: "var(--btn-gradient)", color: "#fff", border: "1px solid transparent" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--muted)" }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              Съобщение
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Напиши своето мнение, идея или докладвай проблем..."
              rows={5}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {submitted ? (
            <div
              className="rounded-xl px-4 py-3 text-sm font-semibold text-center"
              style={{ background: "var(--correct-bg)", border: "1px solid var(--correct-border)", color: "var(--correct-text)" }}
            >
              Благодаря! Обратната връзка е записана.
            </div>
          ) : (
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-30"
              style={{
                background: "var(--btn-gradient)",
                boxShadow: text.trim() ? "var(--accent-glow)" : "none",
              }}
            >
              Изпрати
            </button>
          )}
        </div>

        {/* Past entries */}
        {entries.length > 0 && (
          <>
            <h2 className="font-semibold mb-4" style={{ color: "var(--text)", fontSize: "0.95rem" }}>
              Твоите записи ({entries.length})
            </h2>
            <div className="space-y-3">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="glass rounded-xl px-4 py-3 space-y-1"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: "var(--option-selected-bg)", color: "var(--option-selected-text)" }}
                    >
                      {e.category}
                    </span>
                    <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>{e.date}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {e.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
